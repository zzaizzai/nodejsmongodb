


// module.exports = function (app) {

//     const passport = require('passport');
//     const LocalStrategy = require('passport-local').Strategy;
//     const session = require('express-session');
//     const { callbackify } = require('util');
//     const { connect } = require('http2');


//     var router = require('express').Router();
//     // const LocalStrategy = require('passport-local').Strategy;


//     passport.use(new LocalStrategy({
//         usernameField: 'id',
//         passwordField: 'pw',
//         session: true,
//         passReqToCallback: false,
//     }, function (input_id, input_pw, done) {
//         console.log(input_id, input_pw);
//         app.db.collection('users').findOne({ 'id': input_id }, (err, result) => {
//             console.log(result)

//             login_data = result
//             if (err) return done(err)
//             if (!login_data) return done(null, false, { message: 'account does not exist' })
//             if (input_pw == login_data.pw) {
//                 return done(null, login_data)
//             } else {
//                 return done(null, false, { message: 'wrong password' })
//             }
//         })
//     }));

//     passport.serializeUser(function (user, done) {
//         done(null, user.id)
//     });

//     passport.deserializeUser(function (user_id_saved, done) {
//         //user information from DB
//         console.log(user_id_saved)
//         db.collection('users').findOne({ 'id': user_id_saved }, (err, result) => {
//             console.log(result)
//             done(null, result)
//         })
//     });

//     return passport
// }



