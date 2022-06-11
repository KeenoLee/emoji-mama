import express from 'express';
import expressSession from 'express-session'
import {Server as SocketIO} from 'socket.io'
import http from 'http'
import { ExpressPeerServer } from 'peer'
import { knex } from './app'
import { PlayerService } from './playerService';
import { PlayerController } from './playerController';
import { SinglePlayController } from './singlePlayController';
// import { MultiPlayController } from './multiPlayController';


let app = express();
const server = new http.Server(app)
const io = new SocketIO(server)
let playerService = new PlayerService(knex);
let playerController = new PlayerController(playerService);
let singlePlayController = new SinglePlayController();
// let multiPlayController = new MultiPlayController();
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

const peerServer = ExpressPeerServer(server, {
    // debug: true,
});

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