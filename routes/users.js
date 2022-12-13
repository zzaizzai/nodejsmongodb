module.exports = function (app) {

    var route = require('express').Router();
    const { ObjectID } = require('bson');
    const Service = require('./Service')

    route.get('/', (req, res) => {

        var role = req.user?.role ?? "general"

        app.db.collection('users').find().sort({create_datetime: -1}).toArray((err, result) => {
            res.render('./users/users.ejs', { users: result, role: role })
        })
    })

    route.get('/mode/add', (req, res) => {

        res.render('./users/users_add.ejs')
    })

    route.get('/:uid',  (req, res) => {

        var role = req.user?.role ?? "general"

        var user_uid = ""
        try {
            user_uid = ObjectID(req.params.uid)
        }
        catch {
            res.redirect('/')
            return
        }
        app.db.collection('users').findOne({ _id: user_uid }, (err, result) => {
            app.db.collection('works').find({ user_uid: result._id }).sort({ due_date: -1 }).toArray((err, work_list) => {
                res.render('./users/users_detail.ejs', { user: result, role: role, work_list: work_list })
            })



        })
    })

    route.get('/:uid/edit', Service.is_login, (req, res) => {

        var role = req.user?.role ?? "general"

        var user_uid = ""
        try {
            user_uid = ObjectID(req.params.uid)
        }
        catch {
            res.redirect('/')
            return
        }
        app.db.collection('users').findOne({ _id: user_uid }, (err, result_user) => {
            app.db.collection('departments').find().toArray((err, department_list) => {
                res.render('./users/users_edit.ejs',
                    { user: result_user, department_list: department_list, role: role })
            })
        })
    })

    route.post('/edit', (req, res) => {
        data = req.body
        console.log(data)

        user_id = data._id
        try {
            var user_id = ObjectID(user_id)
        }
        catch {
            res.send({ "err": "something wrong" })
        }
        try {
            app.db.collection("users").updateOne({ _id: user_id }, {
                $set: {
                    user_name: data.user_name,
                    pw: data.pw,
                    department: data.department

                }
            })
            res.send({ "message": "good" })
        }
        catch {
            res.send({ "err": "something trouble" })
        }
    })

    route.get('/data/:uid', (req, res) => {
        const user_uid = req.params.uid
        app.db.collection('users').findOne({ _id: user_uid }, (err, result) => {
            // delete result.pw
            res.send({ user: result })
        })
    })

    route.post('/signup', (req, res) => {
        const data = req.body
        var insert_data = {
            user_name: data.user_name,
            id: data.id,
            pw: data.pw,
            role: "general",
            department: data.department,
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