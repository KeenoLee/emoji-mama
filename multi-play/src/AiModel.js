import { useEffect, useState } from 'react';

export function SetTimer() {
    let s = 59
    let ms = 99
    let setTime;
    let stopCount = false
    const [timer, setTimer] = useState('')
    useEffect(() => {
        setInterval(() => {
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
            setTimer(setTime)
        }, 10)
    }, [setTime])
    return <div className="timer">{timer}</div>
}

export function GenEmoji() {
    let labels = ['beverages', 'books', 'bottles', 'cards', 'chairs', 'glasses', 'keyboards', 'keys', 'mouses', 'notebooks', 'pants', 'pens', 'phones', 'rings', 'shoes', 'televisions', 'tissues', 'topwears', 'umbrellas', 'watches']
        const emojiLabels = ["🧃", "📕", "🍾", "💳", "🪑", "👓", "⌨️", "🔑 ", "🖱️", "💻", "👖", "🖊️", "📱", "💍", "👟", "📺", "🧻", "👕", "🌂", "⌚"]
        let labelCount = {}
        labels.map((label) => {
            labelCount[label] = 0
        })

    const [emojiDup, setEmojiDup] = useState({})
    const [round, setRound] = useState(0)
    const [emoji, setEmoji] = useState('')


    useEffect(() => {
        setRound
    })

    useEffect = (() => {

        labelCount[labels[result]]++
    }, [round])



    


    return <div className='current-emoji'>Round{round}: {emoji}</div>
}