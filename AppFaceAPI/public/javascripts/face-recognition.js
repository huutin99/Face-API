const video = document.getElementById('video')
const photo = document.getElementById('captured-photo')
const toDrawCanvas = document.getElementById('to-draw-canvas')
const canvasDiv = document.getElementById('canvas-div')

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
    function sendPhoto(content) {
        $.ajax({
            method: 'POST',
            url: 'recognition',
            data: JSON.stringify(content),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (res) {
                console.log(res)
            }
        })
    }
    // faceRecognition()
}

// function faceRecognition() {
//     const labeledFaceDescriptors = detectAllLabeledFaces();
//     const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.8);
//     const bestMatch = faceMatcher.findBestMatch(result.descriptor);
//     const box = resizedDetections.detection.box;
//     const drawBox = new faceapi.draw.DrawBox(box, { label: bestMatch.label });
//     drawBox.draw(canvas);
// }

// async function detectAllLabeledFaces() {
//     const labels = ["Tin"];
//     return Promise.all(
//         labels.map(async label => {
//             const descriptions = [];
//             for (let i = 1; i <= 2; i++) {
//                 const img = await faceapi.fetchImage(
//                     `http://localhost:8000/images/${label}/${i}.jpg`
//                 );
//                 const detection = await faceapi
//                     .detectSingleFace(img)
//                     .withFaceLandmarks()
//                     .withFaceDescriptor();
//                 descriptions.push(detection.descriptor);
//             }
//             return new faceapi.LabeledFaceDescriptors(label, descriptions);
//         })
//     );
// }