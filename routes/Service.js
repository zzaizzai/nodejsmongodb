function datetime_now() {
    const dtf = new Intl.DateTimeFormat('ja-JP', {
        dateStyle: 'short',
        timeStyle: 'medium'
    });
    let datetime = dtf.format(new Date()); // 2021/10/11 21:54:40
    datetime = datetime.replace(/\//g, '-');
    return datetime
}


module.exports = { datetime_now }