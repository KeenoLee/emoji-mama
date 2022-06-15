// model variables
let model;

// webCam
const video = document.querySelector('video');

// webCam display
const canvas = document.getElementById('output');
    // 以Canvas形式Display 2D既片/圖
const ctx = canvas.getContext('2d'); 

// debugMessage
const debugMessage = document.getElementById("debugMessage")
// console.log("Width:", window.innerWidth)
// console.log("Height:", window.innerHeight)

// stats library
const stats = new Stats();

const imgSize = 640
const modelUrlPath = 'https://cdn.jsdelivr.net/gh/tszfungkoktf/emojimama-model/best_web_model/model.json'
const scoreThras = 0.25 // score lower then that will not display

const labels = ['umbrellas','keys','bottles','books','cards','chairs','keyboards','laptop','pens','phones','topwears','pants','shoes','glasses','watches','rings','mouses','tissues','beverages','televisions']
const emojiLabels = ["🌂","🔑 ","🍾","📕","💳","🪑","⌨️","💻","🖊️","📱","👕","👖","👟","👓","⌚","💍","🖱️","🧻","🧃","📺"]


async function getMedia() {
    let mediaStream = null;

    let constraints = window.constraints = {
        audio: false,
        video: {
            //For Mobile Set前置/後置Camera
            //In Mobile: "前置：user"；後置："environment" 
            facingMode: "environment",
            //Set size of webcam display, Ideal: 1280x720  
            width: { min: 1024, ideal: 1280, max: 1920 },
            height: { min: 576, ideal: 720, max: 1080 }
        }
    };
  
    try {
    // try get camera permission from client (Eg. Pop up window: Request Camera Permission)
    // navigator.mediaDevices.getUserMedia 入邊要有一個Parameters which call constraints 
    // constraints 入邊會有兩樣野audio or video~
      mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    //   console.log(mediaStream)

      window.stream = mediaStream
      video.srcObject = mediaStream

    } catch(err) {
        console.log(err);
    }
}

// create load model and active cameras
async function loadModel(){

    model = await tf.loadGraphModel(modelUrlPath);

    // Set up canvas w and h
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    document.querySelector('.loader-wrapper').style.display = 'none';
    predictModel();
}

// Webcam load successfully -> action load model
video.addEventListener('loadeddata', async () => {
    loadModel();
});

window.onload = async () => {
    getMedia();
}

// Timer
let startedCount = false
let stopCount = false

const countDown = document.getElementById('timer')

function setTimer () {
    return setInterval((timer) => {
        timer = +(countDown.innerHTML)-- 
    } ,1000)
} 

let originTimer = '60'



// Create Key value pair -> label : labelCount, Eg glasses: 0,
let labelCount = {}
function checkEmojiDup () {
    labels.map((label) => {
        labelCount[label] = 0
    })
    return labelCount
}
checkEmojiDup()

//Sum of labelCount 入邊個數，就知道Label出現左幾多次，即係第幾Round
//Object.values(比番個Object佢) -> 之後用reduce既方法 sum of (前面＋後面) values
function checkRound(labelCount) {
    return Object.values(labelCount).reduce((pre,cur) => pre + cur)
}

let round = 1
function findEmoji(round, checkEmojiDup) {
    let emojiResult = Math.floor(Math.random() * labels.length) // labelsArray[0-19]
    if (checkEmojiDup[labels[emojiResult]] > 0) {
        return findEmoji(round, checkEmojiDup)
    }
    if (checkRound(labelCount) == (round - 1)) {
        checkEmojiDup[labels[emojiResult]]++
        return emojiResult
    }
}

// Loop webcam
var requestAnimationFrameCross = window.webkitRequestAnimationFrame ||
        window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame || window.msRequestAnimationFrame;

let findEmojiIcon = document.getElementById('find-emoji')
let pageScore = document.getElementById('current-score')
let startTimer = true;
let stopTimer = false;
let myTimer;
let label;
let successRate = 0.25
let pausePredict = false

