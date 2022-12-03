var works = require('express').Router();

works.get('/', function(req, res){
    res.render('works.ejs')
})

module.exports = works;