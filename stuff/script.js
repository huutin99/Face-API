const video = document.getElementById('video')
const capturedImg = document.getElementById('captured-img')
// const webcam = new Webcam(video, 'user')

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)

var webcamStream, ctx;

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        webcamStream => video.srcObject = webcamStream,
        err => console.error(err)
    )
}

function stopVideo(){
    webcamStream.stop();
}

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)
    var detect =  setInterval(async () => {
        const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.8 })).withFaceLandmarks().withFaceExpressions()

        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)
        // if (detections) {
        //     recognizeImg()
        // }
    }, 100)
})

function recognizeImg() {
    const labeledFaceDescriptors = detectAllLabeledFaces();
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.8);
    const bestMatch = faceMatcher.findBestMatch(result.descriptor);
    const box = resizedDetections.detection.box;
    const drawBox = new faceapi.draw.DrawBox(box, { label: bestMatch.label });
    drawBox.draw(canvas);
}

async function detectAllLabeledFaces() {
    const labels = ["Tin"];
    return Promise.all(
        labels.map(async label => {
        const descriptions = [];
        for (let i = 1; i <= 2; i++) {
            const img = await faceapi.fetchImage(
            `http://localhost:5500/img/${label}/${i}.png`
            );
            const detection = await faceapi
            .detectSingleFace(img)
            .withFaceLandmarks()
            .withFaceDescriptor();
            descriptions.push(detection.descriptor);
        }
        return new faceapi.LabeledFaceDescriptors(label, descriptions);
        })
    );
}

// function stopVideo() {
//     video.addEventListener('pause', () => {
//         console.log("paused");
//     })
// }