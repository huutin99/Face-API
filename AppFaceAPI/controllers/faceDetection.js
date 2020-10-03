module.exports = function(app){
    app.get('/detection', function(req, res){
        res.render('face-detection')
    })
}