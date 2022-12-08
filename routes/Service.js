function datetime_now() {
    const dtf = new Intl.DateTimeFormat('ja-JP', {
        dateStyle: 'short',
        timeStyle: 'medium'
    });
    let datetime = dtf.format(new Date()); // 2021/10/11 21:54:40
    datetime = datetime.replace(/\//g, '-');
    return datetime
}


function is_login(req, res, next) {
    if (req.user) {
        next()
    } else {
        res.render('login.ejs', {message: "please login"})
    }
}

function check_admin(user_role) {
    let role = "general"
    
    if (user_role == "admin") {
        role = "admin"
    }
    return role
}

function test() {
    return "test done"
}


module.exports = { datetime_now, is_login, test, check_admin }