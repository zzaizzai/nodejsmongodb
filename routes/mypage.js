module.exports = function (app) {
    var route = require('express').Router();

    function is_login(req, res, next) {
        if (req.user) {
            next()
        } else {
            res.render('login.ejs', {message: 'please login'})
        }
    }

    route.get('/', is_login, (req, res) => {
        
        res.render('mypage.ejs', {user : req.user})
    })
    return route
}