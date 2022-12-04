module.exports = function (app) {

    var route = require('express').Router();
    const { ObjectID } = require('bson');
    const Service = require('./Service')
    route.get('/', (req, res) => {
        app.db.collection('users').find().toArray((err, result) => {
            res.render('users.ejs', { users: result })
        })
    })

    route.get('/mode/add', (req, res) => {

        res.render('users_add.ejs')
    })

    route.get('/:id', (req, res) => {
        user_id = req.params.id
        app.db.collection('users').findOne({ id: user_id }, (err, result) => {
            res.render('./users/users_detail.ejs')
        })
    })

    route.get('/data/:id', (req, res) => {
        user_id = req.params.id
        console.log(user_id)
        app.db.collection('users').findOne({ id: user_id }, (err, result) => {
            delete result.pw
            res.send({ user: result })
        })
    })


    route.post('/signup', (req, res) => {
        console.log(req.body)
        var insert_data = {
            user_name: req.body.user_name,
            id: req.body.id,
            pw: req.body.pw,
            role: "general",
            department: null,
            create_datetime: Service.datetime_now(),
        }
        req.app.db.collection('users').insertOne(insert_data, (err, result) => {
            if (err) {
                console.log(err)
                return
            }
            res.status(200).send({ message: "success" })

        })

    })

    route.get('/:id', function (req, res) {
        req.app.db.collection('users').findOne({ _id: ObjectID(req.params.id) }, (err, result) => {
            console.log(result)
            res.send(result)
        })
    })



    return route
}