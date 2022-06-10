
let model;
// webCam
const video = document.querySelector('video');

// webCam display
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

// debugMessage
const debugMessage = document.getElementById("debugMessage")
console.log("Width:", window.innerWidth)
console.log("Height:", window.innerHeight)

// stats library
// const stats = new Stats();

const imgSize = 224
const modelUrlPath = 'https://cdn.jsdelivr.net/gh/tszfungkoktf/emojimama-model/tfModels/model.json'

const [divNum, subNum] = [1, 0] // [0:255]
// const [divNum , subNum] = [255,0] // [0:1]
// const [divNum , subNum] = [127.5,1] // [0:1]

let labels = ['beverages', 'books', 'bottles', 'cards', 'chairs', 'glasses', 'keyboards', 'keys', 'mouses', 'notebooks', 'pants', 'pens', 'phones', 'rings', 'shoes', 'televisions', 'tissues', 'topwears', 'umbrellas', 'watches']
const emojiLabels = ["🧃","📕","🍾","💳","🪑","👓","⌨️","🔑 ","🖱️","💻","👖","🖊️","📱","💍","👟","📺","🧻","👕","🌂","⌚"]
let checkEmo = checkEmojiDup();
let successRate = 0.1;
let imgURLArray = [];
let label;
let round = 1;
let startedCount = false
let stopCount = false
let requestAnimationFrameCross = window.webkitRequestAnimationFrame ||
    window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame || window.msRequestAnimationFrame;
const currentEmoji = document.querySelector('#current-emoji')
const timer = document.querySelector('#timer')

// Timer
function setTimer() {
    let setTime;
    let s = 19
    let ms = 99
    startedCount = true
    
    return setInterval(() => {
        if (ms == 0) {
            ms = 99
            s -= 1
        }
        ms -= 1
        s = '0' + s
        ms = '0' + ms
        if (parseInt(s) <= 0) {
            // timer.textContent = 'Time Out!'
            stopCount = true
            return
        }
        setTime = s.substring(s.length - 2, s.length) + ':' + ms.substring(ms.length - 2, ms.length)
        timer.textContent = setTime
    }, 1000/99);
}

function checkEmojiDup() {
    let labelCount = {}
    labels.map((label) => {
        labelCount[label] = 0
    })
    return labelCount
}

function genEmoji(round, checkEmojiDup) {
    let result = Math.floor(Math.random() * labels.length)
    if (checkEmojiDup[labels[result]] > 0) {
        return genEmoji(round, checkEmojiDup)
    }
    if (checkRound(checkEmojiDup) == (round - 1)) {
        checkEmojiDup[labels[result]]++
        return result
    }
}

function checkRound(object) {
    return Object.values(object).reduce((pre, cur) => pre + cur)
}

async function getMedia() {
    let stream = null;
    let constraints = window.constraints = {
        audio: false,
        video: {
            facingMode: "environment"
        }
    };

    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        // console.log(stream)

        window.stream = stream
        video.srcObject = stream

    } catch (err) {
        console.log(err);
    }
}

// create load model and active cameras
async function loadModel() {
    model = await tf.loadGraphModel(modelUrlPath);
    // Set up canvas w and h
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    predictModel();
}

video.addEventListener('loadeddata', async () => {
    console.log('Yay!');
    loadModel();
});

window.onload = async () => {
    // stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    // document.body.appendChild(stats.dom);
    getMedia();
}





async function predictModel() {
    // stats.begin();

    // Prevent memory leaks by using tidy 
    let imgPre = await tf.tidy(() => {
        return tf.browser.fromPixels(video)
            .resizeNearestNeighbor([imgSize, imgSize])
            .toFloat()
            .div(tf.scalar(divNum))
            .sub(tf.scalar(subNum))
            .expandDims();
    });
    const result = await model.predict(imgPre).data();
    await tf.dispose(imgPre); // clear memory
    if (stopCount) {
        timer.textContent = 'Time Out!'
    }
    if (!startedCount && !stopCount) {
        setTimer()
    }
    let probs = Math.max(...result)
    if (checkRound(checkEmo) == (round - 1)) {
        label = genEmoji(round, checkEmo)
        currentEmoji.textContent = `${emojiLabels[label]}`
        console.log(`Find ${labels[label]}`)
    }
    if (result[label] > successRate) {
        console.log('success!')
        video.pause()
        let imgURL = canvas.toDataURL("image/png");
        let dlLink = document.createElement('a');
        dlLink.download = "fileName";
        dlLink.href = imgURL;
        dlLink.dataset.downloadurl = ["image/png", dlLink.download, dlLink.href].join(':');
        document.body.appendChild(dlLink);
        let data = { image: imgURL, round: round }
        const res = await fetch('/sendImage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        const resResult = await res.json()
        if (resResult.success) {
            round++
            setTimeout(() => {
                video.play()
                predictModel()
            }, 1000)
        }
        return


    }
    //console.log("MyModel predicted:", labels[ind]); // top labels
    //console.log("Possibility:", result[ind] * 100); // top labels possible
    
    ctx.drawImage(video, 0, 0);
    
    // // Draw the top color box
    ctx.fillStyle = "#00FFFF";
    ctx.fillRect(0, 0, 1000, 30);
    
    // // Draw the text last to ensure it's on top. (draw label)
    let ind = result.indexOf(probs);
    const font = "22px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    ctx.fillStyle = "#000000";
    ctx.fillText(`${emojiLabels[ind]} : ${result[ind] * 100}%`, 20, 8);
    // console.log('ctx: ', ctx)
    // stats.end();
    requestAnimationFrameCross(predictModel);
}
