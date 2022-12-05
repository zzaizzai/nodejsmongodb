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
                    localField: "user_id",
                    foreignField: "id",
                    as: "unserInfo"
                },
            },
            { $unwind: "$unserInfo" },
        ]

        app.db.collection("works").aggregate(condition).toArray((err, result) => {
            console.log(result)
            if (result.length === 0) {
                res.redirect('/works')
                return
            } else {
                res.render('./works/works.ejs', { works: result })

            }
        })
    })


    router.get('/:work_uid', function (req, res) {
        var work_uid = req.params.work_uid
        if (work_uid.length == 24) {
            work_uid = ObjectID(work_uid)
        }
        app.db.collection('works').findOne({ _id: work_uid }, function (err, result) {
            console.log(result)
            console.log(err)
            if (result) {
                res.render('./works/works_detail.ejs', { work: result })
            } else {
                res.redirect('/works')
            }
        })
    })


    router.get('/mode/add', function (req, res) {
        var user_data = req.user
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
            { $set: { title: data.title, work_text: data.work_text, due_date: data.due_date } }, function (err, result) {
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
            user_id: user.id,
        }
        console.log(data)
        app.db.collection('works').insertOne(data, (err, result) => {
            res.redirect('mode/add')
        })

    })
    return router
}