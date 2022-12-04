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
        
        res.render('./mypage/mypage.ejs', {user : req.user})
    })

    route.get('/mode/edit', is_login, (req, res) => {
        console.log('editmode')
        res.render('./mypage/mypage_edit.ejs', {user : req.user})
    })
    return route
}