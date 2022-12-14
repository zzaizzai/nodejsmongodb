module.exports = function (app) {

    var route = require('express').Router();
    const { ObjectID } = require('bson');
    const Service = require('./Service')

    route.get('/', (req, res) => {
        var search = req.query?.search ?? ""


        var condition = [
            {
                $match:
                {
                    $or: [{
                        title: { $regex: search },
                    }],
                }
            },
            { $sort: {create_datetime: -1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "user_uid",
                    foreignField: "_id",
                    as: "userInfo"
                },
            },
            { $unwind: "$userInfo" },
        ]

        app.db.collection("requests").aggregate(condition).sort({ create_datetime: -1 }).toArray((err, result) => {
            // console.log(result)

            res.render('./requests/requests.ejs', { requests: result, search_text: search, sort: "" })


        })

    })


    route.get('/:request_uid', (req, res) => {
        var request_uid = req.params.request_uid
        if (request_uid.length == 24) {
            request_uid = ObjectID(request_uid)
        }

        var pipeline_requests = [
            {
                $match: { _id: request_uid }

            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_uid",
                    foreignField: "_id",
                    as: "userInfo"
                },
            },
            {
                $unwind: "$userInfo"
            }
        ]


        app.db.collection("requests").aggregate(pipeline_requests).toArray((err, result_requests_list) => {

            var result_req = result_requests_list[0]
            var pipeline_comments = [
                {
                    $match: { "parent_uid": ObjectID(result_req._id) }

                },
                {
                    $lookup: {
                        from: "users",
                        localField: "user_uid",
                        foreignField: "_id",
                        as: "userInfo"
                    },
                },
                {
                    $unwind: "$userInfo"
                }
            ]

            var status_msg = Service.status_request(result_req.create_datetime, result_req.due_date)

            var who_did_user_id = ""
            if (result_req.is_done_datetime) {

                status_msg.status = "completed"

                who_did_user_id = ObjectID(result_req.is_done_by_who)

            }

            app.db.collection("users").findOne({ _id: who_did_user_id }, (err, result_who_did_user) => {

                const who_did_user_name = result_who_did_user?.user_name

                if (result_req.is_done_datetime) {
                    status_msg.status_msg = `Completed by ${who_did_user_name} ${result_req?.create_datetime}`
                }

                app.db.collection('comments').aggregate(pipeline_comments).toArray(function (err, result_comments) {
                    res.render('./requests/requests_detail.ejs',
                        { request: result_req, comments: result_comments, status_msg: status_msg })
                })



            })

        })
    })


    route.get('/mode/add', Service.is_login, (req, res) => {
        var work_uid = req.query.work_uid
        console.log(work_uid)
        if (work_uid == undefined) {
            res.redirect('/works')
            return
        } else if (work_uid.length == 24) {
            work_uid = ObjectID(work_uid)
        }

        app.db.collection("works").findOne({ _id: work_uid }, (err, result) => {
            console.log(result)
            if (!result) {
                res.redirect('/requests')
                return

            }
            app.db.collection("departments").find().toArray((err, result_dep) => {
                const departments = result_dep
                res.render('./requests/requests_add.ejs', { work: result, departments: departments })
            })

        })



    })

    route.get('/:request_uid/edit', (req, res) => {
        var request_uid = req.params.request_uid

        try {
            request_uid = ObjectID(request_uid)
        }
        catch {
            res.redirect('/requests')
            return

        }

        app.db.collection("requests").findOne({ _id: request_uid }, (err, result_req) => {
            app.db.collection("users").findOne({ _id: result_req.user_uid }, (err, result_user) => {
                app.db.collection("departments").find().toArray((err, department_list) => {
                    if (result_req && result_user) {
                        res.render('./requests/requests_edit.ejs', { request: result_req, user: result_user, department_list: department_list })
                    } else {
                        res.redirect('/requests')
                    }

                })

            })



        })


    })

    // route.get('/:req_id/add_report', (req, res) => {

    //     try {
    //         var req_id = req.params.req_id;
    //         req_id = ObjectID(req_id)

    //         app.db.collection("requests").findOne({ _id: req_id }, (err, result) => {
    //             console.log(result)
    //             res.render('./requests/requests_add_report.ejs', { request: result })
    //         })
    //     }

    //     catch {
    //         res.redirect('/requests')
    //     }



    // })
    // route.post('/add_report', (req, res) => {
    //     var data = req.body


    //     const work_uid = ObjectID(data.work_uid)
    //     const req_uid = ObjectID(data.req_uid)

    //     console.log(data)
    //     for (var i = 0; i < data.method.length; i++) {
    //         var method = data.method[i]
    //         var condition = data.condition[i]
    //         var value = data.value[i]

    //         console.log(method, condition, value)
    //     }

    //     res.send("ddd")
    // })

    route.post('/add', (req, res) => {
        console.log(req.body)
        const user = req.user
        const data = req.body
        const data_input = {
            work_uid: ObjectID(data.work_uid),
            title: data.title,
            text: data.text,
            to_department: data.to_department,
            user_uid: ObjectID(user._id),
            create_datetime: Service.datetime_now(),
            due_date: data.due_date,

        }
        console.log(data_input)
        req.app.db.collection("requests").insertOne(data_input, (err, result) => {
            if (err) {
                res.send({ "error": err })
                return
            }
            console.log(result)
            res.send({ "message": "success" })
        })
    })



    route.post('/end', (req, res) => {

        const status = req.body.status;
        const request_id = ObjectID(req.body.request_id) ?? ""
        console.log(request_id)

        const did_user_id = req.user?._id

        if (did_user_id == undefined) {
            res.send({ err: "please login" })
            return
        }

        if (status == "completed") {
            res.send({ err: "it is already completed" })
            return
        }

        try {
            app.db.collection("requests").updateMany({ _id: request_id },
                {
                    $set: {
                        is_done_by_who: did_user_id,
                        is_done_datetime: Service.datetime_now()
                    }
                })

            res.send({ success: "good" })
        }
        catch {
            res.send({ err: "something error" })
        }






    })
    route.post('/edit', (req, res) => {
        const data = req.body
        try {
            app.db.collection("requests").updateOne({ _id: ObjectID(data._id) },
                {
                    $set: {
                        title: data.title,
                        due_date: data.due_date,
                        to_department: data.to_department,
                        text: data.text
                    }
                })
            res.send({ "message": "good" })
        }
        catch {
            res.send({ "err": "something wrong" })
        }
    })

    return route
}