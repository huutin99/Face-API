require('@tensorflow/tfjs-node')
const faceapi = require('face-api.js')
const fetch = require('node-fetch')
var fs = require('fs')
const canvas = require('canvas')
const { TinyFaceDetectorOptions } = require('face-api.js')
const { Canvas, Image, ImageData } = canvas

faceapi.env.monkeyPatch({
    Canvas,
    Image,
    ImageData
})

module.exports = function (app) {
    app.get('/recognition', function (req, res) {
        res.render('face-recognition')
    })

    app.post('/recognition', async function (req, res) {
        var dirList = []
        fs.readdirSync('public/images/').forEach(folder => {
            var length = fs.readdirSync(`public/images/${folder}/`).length
            folder += ';' + length
            dirList.push(folder)
        })

        var base64Data = req.body.img.replace(/^data:image\/png;base64,/, "");

        fs.writeFileSync('queryimg/1.jpg', base64Data, 'base64', function (err) {
            console.log(err);
        });

        var result = recognizeImg()

        res.end(JSON.stringify({
            result: (await result).toString()
        }))
    })
}

async function recognizeImg() {
    await faceapi.nets.tinyFaceDetector.loadFromDisk('./public/models')
    await faceapi.nets.faceLandmark68Net.loadFromDisk('./public/models')
    await faceapi.nets.faceRecognitionNet.loadFromDisk('./public/models')

    const labeledFaceDescriptors = await loadLabeledImages()
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors)
    const queryImg = await canvas.loadImage('./queryimg/1.jpg')
    const detections = await faceapi.detectAllFaces(queryImg, new TinyFaceDetectorOptions()).withFaceLandmarks().withFaceDescriptors()
    const displaySize = { width: queryImg.width, height: queryImg.height }
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    return results[0]
}

function loadLabeledImages() {
    var dirList = []; //this is going to contain paths
    fs.readdirSync('img/').forEach(folder => {
        dirList.push(folder)
    })
    return Promise.all(
        dirList.map(async label => {
            var descriptions = []
            for (let i = 1; i <= 2; i++) {
                var img = await canvas.loadImage(`img/${label}/${i}.jpg`)
                const detection = await faceapi
                    .detectSingleFace(img, new TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceDescriptor();
                descriptions.push(detection.descriptor)
            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}