const express = require('express');
const app = express();
const { ObjectID } = require('bson');
const bodyParser = require('body-parser');
require('dotenv').config()
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
app.use('/public', express.static('public'))

var db
const MongoClient = require('mongodb').MongoClient
const mongoDbUrl = `mongodb+srv://${process.env.MONGODB_ID}:${process.env.MONGODB_PASSWORD}@cluster0.akash.mongodb.net/?retryWrites=true&w=majority`

MongoClient.connect(mongoDbUrl, function (err, client) {
    if (err) return console.log(err)
    db = client.db('nodejs-work-request')
    app.db = db
})




// app.use('/', require('./routes/works.js'))
app.use('/login', require('./routes/login.js'))
app.use('/users', require('./routes/users.js'))


app.get('/', function(req, res) {
    res.render('index.ejs')
})

// app.get('/users', function (req, res) {
//     db.collection('users').find().toArray((err, result) => {
//         console.log(result)
//         res.send(result)
//     })
// })

// app.get('/users/:id', function (req, res) {
//     db.collection('users').findOne({ _id: ObjectID(req.params.id) }, (err, result) => {
//         console.log(result)
//         res.send(result)
//     })
// })

// app.post('/users', function (req, res) {
//     console.log(req.body)
//     db.collection('users').insertOne({ user_name: req.body.user_name, age: req.body.age })
//     res.send('saved')
// })

// app.put('/users', function (req, res) {
//     console.log(req.body)
//     db.collection('users').updateOne({ _id: ObjectID(req.body.id) },
//         { $set: { user_name: req.body.user_name, age: req.body.age } },
//         function (err, result) {
//             console.log(result)
//             res.send('update done')
//         })
// })

// app.delete('/users', function (req, res) {
//     console.log(req.body)
//     db.collection('users').deleteOne({ _id: ObjectID(req.body.id) }, function (err, result) {
//         res.send('delete done')
//     })
// })

app.listen(8080, function () {
    console.log('listening on 8080')
})