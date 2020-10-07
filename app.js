var express = require('express');
var path = require('path');
var bodyParser = require("body-parser");

var indexRouter = require('./routes/index');
var faceDetection = require('./routes/detection')
var faceRecognition = require('./routes/recognition')
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit: '50mb'}));

app.use('/', indexRouter);

faceDetection(app)
faceRecognition(app)

app.listen(9000)

module.exports = app;
