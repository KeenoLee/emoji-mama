// import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
// import TextField from "@material-ui/core/TextField"
import PhoneIcon from "@material-ui/icons/Phone"
import React, { useEffect, useRef, useState, createRef } from "react"
// import ReactDom from 'react-dom'
// Copy ID to send to other users
import { CopyToClipboard } from "react-copy-to-clipboard"
// Peer connection
import Peer from "simple-peer"
import { io } from "socket.io-client"
import { useScreenshot } from 'use-react-screenshot'
import * as tf from "@tensorflow/tfjs";
// import "@tensorflow/tfjs-backend-cpu";
// import "@tensorflow/tfjs-backend-webgl";
// import TFJS from "tfjs"
// import { loadModel, predictModel } from "../../demo-playground/tszfung/AiModel"
import "./App.css"
import { GenEmoji, SetTimer } from "./AiModel"


const socket = io.connect('http://localhost:8100')
// AI Model
let model;
let label;
let startTimer;
let imgSize = 224;
const [divNum, subNum] = [1, 0];
let successRate = 0.1;
let startedCount = false
let stopCount = false
const timer = document.querySelector('.timer')
const modelUrlPath = 'https://cdn.jsdelivr.net/gh/tszfungkoktf/emojimama-model/tfModels/model.json'
let labels = ['beverages', 'books', 'bottles', 'cards', 'chairs', 'glasses', 'keyboards', 'keys', 'mouses', 'notebooks', 'pants', 'pens', 'phones', 'rings', 'shoes', 'televisions', 'tissues', 'topwears', 'umbrellas', 'watches']
const emojiLabels = ["🧃", "📕", "🍾", "💳", "🪑", "👓", "⌨️", "🔑 ", "🖱️", "💻", "👖", "🖊️", "📱", "💍", "👟", "📺", "🧻", "👕", "🌂", "⌚"]
let requestAnimationFrameCross = window.webkitRequestAnimationFrame ||
    window.requestAnimationFrame || window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame || window.msRequestAnimationFrame;

