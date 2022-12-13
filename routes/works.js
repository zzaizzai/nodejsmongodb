const { ObjectID } = require('bson');

module.exports = function (app) {
    var router = require('express').Router();
    const Service = require('./Service')

    router.get('/', function (req, res) {
        var search = req.query.search
        if (search != undefined) {
            console.log('q ', search)
        } else {
            search = ""
        }

        // to do sort 
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

        app.db.collection("works").aggregate(condition).toArray((err, result) => {
            console.log(result)

            res.render('./works/works.ejs', { works: result, search_text: search })


        })
    })

    router.get('/data/get_my_works_with_user_uid', function (req, res) {
        if (req.user == undefined) {
            res.send({ my_works: null })
            return
        }

        var search = req.user._id

        var condition = [
            {
                $match:
                {
                    user_uid: ObjectID(search)
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

        app.db.collection("works").aggregate(condition).toArray((err, result) => {
            console.log(result)

            // res.render('./works/works.ejs', { works: result, search_text: search })

            res.send({ my_works: result })
        })
    })


    router.get('/:work_uid', function (req, res) {
        var work_uid = req.params.work_uid

        try {
            work_uid = ObjectID(work_uid)
        }
        catch {
            res.send("404")
            return
        }

        var condition = [
            {
                $match:
                {
                    _id: ObjectID(work_uid)
                }
            },
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

        app.db.collection("works").aggregate(condition).toArray((err, result) => {
            result_work = result[0]

            app.db.collection('requests').find({ work_uid: work_uid }).sort({ due_date: 1 }).toArray((err, result_requests) => {


                var condition_2 = [
                    {
                        $match:
                        {
                            "parent_uid": ObjectID(result_work._id)
                        }
                    },
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


                app.db.collection('comments').aggregate(condition_2).toArray((err, result_comments) => {
                    console.log(result_comments)
                    res.render('./works/works_detail.ejs',
                        {
                            work: result_work,
                            user: result_work.userInfo,
                            requests: result_requests,
                            comments: result_comments,
                        })
                })


            })
        })
    })


    router.get('/mode/add', function (req, res) {
        var user_data = req.user
        console.log(user_data)
        if (user_data != undefined) {
            res.render('./works/works_add.ejs', { user: user_data })
        } else {
            res.render('login.ejs', { message: "please login" })
        }
    })

    router.get('/:id/edit', function (req, res) {
        var work_uid = req.params.id
        if (work_uid.length == 24) {
            work_uid = ObjectID(work_uid)
        }
        app.db.collection("works").findOne({ _id: work_uid }, function (err, result) {
            console.log(result)
            if (result) {
                res.render('./works/works_edit.ejs', { work: result })
            } else {
                res.redirect('/works')
            }
        })
    })
    router.post('/edit', function (req, res) {
        console.log(req.body)
        const data = req.body
        app.db.collection("works").updateOne({ _id: ObjectID(data.work_uid) },
            {
                $set: {
                    title: data.title,
                    work_text: data.work_text,
                    due_date: data.due_date
                }
            }, function (err, result) {
                res.status(200).send({ message: "update done" })
            })


    })

    router.post('/add', function (req, res) {
        var work = req.body
        console.log(work)
        var user = req.user
        data = {
            title: work.title,
            due_date: work.dueDate,
            work_text: work.text,
            create_datetime: Service.datetime_now(),
            user_uid: ObjectID(user._id),
        }
        console.log(data)
        app.db.collection('works').insertOne(data, (err, result) => {
            res.redirect('mode/add')
        })

    })
    return router
}