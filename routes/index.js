var express = require('express');
var router = express.Router();
fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/hahaha', function(req, res, next) {
    if (req.body.mssv && req.body.file){
        fs.writeFile("mssv.jpg", req.body.file, base64, function (err) {
            if (err) return console.log(err);
            console.log('wrote');
        })
        res.json({ data: { message: 'Thành công ròi hihihi!'}})
    } else res.json({ error: { message: 'Tào lao ròi!!!!!!!!'}})
});

module.exports = router;
