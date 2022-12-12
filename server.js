const express = require('express');
const app = express();
const path = require('path')
const { ObjectID } = require('bson');
const bodyParser = require('body-parser');
const flash = require('connect-flash')
app.use(flash())
require('dotenv').config()
const PORT = process.env.PORT || 5000
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
const session = require('express-session')
const MemoryStore = require('memorystore')(session)




app
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')

app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    secret: 'keyboard cat'
}))


app.listen(PORT, () => console.log(`Listening on ${PORT}`))

var db
const MongoClient = require('mongodb').MongoClient
const mongoDbUrl = `mongodb+srv://${process.env.MONGODB_ID}:${process.env.MONGODB_PASSWORD}@cluster0.akash.mongodb.net/?retryWrites=true&w=majority`



MongoClient.connect(mongoDbUrl, function (err, client) {
    if (err) return console.log(err)
    db = client.db('nodejs-work-request')
    app.db = db
    console.log('connected')
})


const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
// const session = require('express-session');

app.use(session({ secret: '1234', resave: true, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());


app.post('/login/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Error'
}), function (req, res) {
    res.redirect('/')
});


function is_login(req, res, next) {
    if (req.user) {
        next()
    } else {
        res.render('login.ejs', {message: "please login"})
    }
}
module.exports = {is_login}

app.get('/', (req, res) => {
    console.log(req.user)
    res.render('index.ejs', { user: req.user })
})

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
}, function (input_id, input_pw, done) {
    console.log(input_id, input_pw);
    db.collection('users').findOne({ 'id': input_id }, (err, result) => {
        // console.log(result)

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
    // console.log(user_id_saved)
    db.collection('users').findOne({ 'id': user_id_saved }, (err, result) => {
        console.log(result)
        done(null, result)
    })
});




// app.use('/passport', require('./routes/passport.js')(app))
app.use('/login', require('./routes/login.js')(app))
app.use('/mypage', require('./routes/mypage.js')(app))
app.use('/users', require('./routes/users.js')(app))
app.use('/works', require('./routes/works.js')(app))
app.use('/requests', require('./routes/requests.js')(app))
app.use('/comments', require('./routes/comments.js')(app))

app.get('/test', function (req, res) {
    res.send('dddd')
})

// app.listen(PORT, function () {
//     console.log('listening on 8080')
// })