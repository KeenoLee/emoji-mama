
feather.replace();

// Button panel
const controls = document.querySelector('.controls');

// Video zone
const video = document.querySelector('video');
const canvas = document.querySelector('canvas');

// Image of the taken screenshot
const screenshotImage = document.querySelector('img');

// Play, pause and screenshot buttons
const buttons = [...controls.querySelectorAll('button')];

let streamStarted = false;
const [play, pause, screenshot] = buttons;

// Set video size
const constraints = {
    video: {
        width: {
            min: 1280,
            ideal: 1920,
            max: 2560,
        },
        height: {
            min: 720,
            ideal: 1080,
            max: 1440
        },
    }
}

let stats = new Stats()
console.log('stats:', stats)
// If no camera, don't run
if (typeof navigator !== 'undefined') {
    navigator.getUserMedia = navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.moxGetUserMedia ||
        navigator.msGetUserMedia;
    navigator.mediaDevices.getUserMedia(constraints)
}


// **********************

// **********************

let frames = [];

// Event of clicking play button
play.onclick = async (event) => {
    if (streamStarted) {
        // Display the pause button but not to display the play button
        console.log('hi')
        video.play();
        play.classList.add('d-none');
        pause.classList.remove('d-none');

        // FPS
        // let stopped = false;
        // const video = await getVideoElement();
        // const drawingLoop = async (timestamp, frame) => {
        //     const bitmap = await createImageBitmap(video);
        //     const index = frames.length;
        //     frames.push(bitmap);
        //     select.append(new Option("Frame #" + (index + 1), index));

        //     if (!video.ended && !stopped) {
        //         video.requestVideoFrameCallback(drawingLoop);
        //     } else {
        //         select.disabled = false;
        //     }
        // };
        // // the last call to rVFC may happen before .ended is set but never resolve
        // video.onended = (event) => select.disabled = false;
        // video.requestVideoFrameCallback(drawingLoop);
        // play.onclick = (event) => stopped = true;
        // play.textContent = "stop";
        // async function getVideoElement() {
        //     const video = document.createElement("video");
        //     video.crossOrigin = "anonymous";
        //     video.src = "https://upload.wikimedia.org/wikipedia/commons/a/a4/BBH_gravitational_lensing_of_gw150914.webm";
        //     document.body.append(video);
        //     await video.play();
        //     return video;
        // }


        // Download a screenshot photo
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 140, 0, video.videoWidth, video.videoHeight);
        let blob = canvas.toBlob(function (blob) {
            let anchor = document.createElement('a');
            anchor.style.display = 'none';
            document.body.appendChild(anchor);
            console.log('hihihihih')
            let url = window.URL.createObjectURL(blob);
            anchor.href = url;
            console.log('anchor: ', anchor)
            anchor.download = 'capture.png';
            anchor.click();

        }, 'image/png')

        // let imageUrl = canvas.toDataURL('image/png')
        // console.log('imageUrl: ', imageUrl)
        // let parts = imageUrl.split(/,\s*/)
        // console.log('parts: ', parts)
        // const buffer = Buffer.from(parts[1], "base64");
        // let filePath = './Downloads'
        // console.log('filePath: ', filePath)
        // fs.writeFileSync(filePath, buffer);
        return;
    }
    startStream(constraints)

};

const startStream = async (constraints) => {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    await handleStream(stream);
};

const handleStream = async (stream) => {
    // A srcObject can be stream, source, blob or file
    video.srcObject = stream;
    play.classList.add('d-none');
    pause.classList.remove('d-none');
    screenshot.classList.remove('d-none');
    streamStarted = true;
};


// Click pause button
const pauseStream = () => {
    video.pause();
    play.classList.remove('d-none');
    pause.classList.add('d-none');
};
pause.onclick = pauseStream;

// Click screenshot button
const doScreenshot = () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    screenshotImage.src = canvas.toDataURL('image/webp');
    screenshotImage.classList.remove('d-none');
};
screenshot.onclick = doScreenshot;


// const preview = document.querySelector("canvas")
// let context = preview.getContext('2d')
// const captureScreen =
//     setInterval(function () {
//         context.drawImage(vid, 0, 0, 640, 360);
//         preview.toBlob(function (blob) {
//             // Save Blob
//             var a = document.createElement("a");
//             document.body.appendChild(a);
//             a.style = "display: none";
//             var url = window.URL.createObjectURL(blob);
//             a.href = url;
//             a.download = _generateGuid();
//             a.click();
//             window.URL.revokeObjectURL(url);
//             console.log('capture')
//         });
//     }, 100 / frameRate)