var router = require('express').Router();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

router.use(session({ secret: '1234', resave: true, saveUninitialized: false }));
router.use(passport.initialize());
router.use(passport.session());



router.get('/', (req, res)=> {
    res.render('login.ejs')
})
router.post('/login', passport.authenticate('local', { failureRedirect: '/fail' }), function (req, res) {
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
    req.app.db.collection('accounts').findOne({ 'id': input_id }, (err, result) => {
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

    router.db.collection('accounts').findOne({ 'id': user_id_saved }, (err, result) => {
        console.log(result)
        done(null, result)
    })

});


module.exports = router;