countDown.textContent = originTimer
async function predictModel(){
    
    stats.begin();
    // Prevent memory leaks by using tidy 
    let imgPre = await tf.tidy(() => { 
        return tf.browser.fromPixels(video)
            .resizeNearestNeighbor([imgSize, imgSize])
            .toFloat()
            .div(tf.scalar(255.0)) 
            .expandDims();
    });
    
    const result = await model.executeAsync(imgPre)
    const font = "50px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";

    if (startTimer) {
        myTimer = setTimer()
        startTimer = false
    } 

    if (countDown.innerHTML == 0) {
        clearInterval(myTimer) // Stop the Timer , if not, it'll show NaN after Time Out!
        countDown.innerHTML = 'Time Out!' // 
        stopTimer = false 
    }

    if(checkRound(labelCount) == (round - 1)) {
        label = findEmoji(round, labelCount)
        findEmojiIcon.innerHTML = `${emojiLabels[label]}`
        console.log(`Find ${labels[label]}`)

    }

    const [boxes, scores, classes, valid_detections] = result;
    // console.log(classes);
    const boxes_data = boxes.dataSync();
    // console.log(boxes_data);
    const scores_data = scores.dataSync();
    const classes_data = classes.dataSync();
    const valid_detections_data = valid_detections.dataSync()[0];
    // console.log(scores_data);
    // console.log(classes_data);
    // console.log(valid_detections_data);

    // Prevent memory leaks also
    await tf.dispose(result);
    await tf.dispose(imgPre);
    await tf.disposeVariables(result);

    ctx.drawImage(video, 0, 0);

    
    
    for (let i = 0; i < valid_detections_data; ++i) {

        if( scores_data[i] <= scoreThras){
            continue;
        }

        let [x1, y1, x2, y2] = boxes_data.slice(i * 4, (i + 1) * 4);

        x1 *= canvas.width;
        x2 *= canvas.width;
        y1 *= canvas.height;
        y2 *= canvas.height;

        const width = x2 - x1;
        const height = y2 - y1;
        const klass = emojiLabels[classes_data[i]];
        const score = (scores_data[i].toFixed(2))*100 + "%"; 

        // Draw the bounding box. (draw box)
        ctx.strokeStyle = colorArray[classes_data[i]];
        ctx.lineWidth = 4;
        ctx.strokeRect(x1, y1, width, height);

        // Draw the label background. (draw label bg)
        ctx.fillStyle = colorArray[classes_data[i]];
        const textWidth = ctx.measureText(klass + ":" + score).width;
        const textHeight = parseInt(font, 10); // base 10
        ctx.fillRect(x1, y1, textWidth + 4, textHeight + 4);

        // Draw the text last to ensure it's on top. (draw label)
        ctx.fillStyle = "#000000";
        ctx.fillText(klass + ":" + score, x1, y1);  

    }
    // console.log(classes_data)
    let higherProbClass = classes_data[0]
    console.log()
    if (labels[label] == labels[higherProbClass]) {
    // if (labels[label] == labels[higherProbClass] && pausePredict == false) {
        console.log('correct: ', labels[label])
        
        
        if (scores_data[0] > successRate) {
            console.log('success!')
            video.pause()
            // pausePredict = true
            let imgURL = canvas.toDataURL("image/png");
            
            let currentTimer = countDown.innerHTML
            timeSpace = (+originTimer) - (+currentTimer) 
            originTimer = currentTimer

            let formData = new FormData
            formData.append('image', imgURL)
            formData.append('round', round)
            formData.append('timeSpace', timeSpace)
            formData.append('emoji', emojiLabels[label])

            // let data = {image: imgURL, round: round, timeSpace: timeSpace }
            const res = await fetch('/getSpecialModeData', {
                method: 'POST',
                // headers: {
                //     'Content-Type': 'application/json'
                // },
                body: formData
            })
            let result = await res.json()
            console.log('fetched: ', result)
            console.log('type: ', typeof +pageScore.textContent)
            console.log('content: ', pageScore.textContent)
            if (result.score) {
                // if (isNaN(pageScore.textContent)) {
                //     pageScore.textContent = 0
                // }
                let num = +pageScore.textContent
                num += parseInt(result.score)

                // parseInt(pageScore.innerHTML) += parseInt(result.score)
                pageScore.textContent = num
                video.play()
                predictModel()
                round++
            }
            
        }
    }
    stats.end();
    requestAnimationFrameCross(predictModel);        
}

// Color Array for the bounding label
const colorArray = 
['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', 
'#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
'#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A', 
'#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
'#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC', 
'#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
'#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680', 
'#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
'#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3', 
'#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

