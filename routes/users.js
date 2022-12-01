var router = require('express').Router();
const { ObjectID } = require('bson');

router.get('/', (req, res) => {
    req.app.db.collection('users').find().toArray((err, result) => {
        console.log(result)
        res.render('users.ejs', { users: result })
    })

})


router.get('/:id', function (req, res) {
    req.app.db.collection('users').findOne({ _id: ObjectID(req.params.id) }, (err, result) => {
        console.log(result)
        res.send(result)
    })
})


module.exports = router;