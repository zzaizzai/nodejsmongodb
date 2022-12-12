module.exports = function (app) {

    var route = require('express').Router();
    const { ObjectID } = require('bson');
    const Service = require('./Service')



    route.get('/', (req, res) => {

        var role =  res.user?.role ?? "general"

        var role = Service.check_user_role(req)
        app.db.collection('users').find().toArray((err, result) => {
            res.render('./users/users.ejs', { users: result, role: role })
        })
    })

    route.get('/mode/add', (req, res) => {

        res.render('./users/users_add.ejs')
    })

    route.get('/:uid', (req, res) => {

        
        var role =  res.user?.role ?? "general"

        var user_uid = ""
        try {
            user_uid = ObjectID(req.params.uid)
        }
        catch {
            res.redirect('/')
            return
        }
        app.db.collection('users').findOne({ _id: user_uid }, (err, result) => {
            app.db.collection('works').find({user_uid: result._id }).sort({due_date:-1}).toArray((err, work_list)=> {
                console.log(work_list)
                res.render('./users/users_detail.ejs', { user: result, role: role , work_list: work_list})
            })


            
        })
    })

    route.get('/:uid/edit', (req, res) => {


        var role =  res.user?.role ?? "general"


        var user_uid = ""
        try {
            user_uid = ObjectID(req.params.uid)
        }
        catch {
            res.redirect('/')
            return
        }
        app.db.collection('users').findOne({ _id: user_uid }, (err, result) => {
            console.log(result)

            res.render('./users/users_edit.ejs', { user: result, role: role })
        })
    })


    route.get('/data/:uid', (req, res) => {
        const user_uid = req.params.uid
        app.db.collection('users').findOne({ _id: user_uid }, (err, result) => {
            // delete result.pw
            res.send({ user: result })
        })
    })

    route.post('/signup', (req, res) => {
        console.log(req.body)
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