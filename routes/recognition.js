require('@tensorflow/tfjs-node')
const faceapi = require('face-api.js')
const fetch = require('node-fetch')
var fs = require('fs')
// const { window } = new JSDOM("<!DOCTYPE html>")

// const { JSDOM } = require("jsdom")
// global.window = new JSDOM('<!DOCTYPE html><img id="for-detect">').window
// global.document = window.document
// global.HTMLImageElement = window.HTMLImageElement
// const $ = require("jquery")(window)

// faceapi.env.monkeyPatch({
//     fetch: fetch,
//     Canvas: window.HTMLCanvasElement,
//     Image: window.HTMLImageElement,
//     createCanvasElement: () => document.createElement('canvas'),
//     createImageElement: () => document.createElement('img')
// })

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
        
        res.end(JSON.stringify({
            content: 'OK',
            dirList: dirList
        }))
    })
}

async function recognizeImg(img) {
    const labeledFaceDescriptors = await loadLabeledImages()
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors()
    const displaySize = { width: img.width, height: img.height }
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    results.forEach(result => {
        console.log(result.toString())
    })
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
                var bitmap = fs.readFileSync(`img/${label}/${i}.jpg`)
                var b64String = Buffer.from(bitmap).toString('base64')
                // var img = document.getElementById('for-detect')
                var img = document.createElement('img')
                img.setAttribute('src', `data:image/jpg;base64,` + b64String)


                //-------------------Loi cho nay ne-------------------//
                // var img = await $(`<img src="data:image/jpg;base64,${b64String}">`)
                // var img = fetchImage(`http://localhost:9000/images/${label}/${i}.png`);
                const detection = await faceapi
                    .detectSingleFace(img)
                    .withFaceLandmarks()
                    .withFaceDescriptor();
                //----------------------------------------------------//


                console.log(img instanceof HTMLImageElement)
                descriptions.push(detection.descriptor)
            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}