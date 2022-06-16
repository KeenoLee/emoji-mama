//indexedDB setup
// const indexedDB =
//     window.indexedDB ||
//     window.mozIndexedDB ||
//     window.webkitIndexedDB ||
//     window.msIndexedDB ||
//     window.shimIndexedDB


// if (!indexedDB) {
//     console.log("IndexedDB could not be found in this browser.");
// }

// const request = indexedDB.open('imagesIDB', 1)

// request.onerror = function (event) {
//     console.error("An error from IndexedDB");
//     console.error(event.target.error);
// }

// request.onupgradeneeded = function () {
//     const db = request.result
//     if (!db.objectStoreNames.contains('screenshots')) {
//         const store = db.createObjectStore("screenshots", { keyPath: "id" });
//         store.createIndex("userID", 'image', { unique: false })
//     }
// }

// let DBid = 1
// function addImageToIndexedDB(image) {

//     let images = { id: DBid, screenshots: image }
//     transaction = request.result.transaction(["screenshots"], "readwrite")
//         .objectStore('screenshots')
//         .add(images)

//     DBid++
// }

//  function getImageFromIndexedDB() {
//     const db = request.result
//     const transaction = db.transaction("screenshots")
//     const objectStore = transaction.objectStore("screenshots")

//     objectStore.openCursor().onsuccess = function(event) {
//         let cursor = event.target.result

//         if(cursor) {
//             console.log(cursor.key)
//             console.log(cursor.value.screenshots)
//             cursor.continue()
//         }else {
//             console.log('Entries all displayed.');
//           }
//     }
// }

// request.onsuccess = function () {
//     const db = request.result
//     const transaction = db.transaction("screenshots", "readwrite")
//     const store = transaction.objectStore("screenshots")
//     const userIndex = store.index("userID")

//     store.put({ id: 1, screenshots: '123' })

//     const idQuery = store.get(1)

//     idQuery.onsuccess = function () {
//         console.log('idQuery', store.get(1).result)
//     }
// }
// }

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
// const modelUrlPath = 'https://cdn.jsdelivr.net/gh/tszfungkoktf/emojimama-model/hunt-model/weights_manifest.json'

const [divNum, subNum] = [1, 0] // [0:255]
// const [divNum , subNum] = [255,0] // [0:1]
// const [divNum , subNum] = [127.5,1] // [0:1]

let labels = ['beverages', 'books', 'bottles', 'cards', 'chairs', 'glasses', 'keyboards', 'keys', 'mouses', 'notebooks', 'pants', 'pens', 'phones', 'rings', 'shoes', 'televisions', 'tissues', 'topwears', 'umbrellas', 'watches']
const emojiLabels = ["🧃", "📕", "🍾", "💳", "🪑", "👓", "⌨️", "🔑 ", "🖱️", "💻", "👖", "🖊️", "📱", "💍", "👟", "📺", "🧻", "👕", "🌂", "⌚"]
let checkEmo = checkEmojiDup();
let successRate = 0.1;
let label;
let round = 1;
let startedCount = false
let stopCount = false
let interval = 1000 / 100
let bonusTime = 5
let startTimer
let timeSpace = 0
let originalS = 29
let originalMS = 99
let delayPredict = true
let originTimer = originalS.toString().concat(':', originalMS.toString())
console.log(originTimer)
let requestAnimationFrameCross = window.webkitRequestAnimationFrame ||
    window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame || window.msRequestAnimationFrame;
let unShowForm = false

const currentEmoji = document.querySelector('#current-emoji')
const timer = document.querySelector('#timer')
const score = document.querySelector('#current-score')
const enterName = document.querySelector('#opacity-form')
const endGame = document.querySelector('#end div');


window.onload = async () => {
    // stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    // document.body.appendChild(stats.dom);
    getMedia();
}

video.addEventListener('loadeddata', async () => {
    console.log('Yay!');
    loadModel();
});

endGame.addEventListener('click', () => {
    clearInterval(startTimer)
    timer.textContent = 'Time Out!'
    video.pause()
    enterName.style.display = 'flex'
    unShowForm = true
})


