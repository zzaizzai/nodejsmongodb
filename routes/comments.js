module.exports = function (app) {


    var route = require('express').Router();
    const { ObjectID } = require('bson');
    const Service = require('./Service')

    route.get('/', (req, res) => {
        app.db.collection('comments').find().toArray((err, result) => {
            console.log(result)
            res.send({ result: result })
        })

    })

    route.get('/get_data', (req, res) => {
        console.log(req.query)
        const q = req.query

        app.db.collection("comments").find({request_uid: q.request_uid}).toArray((err, result)=> {
            console.log(result)

            res.send({ comments: result})
        })


        

    })

    route.post('/add', Service.is_login, (req, res) => {
        const data = req.body
        const data_input = {
            user_uid: req.user.user_uid,
            text: data.text,
            create_datetime: Service.datetime_now(),
            request_uid: data.work_uid

        }
        app.db.collection('comments').insertOne(data_input, function (err, result) {
            if (err) {
                res.send({ "error": err })
                return
            }
            res.send({ "message": "success" })
        })
    })

    return route
}