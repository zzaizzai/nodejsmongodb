module.exports = function (app) {

    var route = require('express').Router();
    const { ObjectID } = require('bson');
    const Service = require('./Service')

    route.get('/', (req, res) => {
        var search = req.query.search
        console.log(search)
        if (search != undefined) {


        } else {
            search = ""
        }

        console.log(search)
        var sort = req.query.sort
        console.log(sort)

        var condition = [
            {
                $match:
                {
                    title: { $regex: search }
                }
            },
            { $sort: { create_datetime: -1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "user_uid",
                    foreignField: "_id",
                    as: "unserInfo"
                },
            },
            { $unwind: "$unserInfo" },
        ]

        app.db.collection("requests").aggregate(condition).toArray((err, result) => {
            console.log(result)

            res.render('./requests/requests.ejs', { requests: result, search_text: search })


        })

    })


    route.get('/:request_uid', (req, res) => {
        var request_uid = req.params.request_uid
        if (request_uid.length == 24) {
            request_uid = ObjectID(request_uid)
        }

        app.db.collection('requests').findOne({ _id: request_uid }, function (err, result_requests) {
            // app.db.collection('requests').aggregate(pipeline).toArray(function (err, result) {
            request = result_requests
            console.log(request)
            var pipeline_comment = [
                {
                    $match: { "parent_uid": ObjectID(request._id) }

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


            app.db.collection('comments').aggregate(pipeline_comment).toArray(function (err, result_comments) {
                res.render('./requests/requests_detail.ejs', { request: result_requests, comments: result_comments })
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
            if (result) {
                res.render('./requests/requests_add.ejs', { work: result })
            } else {
                res.redirect('/works')
            }
        })



    })


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

    return route
}