const video = document.getElementById('video')
const photo = document.getElementById('captured-photo')
const toDrawCanvas = document.getElementById('to-draw-canvas')
const canvasDiv = document.getElementById('canvas-div')
const imgDiv = document.getElementById('img-div')
const modal = document.getElementById('info-modal')
const btnOK = document.getElementById('btn-ok')
const btnCancel = document.getElementById('btn-cancel')

Promise.all([
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
}

var interval, frameCounter

video.addEventListener('play', () => {
    var canvas = faceapi.createCanvasFromMedia(video)
    canvasDiv.appendChild(canvas)
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
    if (face.length > 0 && face[0].score > 0.8) {
        faceapi.draw.drawDetections(canvas, resizedDetections)
        frameCounter++
    }
    else if (frameCounter > 0) {
        frameCounter--
    }
    else frameCounter = 0
    if (frameCounter > 20) {
        capturePhoto()
        clearInterval(interval)
        frameCounter = 0
        canvasDiv.querySelectorAll('*').forEach(x => x.remove())
    }
}

function capturePhoto() {
    video.pause()
    toDrawCanvas.getContext('2d').drawImage(video, 0, 0, video.width, video.height)
    var data = toDrawCanvas.toDataURL('img/jpg')
    toDrawCanvas.style.display = 'none'
    photo.setAttribute('src', data)
    console.log(String(photo))
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
            faceRecognize(res.dirList)
        }
    })
}

async function faceRecognize(dirList) {
    const labeledFaceDescriptors = await loadLabeledImages(dirList)
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)
    var canvas = faceapi.createCanvasFromMedia(photo)
    imgDiv.append(canvas)
    const displaySize = { width: photo.width, height: photo.height }
    faceapi.matchDimensions(canvas, displaySize)
    const detections = await faceapi.detectAllFaces(photo, new faceapi.TinyFaceDetectorOptions({ inputsize: 128 })).withFaceLandmarks().withFaceDescriptors()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
    const box = resizedDetections[0].detection.box
    const drawBox = new faceapi.draw.DrawBox(box, { label: results[0].toString() })
    drawBox.draw(canvas)
    $('#info-text').text('MSSV của bạn là ' + results[0].toString().split('(')[0] + 'đúng không?')
    $('#info-modal').modal('show')
}

function loadLabeledImages(dirList) {
    const labels = dirList
    return Promise.all(
        labels.map(async label => {
            const descriptions = []
            for (let i = 1; i <= 2; i++) {
                const img = await faceapi.fetchImage(`http://localhost:9000/images/${label}/${i}.jpg`)
                const detections = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputsize: 128 })).withFaceLandmarks().withFaceDescriptor()
                descriptions.push(detections.descriptor)
            }
            return new faceapi.LabeledFaceDescriptors(label, descriptions)
        })
    )
}

btnOK.addEventListener('click', function () {
    // photo.setAttribute('src', '')
    // toDrawCanvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    location.reload();
})

btnCancel.addEventListener('click', function () {
    // video.play()
    location.reload();
})