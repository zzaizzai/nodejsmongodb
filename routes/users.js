var router = require('express').Router();

router.get('/users', (req, res) => {
    req.app.db.collection('users').find().toArray((err, result)=> {
        res.send(result)
    })
    
})

module.exports = router;