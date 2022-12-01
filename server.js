const express = require('express');
const app = express();
const path = require('path')

const { ObjectID } = require('bson');
const bodyParser = require('body-parser');
require('dotenv').config()
const PORT = process.env.PORT || 5000
// var config = require('./config')
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.set('view engine', 'ejs')
// app.use('/public', express.static('public'))



express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('index.ejs'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))

var db
const MongoClient = require('mongodb').MongoClient
const mongoDbUrl = `mongodb+srv://${process.env.MONGODB_ID}:${process.env.MONGODB_PASSWORD}@cluster0.akash.mongodb.net/?retryWrites=true&w=majority`



MongoClient.connect(mongoDbUrl, function (err, client) {
    if (err) return console.log(err)
    db = client.db('nodejs-work-request')
    app.db = db
    console.log('connected')
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


const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

app.use(session({ secret: '1234', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());



app.get('/login', (req, res)=> {
    res.render('login.ejs')
})
app.post('/login/login', passport.authenticate('local', { failureRedirect: '/fail' }), function (req, res) {
    res.redirect('/')
});



function is_login(req, res, next) {
    if (req.user) {
        next()
    } else {
        res.render('login.ejs')
    }
}

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
}, function (input_id, input_pw, done) {
    console.log(input_id, input_pw);
    db.collection('accounts').findOne({ 'id': input_id }, (err, result) => {
        console.log(result)

        login_data = result
        if (err) return done(err)
        if (!login_data) return done(null, false, { message: 'account does not exist' })
        if (input_pw == login_data.pw) {
            return done(null, login_data)
        } else {
            return done(null, false, { message: 'wrong password' })
        }
    })
}));

passport.serializeUser(function (user, done) {
    done(null, user.id)
});

passport.deserializeUser(function (user_id_saved, done) {
    //user information from DB

    db.collection('accounts').findOne({ 'id': user_id_saved }, (err, result) => {
        console.log(result)
        done(null, result)
    })
});



// app.listen(PORT, function () {
//     console.log('listening on 8080')
// })