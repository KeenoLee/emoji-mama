import express from 'express';
import expressSession from 'express-session'
import {Server as SocketIO} from 'socket.io'
import cors from 'cors'
import http from 'http'
import { knex } from './app'
import { PlayerService } from './playerService';
import { PlayerController } from './playerController';
import { SinglePlayController } from './singlePlayController';
// Try MultiPlay


let app = express();
app.use(cors())
const server = new http.Server(app)
// const io = new SocketIO(server)
const io = new SocketIO(server, {
    cors: {
        origin: 'http://localhost:8101',
        methods: ['GET', 'POST']
    }
})

let playerService = new PlayerService(knex);
let playerController = new PlayerController(playerService);
let singlePlayController = new SinglePlayController();
declare module 'express-session' {
    interface SessionData {
        cookie: Cookie
        grant?: any
    }
}
export let sessionMiddleware = expressSession({
    secret: 'Project 2',
    resave: true,
    saveUninitialized: true,
})

// let routes = express.Router();
io.on('connection', (socket) => {
    socket.emit('me', socket.id)
    console.log('id: ', socket.id)
    socket.on('disconnect', () => {
        socket.broadcast.emit('callEnded')
    })
    socket.on("callUser", (data) => {
        io.to(data.userToCall).emit('callUser', {signal: data.signalData, from: data.from, name: data.name})
    })
    socket.on('answerCall', (data) => {
        io.to(data.to).emit('callAccepted', data.signal)
    })

})


app.use(sessionMiddleware)
app.post('/record', playerController.record)
app.post('/sendImage', singlePlayController.sendImage)
app.get('/endGame', singlePlayController.endGame)
// app.get('/', (req, res) => {
//     console.log('Server is connected');
//     res.end('Hello from express');
// });


const port = 8100;

app.use(express.static('public'))

server.listen(port, () => {
    console.log('listening at http://localhost:' + port)
})