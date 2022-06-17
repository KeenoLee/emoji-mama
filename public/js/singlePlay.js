let model;

// WebCam
const video = document.querySelector('video');

// WebCam display
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

// Debug Message
const debugMessage = document.getElementById("debugMessage")
console.log("Width:", window.innerWidth)
console.log("Height:", window.innerHeight)


const imgSize = 224
const modelUrlPath = 'https://cdn.jsdelivr.net/gh/tszfungkoktf/emojimama-model/tfModels/model.json'
// const modelUrlPath = 'https://cdn.jsdelivr.net/gh/tszfungkoktf/emojimama-model/hunt-model/weights_manifest.json'

const [divNum, subNum] = [1, 0] // [0:255]
// const [divNum , subNum] = [255,0] // [0:1]
// const [divNum , subNum] = [127.5,1] // [0:1]
let requestAnimationFrameCross = window.webkitRequestAnimationFrame ||
    window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame || window.msRequestAnimationFrame;

const labels = ['beverages', 'books', 'bottles', 'cards', 'chairs', 'glasses', 'keyboards', 'keys', 'mouses', 'notebooks', 'pants', 'pens', 'phones', 'rings', 'shoes', 'televisions', 'tissues', 'topwears', 'umbrellas', 'watches']
const emojiLabels = ["🧃", "📕", "🍾", "💳", "🪑", "👓", "⌨️", "🔑 ", "🖱️", "💻", "👖", "🖊️", "📱", "💍", "👟", "📺", "🧻", "👕", "🌂", "⌚"]
let checkEmo = checkEmojiDup();
let successRate = 0.1;
let label;
let round = 1;
let interval = 1000 / 100
let bonusTime = 5
let startTimer
let timeSpace = 0
let originalS = 29
let originalMS = 99
let originTimer = originalS.toString().concat(':', originalMS.toString())
let delayPredict = true
let startedCount = false
let unShowForm = false
let stopCount = false
let ableToSkip = true
let pauseRequestFrameCross = false

const currentEmoji = document.querySelector('#current-emoji')
const timer = document.querySelector('#timer')
const score = document.querySelector('#current-score')
const enterName = document.querySelector('#opacity-form')
const endGame = document.querySelector('#end');
const skip = document.querySelector('#skip')


window.onload = async () => {
    getMedia();
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

video.addEventListener('loadedmetadata', async () => {
    setTimeout(()=>{
        loadModel();
    },10000)
    
});

endGame.addEventListener('click', () => {
    clearInterval(startTimer)
    timer.textContent = 'Time Out!'
    video.pause()
    enterName.style.display = 'flex'
    unShowForm = true
})

// Create load model and active cameras
async function loadModel() {
    model = await tf.loadGraphModel(modelUrlPath);
    // Set up canvas w and h
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    setTimeout(() => {
        document.querySelector('.loader-wrapper').style.display = 'none';
        predictModel();
    }, 500)
}

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

// Format Time to float
function getTime(time) {
    let s = time.substring(0, 2)
    let ms = time.substring(time.length - 2, time.length)
    return +s + (+ms / 100)
}

// Emoji
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
    return
}
function checkRound(object) {
    return Object.values(object).reduce((pre, cur) => pre + cur)
}

// Skip Emoji
function skipEmoji() {
    if (round >= labels.length) {
        clearInterval(startTimer)

        timer.textContent = 'No More Emoji'
        video.pause()
        enterName.style.display = 'flex'
        unShowForm = true
        return
    }
    round++
    label = genEmoji(round, checkEmo)
    currentEmoji.textContent = `${emojiLabels[label]}`
}
skip.addEventListener('click', () => {
    if (ableToSkip) {
        skipEmoji()
    }
})

// Main Function
async function predictModel() {
    debugger
    // Prevent memory leaks by using tidy 
    if (!startedCount && !stopCount) {
        startTimer = setTimer(originalS, originalMS)
    }
    if (round >= labels.length) {
        clearInterval(startTimer)
        timer.textContent = 'No More Emoji'
        video.pause()
        enterName.style.display = 'flex'
        unShowForm = true
        return
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
    // Clear memory
    await tf.dispose(imgPre);

    // Show name form when time out
    if (stopCount && !unShowForm) {
        clearInterval(startTimer)
        timer.textContent = 'Time Out!'
        video.pause()
        enterName.style.display = 'flex'
        unShowForm = true
    }

    // Show emoji
    if (checkRound(checkEmo) == (round - 1)) {
        label = genEmoji(round, checkEmo)
        currentEmoji.textContent = `${emojiLabels[label]}`
        console.log(`Find ${labels[label]}`)
    }

    // Successfully matched the emoji
    if (result[label] > successRate && delayPredict) {
        delayPredict = false
        pauseRequestFrameCross = true
        ableToSkip = false
        video.pause()

        // Download image
        let imgURL = canvas.toDataURL('image/jpeg', 0.5);
        console.log('getting image... ', typeof imgURL)

        // Manipulate time for score counting
        let currentTimer = timer.textContent
        timeSpace = getTime(originTimer) - getTime(currentTimer)
        // console.log('qqq', timeSpace)
        // console.log('tttt', originTimer, currentTimer)
        // Formidable
        let formData = new FormData()
        formData.append('image', imgURL)
        formData.append('round', round)
        formData.append('timeSpace', timeSpace)
        formData.append('emoji', emojiLabels[label])
        // console.log('gdfgdf', timeSpace)
        // console.log('fgsadfg 2', emojiLabels[label])
        const res = await fetch('/getData', {
            method: 'POST',
            body: formData
        })
        const resResult = await res.json()
        console.log('sdgsdgh', resResult)

        // Update score
        if (resResult.score) {
            let accScore = parseInt(score.textContent)
            if (isNaN(accScore)) {
                accScore = 0
            }
            score.innerHTML = +accScore + +resResult.score
        }
        clearInterval(startTimer)
        round++

        // 1s Pause if corrected
        setTimeout(() => {
            let seconds = currentTimer.substring(0, 2)
            let milliseconds = currentTimer.substring(currentTimer.length - 2, currentTimer.length)
            startTimer = setTimer(+seconds + bonusTime, +milliseconds)

            // Set delay to prevent from overlapping prediction
            setTimeout(() => {
                ableToSkip = true
                delayPredict = true
                // predictModel()
                video.play()
                pauseRequestFrameCross = false
                originTimer = timer.textContent
            }, 50)
        }, 1000)

        // return
    }

    // Draw frames from video to canvas
    ctx.drawImage(video, 0, 0);

    // Pause prediction when paused
    if (!pauseRequestFrameCross) {
        requestAnimationFrameCross(predictModel);
    }
}

// Submit Name
enterName.addEventListener('submit', async (event) => {
    event.preventDefault()
    let form = event.target
    const formObj = {
        name: form.name.value,
        score: score.textContent
    }
    enterName.style.display = 'none'
    const res = await fetch('/enterName', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formObj)
    })
    const result = await res.json()
    // Redirect to result page
    if (result.success) {
        window.location.href = './result.html'
    }
})


