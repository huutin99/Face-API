var fs = require('fs')
module.exports = function (app) {
    app.get('/detection', function (req, res) {
        res.render('face-detection')
    })

    app.post('/detection', function (req, res) {
        if (!fs.existsSync('img/' + req.body.sid))
            fs.mkdirSync('img/' + req.body.sid)
        let base64String = req.body.img
        let base64Image = base64String.split(';base64,').pop();
        fs.appendFileSync('./img/' + req.body.sid + '/' + req.body.number + '.jpg', base64Image, { encoding: 'base64' }, function (err) {
            console.log('File created');
        });
        if (!fs.existsSync('public/images/' + req.body.sid))
            fs.mkdirSync('public/images/' + req.body.sid)
        fs.appendFileSync('public/images/' + req.body.sid + '/' + req.body.number + '.jpg', base64Image, { encoding: 'base64' }, function (err) {
            console.log('File created');
        });
        res.end(JSON.stringify({
            content: 'OK'
        }))
    })
}