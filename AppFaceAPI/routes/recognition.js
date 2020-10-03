const { detectAllFaces } = require('face-api.js')
var fs = require('fs')
// require('../node_modules/@tensorflow/tfjs-node')

module.exports = function (app) {
    app.get('/recognition', function (req, res) {
        res.render('face-recognition')
    })

    app.post('/recognition', function (req, res) {
        var dirPath = 'img/';
        var dirList = []; //this is going to contain paths
        fs.readdirSync(dirPath).forEach(folder => {
            dirList.push(folder)
        })
        let base64String = req.body.img
        var img = new Image()
        img.setAttribute('src', base64String)
        var dectection = detectAllFaces(img, )
        res.end(JSON.stringify({
            content: 'OK'
        }))
    })
}