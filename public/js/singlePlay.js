
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
const stats = new Stats();

const imgSize = 224
const modelUrlPath = 'https://cdn.jsdelivr.net/gh/tszfungkoktf/emojimama-model/tfModels/model.json'

const [divNum, subNum] = [1, 0] // [0:255]
// const [divNum , subNum] = [255,0] // [0:1]
// const [divNum , subNum] = [127.5,1] // [0:1]

let labels = ['beverages', 'books', 'bottles', 'cards', 'chairs', 'glasses', 'keyboards', 'keys', 'mouses', 'notebooks', 'pants', 'pens', 'phones', 'rings', 'shoes', 'televisions', 'tissues', 'topwears', 'umbrellas', 'watches']
const emojiLabels = ["🧃","📕","🍾","💳","🪑","👓","⌨️","🔑 ","🖱️","💻","👖","🖊️","📱","💍","👟","📺","🧻","👕","🌂","⌚"]


function checkEmojiDup() {
    let labelCount = {}
    labels.map((label) => {
        labelCount[label] = 0
    })
    console.log(labelCount)
    return labelCount
}

function genEmoji(round, checkEmojiDup) {
    // let remainLabels = labels.length + 1 - round
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

let round = 1
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
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);
    getMedia();
}

let requestAnimationFrameCross = window.webkitRequestAnimationFrame ||
    window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame || window.msRequestAnimationFrame;


let checkEmo = checkEmojiDup()
let successRate = 0.7
let imgURLArray = [];
let label;
async function predictModel() {
    stats.begin();

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

    console.log('checkRoundEmo: ', checkRound(checkEmo))
    let probs = Math.max(...result)
    if (checkRound(checkEmo) == (round - 1)) {
        label = genEmoji(round, checkEmo)

        console.log(`Find ${labels[label]}`)
    }
    if (result[label] > successRate) {
        console.log('success!')
        video.pause()
        let imgURL = canvas.toDataURL("image/png");
        // imgURLArray.push(imgURL)
        // console.log(imgURLArray)
        let dlLink = document.createElement('a');
        dlLink.download = "fileName";
        dlLink.href = imgURL;
        dlLink.dataset.downloadurl = ["image/png", dlLink.download, dlLink.href].join(':');
        document.body.appendChild(dlLink);
        let data = { image: imgURL, round: round }
        const res = await fetch('/sendImage', {
            method: 'POST',
            headers: {
                // 'Content-Type': 'multipart/form-data'
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
    let ind = result.indexOf(probs);
    //console.log("MyModel predicted:", labels[ind]); // top labels
    //console.log("Possibility:", result[ind] * 100); // top labels possible

    ctx.drawImage(video, 0, 0);

    // // Draw the top color box
    ctx.fillStyle = "#00FFFF";
    ctx.fillRect(0, 0, 1000, 30);

    // // Draw the text last to ensure it's on top. (draw label)
    const font = "22px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    ctx.fillStyle = "#000000";
    ctx.fillText(`${labels[ind]} : ${result[ind] * 100}%`, 20, 8);
    // console.log('ctx: ', ctx)
    stats.end();
    requestAnimationFrameCross(predictModel);
}
