module.exports = function (app) {

    var route = require('express').Router();
    const { ObjectID } = require('bson');
    const Service = require('./Service')

    route.get('/', (req, res) => {

        req.app.db.collection("requests").find().toArray((err, result) => {
            console.log(result)
            res.render('./requests/requests.ejs', { requests: result })
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