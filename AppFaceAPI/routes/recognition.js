module.exports = function (app) {
    app.get('/recognition', function (req, res) {
        res.render('face-recognition')
    })

    
}