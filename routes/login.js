var router = require('express').Router();
var mongo = require('./../server.js')

router.get('/test', (req, res) => {
    mongo.connect(function (err) {
        if (err) throw err;
        mongo.db.collection('users').find().toArray((err, result) => {
            console.log(result)
            res.render('users.ejs', { users: result })
        })
    })
})

// router.get('/test', (req, res) => {
//     console.log('good')
//     console.log(db)
//     mongo.db.collection('users').find().toArray((err, result) => {
//         console.log(result)
//         res.render('users.ejs', { users: result })
//     })
// })
module.exports = router;