// Timer
function setTimer(seconds, milliseconds) {
    let setTime;
    let s = seconds
    let ms = milliseconds
    startedCount = true
    return setInterval(() => {
        if (ms == 0 && s > 0) {
            ms = 99
            s -= 1
        }
        ms -= 1
        s = '0' + s
        ms = '0' + ms
        if (parseInt(s) <= 0 && parseInt(ms) == 0) {
            stopCount = true
            return
        }
        setTime = s.substring(s.length - 2, s.length) + ':' + ms.substring(ms.length - 2, ms.length)
        timer.textContent = setTime
    }, interval);
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
            facingMode: "environment",
            width: { min: 1024, ideal: 1280, max: 1920 },
            height: { min: 576, ideal: 720, max: 1080 }
        }
    };
    try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
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
    document.querySelector('.loader-wrapper').style.display = 'none';
    predictModel();
}


function getTime(time) {
    let s = time.substring(0, 2)
    let ms = time.substring(time.length - 2, time.length)
    return +s + (+ms / 100)
}


async function predictModel() {
    // Prevent memory leaks by using tidy 
    if (!startedCount && !stopCount) {
        startTimer = setTimer(originalS, originalMS)
    }
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
    if (stopCount && !unShowForm) {
        clearInterval(startTimer)
        timer.textContent = 'Time Out!'
        video.pause()
        enterName.style.display = 'flex'
        unShowForm = true

    }
    let probs = Math.max(...result)
    if (checkRound(checkEmo) == (round - 1)) {
        label = genEmoji(round, checkEmo)
        currentEmoji.textContent = `${emojiLabels[label]}`
        console.log(`Find ${labels[label]}`)
    }
    if (result[label] > successRate && delayPredict) {
        delayPredict = false
        console.log('success!')
        video.pause()
        let imgURL = canvas.toDataURL("image/png");

        let currentTimer = timer.textContent
        timeSpace = getTime(originTimer) - getTime(currentTimer)
        console.log('origin: ', getTime(originTimer))
        console.log('current: ', getTime(currentTimer))
        originTimer = currentTimer
        let formData = new FormData()
        formData.append('image', imgURL)
        formData.append('round', round)
        formData.append('timeSpace', timeSpace)
        formData.append('emoji', emojiLabels[label])
        const res = await fetch('/getData', {
            method: 'POST',
            body: formData
        })
        // console.log(imgURL)
        const resResult = await res.json()
        console.log('score: ', resResult.score)
        if (resResult.score) {

            // let currentTimer = timer.textContent
            let accScore = parseInt(score.textContent)
            if (isNaN(accScore)) {
                accScore = 0
            }
            score.innerHTML = +accScore + +resResult.score
            let seconds = currentTimer.substring(0, 2)
            let milliseconds = currentTimer.substring(currentTimer.length - 2, currentTimer.length)
            clearInterval(startTimer)
            round++
            setTimeout(() => {
                delayPredict = true
                video.play()
                predictModel()
                startTimer = setTimer(+seconds + bonusTime, +milliseconds)
                // startTimer()
            }, 1000)
        }
        return
    }
    //console.log("MyModel predicted:", labels[ind]); // top labels
    //console.log("Possibility:", result[ind] * 100); // top labels possible

    ctx.drawImage(video, 0, 0);

    // Draw the top color box
    // ctx.fillStyle = "#00FFFF";
    // ctx.fillRect(0, 0, 1000, 30);

    // Draw the text last to ensure it's on top. (draw label)
    let ind = result.indexOf(probs);
    // const font = "22px sans-serif";
    // ctx.font = font;
    // ctx.textBaseline = "top";
    // ctx.fillStyle = "#000000";
    // ctx.fillText(`${emojiLabels[ind]} : ${result[ind] * 100}%`, 20, 8);

    // console.log('ctx: ', ctx)
    // stats.end();
    requestAnimationFrameCross(predictModel);
}


enterName.addEventListener('submit', async (event) => {
    event.preventDefault()
    let form = event.target
    const formObj = {
        name: form.name.value,
        score: score.textContent
    }
    console.log('total score: ', formObj.name, score.textContent)
    enterName.style.display = 'none'
    const res = await fetch('/enterName', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formObj)
    })
    const result = await res.json()
    console.log('input name: ', await result)
    if (result.success) {
        console.log('success?: ', result)
        window.location.href = './result.html'
    }
})