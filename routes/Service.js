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
        res.render('login.ejs', { message: "please login" })
    }
}


function status_request(create_datetime, due_date) {
    if (due_date == "" || due_date == null) {
        return { status_msg: "Watting" , status: "wait"}
    }

    time_due = new Date(due_date)
    time_create = new Date(create_datetime)
    time_now = new Date()

    var difference = Math.abs(time_due - time_now);
    var days = Math.floor(difference / (1000 * 3600 * 24))

    if (days == 0) {
        return { status_msg: "Today Due date", status: "wait" }
    }

    if (time_due > time_now) {
        return { status_msg: `left ${days} day(s)`, status: "wait" }
    } else {
        return { status_msg: `over ${days} day(s)`, status: "over" }
    }

    return { status_msg: "" }
}



function test() {
    return "test done"
}


module.exports = { datetime_now, is_login, test, status_request }