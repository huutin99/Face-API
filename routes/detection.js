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
        fs.readdir('./img/' + req.body.sid, (err, files) => {
            // console.log(files.length)
            var imgNumber = (Number(req.body.number) + files.length).toString()
            fs.appendFileSync('./img/' + req.body.sid + '/' + imgNumber + '.jpg', base64Image, { encoding: 'base64' }, function (err) {
                console.log('File created');
            });
        });
        ///////////////////////////////////////////
        if (!fs.existsSync('cutimg/' + req.body.sid))
            fs.mkdirSync('cutimg/' + req.body.sid)
        let base64FaceString = req.body.faceimg
        let base64FaceImage = base64FaceString.split(';base64,').pop();
        fs.readdir('./cutimg/' + req.body.sid, (err, files) => {
            // console.log(files.length)
            var imgNumber = (Number(req.body.number) + files.length).toString()
            fs.appendFileSync('./cutimg/' + req.body.sid + '/' + imgNumber + '.jpg', base64FaceImage, { encoding: 'base64' }, function (err) {
                console.log('File created');
            });
        });
        ///////////////////////////////////////////
        if (!fs.existsSync('./public/images/' + req.body.sid))
            fs.mkdirSync('./public/images/' + req.body.sid)
        fs.readdir('./public/images/' + req.body.sid, (err, files) => {
            // console.log(files.length)
            var imgNumber = (Number(req.body.number) + files.length).toString()
            fs.appendFileSync('./public/images/' + req.body.sid + '/' + imgNumber + '.jpg', base64Image, { encoding: 'base64' }, function (err) {
                console.log('File created');
            });
        });
        res.end(JSON.stringify({
            content: 'OK'
        }))
    })
}