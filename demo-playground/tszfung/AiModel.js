
const modelUrlPath = 'https://cdn.jsdelivr.net/gh/tszfungkoktf/emojimama-model/tfModels/model.json'

export async function loadModel() {
    model = await tf.loadGraphModel(modelUrlPath);
    predictModel()
}

export async function predictModel() {
    let imgPre = await tf.tidy(() => {
        return tf.browser.fromPixels(video)
            .resizeNearestNeighbor([imgSize, imgSize])
            .toFloat()
            .div(tf.scalar(divNum))
            .sub(tf.scalar(subNum))
            .expandDims();
    });
    const result = await model.predict(imgPre).data();
    await tf.dispose(imgPre);


    if (stopCount) {
        clearInterval(startTimer)
        //
        timer.textContent = 'Time Out!'
        const res = await fetch(`/endGame`)
        console.log('fetched: ', res)
    }
    if (!startedCount && !stopCount) {
        startTimer = setTimer(59, 99)
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
        //
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
            let currentTimer = timer.textContent
            let seconds = currentTimer.substring(0, 2)
            let miniSeconds = currentTimer.substring(currentTimer.length - 2, currentTimer.length)
            console.log(seconds, miniSeconds)
            clearInterval(startTimer)
            round++
            setTimeout(() => {
                video.play()
                predictModel()
                startTimer = setTimer(+seconds + bonusScore, +miniSeconds)
                // startTimer()
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
