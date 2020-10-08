const video = document.getElementById('video')
const videoDiv = document.getElementById('video-div')
const photo = document.getElementById('captured-photo')
const toDrawCanvas = document.getElementById('to-draw-canvas')
const canvasDiv = document.getElementById('canvas-div')
const imgDiv = document.getElementById('img-div')
const infomodal = document.getElementById('info-modal')
const sorrymodal = document.getElementById('sorry-modal')
const btnOK = document.getElementById('btn-ok')
const btnCancel = document.getElementById('btn-cancel')
const takePhoto = document.getElementById('takePhoto')
const host = `http://localhost:10000`

Promise.all([
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
    infomodal.style.display = 'none'
    sorrymodal.style.display = 'none'
    navigator.getUserMedia = (navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);
    navigator.getUserMedia({ video: true }, function (stream) {
        video.srcObject = stream
    }, function (err) { });
}

var interval, frameCounter

video.addEventListener('play', () => {
    var canvas = faceapi.createCanvasFromMedia(video)
    videoDiv.appendChild(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    faceapi.matchDimensions(toDrawCanvas, video)
    interval = setInterval(detectFace, 70, canvas, displaySize)
})

var frameCounter

async function detectFace(canvas, displaySize) {
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    const face = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputsize: 128 }))
    const resizedDetections = faceapi.resizeResults(face, displaySize)
    if (face.length > 0 && face[0].score > 0.7) {
        faceapi.draw.drawDetections(canvas, resizedDetections)
        frameCounter++
    }
    else if (frameCounter > 0) {
        frameCounter--
    }
    else frameCounter = 0
    if (frameCounter > 10) {
        capturePhoto()
        clearInterval(interval)
        frameCounter = 0
        videoDiv.querySelectorAll('canvas').forEach(x => x.remove())
    }
}

function capturePhoto() {
    video.pause()
    toDrawCanvas.getContext('2d').drawImage(video, 0, 0, video.width, video.height)
    var data = toDrawCanvas.toDataURL('img/jpg')
    toDrawCanvas.style.display = 'none'
    photo.setAttribute('src', data)
    // console.log(String(photo))
    var content = {
        "img": data
    }
    sendPhoto(content)
    // faceRecognition()
}

function sendPhoto(content) {
    $.ajax({
        method: 'POST',
        url: 'recognition',
        data: JSON.stringify(content),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (res) {
            if (res.result.toString() != 'UNKNOWN') {
                $('#info-text').text('MSSV của bạn là ' + res.result.toString().split('(')[0] + 'đúng không?')
                $('#info-modal').modal('show')
            }
            else {
                $('#sorry-modal').modal('show')
            }
        }
    })
}

takePhoto.addEventListener('click', function () {
    capturePhoto()
})