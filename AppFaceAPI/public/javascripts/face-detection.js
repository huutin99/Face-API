const video = document.getElementById('video')
const photo = document.getElementById('captured-photo')
const toDrawCanvas = document.getElementById('to-draw-canvas')
const canvasDiv = document.getElementById('canvas-div')
const modal = document.getElementById('IDModal')
const sID = document.getElementById('SID')
const btnOK = document.getElementById('btn-ok')
const btnCancel = document.getElementById('btn-cancel')

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
}

var interval

video.addEventListener('play', () => {
    var canvas = faceapi.createCanvasFromMedia(video)
    canvasDiv.appendChild(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    faceapi.matchDimensions(toDrawCanvas, video)
    interval = setInterval(detectFace, 100, canvas, displaySize)
})

var frameCounter, numOfPhotos = 0

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
    if (numOfPhotos == 0)
        $('#IDModal').modal('show')
    else {
        var content = {
            "sid": sID.value,
            "number": 2,
            "img": data
        }
        sendPhoto(content)
        numOfPhotos = 0
        sID.value = ''
        alert('Okay, chụp xong rồi, thank u <3')
        video.play()
    }
}

sID.addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        btnOK.click()
    }
})

btnOK.addEventListener('click', async function () {
    var content = {
        "sid": sID.value,
        "number": 1,
        "img": photo.getAttribute('src')
    }
    sendPhoto(content)
    await $('#IDModal').modal('hide')
    numOfPhotos = 1
    alert('Cho chụp tấm nữa nha')
    video.play()
})

btnCancel.addEventListener('click', function () {
    video.play()
})

function sendPhoto(content) {
    $.ajax({
        method: 'POST',
        url: 'detection',
        data: JSON.stringify(content),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (res) {
            console.log(res)
        }
    })
}