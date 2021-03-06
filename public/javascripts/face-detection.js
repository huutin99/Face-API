const video = document.getElementById('video')
const photo = document.getElementById('captured-photo')
const toDrawCanvas = document.getElementById('to-draw-canvas')
const canvasDiv = document.getElementById('canvas-div')
const modal = document.getElementById('IDModal')
const sID = document.getElementById('SID')
const btnOK = document.getElementById('btn-ok')
const btnCancel = document.getElementById('btn-cancel')
const takePhoto = document.getElementById('takePhoto')

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models')
]).then(startVideo)

function startVideo() {
    navigator.getUserMedia = ( navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia);
    navigator.getUserMedia({ video: true},function (stream) {
        video.srcObject = stream
    }, function (err) {});
        /* handle the error */
    // })
    //     .then(function (stream) {
    //         video.srcObject = stream
    //     })
    //     .catch(function (err) {
    //         /* handle the error */
    //     });
    // getMedia({ video: true })
    // navigator.mediaDevices.getUserMedia(
    //     { video: {} },
    //     stream => video.srcObject = stream,
    //     err => console.error(err)
    // )
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
    const face = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({scoreThreshold: 0.7}))
    const resizedDetections = faceapi.resizeResults(face, displaySize)
    if (face.length > 0 && face[0].score > 0.6) {
        faceapi.draw.drawDetections(canvas, resizedDetections)
        frameCounter++
    }
    else if (frameCounter > 0) {
        frameCounter--
    }
    else frameCounter = 0
    if (frameCounter > 20) {
        frameCounter = 0
        capturePhoto()
        clearInterval(interval)
        canvasDiv.querySelectorAll('*').forEach(x => x.remove())
    }
}

async function capturePhoto() {
    video.pause()
    toDrawCanvas.getContext('2d').drawImage(video, 0, 0, video.width, video.height)
    var data = toDrawCanvas.toDataURL('img/jpg')
    toDrawCanvas.style.display = 'none'
    photo.setAttribute('src', data)
    const detections = await faceapi.detectAllFaces(photo, new faceapi.TinyFaceDetectorOptions({scoreThreshold: 0.6}))
    const faceImages = await faceapi.extractFaces(photo, detections)
    var canvas = document.createElement('canvas')
    faceapi.matchDimensions(canvas, toDrawCanvas)
    $('#facesContainer').empty()
    faceImages.forEach(canvas => document.getElementById('facesContainer').append(canvas))
    var newData = document.querySelector('#facesContainer canvas').toDataURL('img/jpg')
    if (numOfPhotos == 0)
        $('#IDModal').modal('show')
    else {
        var content = {
            "sid": sID.value,
            "number": 1,
            "img": data,
            "faceimg": newData
        }
        sendPhoto(content)
        numOfPhotos = 0
        sID.value = ''
        alert('Okay, chụp xong rồi, thank u <3')
        video.play()
    }
}

function displayExtractedFace(face){
    toDrawCanvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.matchDimensions()
}

sID.addEventListener('keyup', function (event) {
    if (event.keyCode === 13) {
        btnOK.click()
    }
})

btnOK.addEventListener('click', async function () {
    if (!isValid(sID.value)){
        alert("MSSV không hợp lệ!")
    } else {
        var content = {
            "sid": sID.value,
            "number": 1,
            "img": photo.getAttribute('src'),
            "faceimg": document.querySelector('#facesContainer canvas').toDataURL('img/jpg')
        }
        sendPhoto(content)
        await $('#IDModal').modal('hide')
        numOfPhotos = 1
        alert('Cho chụp tấm nữa nha')
        video.play()
    }
})

btnCancel.addEventListener('click', function () {
    video.play()
})

takePhoto.addEventListener('click', async function () {
    capturePhoto()
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
function isValid(mssv){
    if (mssv.length != 7) return false;
    else if (!(parseInt(mssv) > 1500000 && parseInt(mssv) < 2100000)) return false
    else return true;
}