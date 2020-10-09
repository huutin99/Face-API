require('@tensorflow/tfjs-node')
const faceapi = require('face-api.js')
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
    
        var base64Data = req.body.img.replace(/^data:image\/png;base64,/, "");
        fs.writeFileSync('queryimg/1.jpg', base64Data, 'base64', function (err) {
            console.log(err);
        });
        try {
            var result = recognizeImg()
            res.end(JSON.stringify({
                result: (await result).toString()
            }))
        }
        catch {
            res.end(JSON.stringify({
                result: 'UNKNOWN'
            }))
        }
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
    var dirList = []
    fs.readdirSync('img/').forEach(folder => {
        var length = fs.readdirSync(`img/${folder}/`).length
        folder += ';' + length
        dirList.push(folder)
    })
    return Promise.all(
        dirList.map(async label => {
            var descriptions = []
            for (let i = 1; i <= label.split(';')[1]; i++) {
                var img = await canvas.loadImage(`img/${label.split(';')[0]}/${i}.jpg`)
                const detection = await faceapi
                    .detectSingleFace(img, new TinyFaceDetectorOptions())
                    .withFaceLandmarks()
                    .withFaceDescriptor();
                descriptions.push(detection.descriptor)
            }
            try {
                return new faceapi.LabeledFaceDescriptors(label.split(';')[0], descriptions)
            }
            catch {
                return new faceapi.LabeledFaceDescriptors(label.split(';')[0], new Float32Array)
            }
        })
    )
}