function App() {
    // My ID
    const [me, setMe] = useState("")
    const [stream, setStream] = useState(null)
    const [receivingCall, setReceivingCall] = useState(false)
    const [caller, setCaller] = useState("")
    const [callerSignal, setCallerSignal] = useState()
    const [callAccepted, setCallAccepted] = useState(false)
    // Pass the ID to call through copying clipboard
    const [idToCall, setIdToCall] = useState("")
    const [callEnded, setCallEnded] = useState(false)
    // Name that going to pass along
    const [name, setName] = useState("")

    // Store images from video
    const [imgArray, setImgArray] = useState([])


    // Game Logics
    // const [timer, setTimer] = useState(false)

    // Reference video that will be passing through a video tag
    const myVideo = useRef()
    const userVideo = useRef()
    // Allow to disconnect when a call is going to end-up
    const connectionRef = useRef()

    // AI Model
    const [image, takeScreenShot] = useScreenshot({
        type: 'image/jpeg',
        quality: 1.0
    })

    useEffect(() => {
        const getUserMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(stream)
                myVideo.current.srcObject = stream;
            } catch (err) {
                console.log('error: ', err);
            }
        };
        getUserMedia();

        socket.on('me', (id) => {
            setMe(id)
        })

        socket.on("callUser", (data) => {
            setReceivingCall(true)
            setCaller(data.from)
            setName(data.name)
            setCallerSignal(data.signal)
        })
    }, [])

    const callUser = (id) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream
        })
        peer.on("signal", (data) => {
            socket.emit("callUser", {
                userToCall: id,
                signalData: data,
                from: me,
                name: name
            })
        })
        peer.on("stream", (stream) => {
            userVideo.current.srcObject = stream
        })
        socket.on("callAccepted", (signal) => {
            setCallAccepted(true)
            peer.signal(signal)
        })

        connectionRef.current = peer
    }

    const answerCall = () => {
        setCallAccepted(true)
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream
        })
        peer.on("signal", (data) => {
            socket.emit("answerCall", { signal: data, to: caller })
        })
        peer.on("stream", (stream) => {
            userVideo.current.srcObject = stream
        })

        peer.signal(callerSignal)
        connectionRef.current = peer
    }

    const leaveCall = () => {
        setCallEnded(true)
        connectionRef.current.destroy()
    }

    function storeScreenShot() {
        takeScreenShot(myVideo.current);
    }
    useEffect(() => {
        if (!image) {
            return
        }
        // Local Storage
        const str = JSON.stringify([...imgArray, image])
        localStorage.setItem('imagesArrayLocalStore', str);
        setImgArray([...imgArray, image])

    }, [image])

    useEffect(() => {
        if (!stream) {
            return
        }
        loadModel()
    }, [stream])
    // ********************************************************************************
    async function loadModel() {
        model = await tf.loadGraphModel(modelUrlPath)
        predictModel()
    }

    async function predictModel() {
        let imgPre = await tf.tidy(() => {
            return tf.browser.fromPixels(myVideo.current)
                .resizeNearestNeighbor([imgSize, imgSize])
                .toFloat()
                .div(tf.scalar(divNum))
                .sub(tf.scalar(subNum))
                .expandDims();
        });
        const result = await model.predict(imgPre).data();
        await tf.dispose(imgPre);

        let probs = Math.max(...result)
        // if (checkRound(checkEmo) == (round - 1)) {
        //     label = genEmoji(round, checkEmo)
        //     currentEmoji.textContent = `${emojiLabels[label]}`
        //     console.log(`Find ${labels[label]}`)
        // }
        if (result[label] > successRate) {
            console.log('success!')
            myVideo.current.pause()
            // let currentTimer = timer.textContent

            // useEffect: Should be called if corrected
        
            await socket.emit('takeScreenShot', {
                image: image
            })
            await socket.on('takeScreenShotSuccess', (data) => {
                if (data === 'success') {
                    //     let currentTimer = timer.textContent // TIMER
                    //     let seconds = currentTimer.substring(0, 2)
                    //     let miniSeconds = currentTimer.substring(currentTimer.length - 2, currentTimer.length)
                    //     console.log(seconds, miniSeconds)
                    //     clearInterval(startTimer)
                    //     round++
                    //     setTimeout(() => {
                    //         videoRef.current.play()
                    //         predictModel()
                    //         startTimer = setTimer(+seconds + bonusScore, +miniSeconds)
                    //         // startTimer()
                    //     }, 1000)
                }
            })
        }
        requestAnimationFrameCross(predictModel);
    }
    // ********************************************************************************

    return (
        <>
            <div className="header">

                <button onClick={() => storeScreenShot()}>
                    photoooooo
                </button>

                {imgArray && imgArray.length >= 1 && imgArray.map(v => (
                    <img width={100} src={v} alt={'Screenshot'} />
                ))}

                {/* <div className="score">
                    <div className="my-score">Your Score</div>
                    <div className="enemy-score">Enemy Score</div>
                </div> */}
                {/* <div className="current-emoji">MultiPlay</div> */}
                <GenEmoji />
                {/* <div className="timer">{startTimer = setTimer()}</div> */}
                {/* <SetTimer /> */}
            </div>
            <div className="container">
                <div className="video-container">
                    {/* 1P Video */}
                    <div className="video">
                        {stream && <video playsInline muted ref={myVideo} autoPlay style={{ width: "50vw", position: 'relative' }} />}
                    </div>
                    {/* 2P Video */}
                    <div className="video">
                        {callAccepted && !callEnded ?
                            <video playsInline ref={userVideo} autoPlay style={{ width: "300px", position: 'relative', zIndex: 100 }} /> :
                            null}
                    </div>
                </div>
            </div>

            <div className="footer">
                {/* My Info */}
                <div className="myId">
                    <input
                        type='text'
                        id="filled-basic"
                        label="Name"
                        variant="filled"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                    />
                    <CopyToClipboard text={me}>
                        <button variant="contained" color="primary">
                            Copy My ID
                        </button>
                    </CopyToClipboard>
                    <input
                        type='text'
                        id="filled-basic"
                        label="ID to call"
                        variant="filled"
                        value={idToCall}
                        onChange={(event) => setIdToCall(event.target.value)}
                    />

                </div>

                {/* Receive Call */}
                <div className="call-column">
                    <div className="call-button">
                        {/* Show End Call icon when a call is accepted & call is not ended */}
                        {callAccepted && !callEnded ? (
                            <button variant="contained" color="secondary" onClick={leaveCall}>
                                End Call
                            </button>
                        ) : (
                            <IconButton color="primary" aria-label="call" onClick={() => callUser(idToCall)}>
                                <PhoneIcon fontSize="large" />
                            </IconButton>
                        )}
                        {idToCall}
                    </div>
                    {receivingCall && !callAccepted ? (
                        <div className="caller">
                            <h1 >{name} is calling...</h1>
                            <button variant="contained" color="primary" onClick={answerCall}>
                                Answer
                            </button>
                        </div>
                    ) : null}
                </div>
            </div>
        </>
    )
}

export default App