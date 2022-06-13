import Button from "@material-ui/core/Button"
import IconButton from "@material-ui/core/IconButton"
import TextField from "@material-ui/core/TextField"
import PhoneIcon from "@material-ui/icons/Phone"
import React, { useEffect, useRef, useState } from "react"
// import ReactDom from 'react-dom'
// Copy ID to send to other users
import { CopyToClipboard } from "react-copy-to-clipboard"
// Peer connection
import Peer from "simple-peer"
import { io } from "socket.io-client"
import "./App.css"


const socket = io.connect('http://localhost:8101')
function App() {

  // My ID
  const [me, setMe] = useState("")
  const [stream, setStream] = useState()
  const [receivingCall, setReceivingCall] = useState(false)
  const [caller, setCaller] = useState("")
  const [callerSignal, setCallerSignal] = useState()
  const [callAccepted, setCallAccepted] = useState(false)
  // Pass the ID to call through copying clipboard
  const [idToCall, setIdToCall] = useState("")
  const [callEnded, setCallEnded] = useState(false)
  // Name that going to pass along
  const [name, setName] = useState("")

  // Reference video that will be passing through a video tag
  const myVideo = useRef()
  const userVideo = useRef()
  // Allow to disconnect when a call is going to end-up
  const connectionRef = useRef()

  useEffect(() => {
    // navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
    //   setStream(stream)
    //   myVideo.current.srcObject = stream
    // })
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

  return (
    <>
      {/* <h1 style={{ textAlign: "center", color: '#fff' }}>MultiPlay</h1> */}
      <div className="header">
        <div className="score">
          <div className="my-score">Your Score</div>
          <div className="enemy-score">Enemy Score</div>
        </div>
        <div className="current-emoji">MultiPlay</div>
        <div className="timer">00:00</div>
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
          <TextField
            id="filled-basic"
            label="Name"
            variant="filled"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <CopyToClipboard text={me} style={{ marginBottom: "2rem" }}>
            <Button variant="contained" color="primary">
              Copy My ID
            </Button>
          </CopyToClipboard>
          <TextField
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
              <Button variant="contained" color="secondary" onClick={leaveCall}>
                End Call
              </Button>
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
              <Button variant="contained" color="primary" onClick={answerCall}>
                Answer
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  )
}

export default App