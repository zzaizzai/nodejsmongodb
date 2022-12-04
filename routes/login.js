

module.exports = function (app) {
    var route = require('express').Router();

    // app.post('/login/login', passport.authenticate('local', { failureRedirect: '/fail' }), function (req, res) {
    //     res.redirect('/')
    // });
    route.get('/', (req, res) => {
        var message = req.flash().error
        console.log(message)
        res.render('login.ejs', { message: message })
    })

    route.get('/logout', (req, res, next) => {
        console.log('logged out')
        req.logout((err) => {
            if (err) { return next(err); }
            res.status(200).send({ message: "success" })
        });

    })

    route.get('/test', (req, res) => {

        app.db.collection('users').find().toArray((err, result) => {
            console.log(result)
            res.render('users.ejs', { users: result })

        })
    })


    function is_login(req, res, next) {
        console.log(req.user)
        if (req.user) {
            next()

        } else {
            res.render('login', { message: "please login" })
        }
    }

    // route.get('/mypage', is_login, (req, res) => {
    //     (req.user)
    //     res.render('mypage.ejs')
    // })


    route.get('/test2', (req, res) => {
        res.send('ddd')
    })


    return route;
}