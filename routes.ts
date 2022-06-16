import express, { Request, Response } from 'express';
import { print } from "listening-on";
import expressSession from 'express-session'
import { Server as SocketIO } from 'socket.io'
import cors from 'cors'
import http from 'http'
import { knex } from './app'
import { SinglePlayController } from './singlePlayController';
import path, { join, resolve } from 'path';
import fs from 'fs';
import { SinglePlayService } from './singlePlayService';

// Try MultiPlay

let app = express();
app.use(cors())
// const server = new http.Server(app)
// const io = new SocketIO(server)
// const io = new SocketIO(server, {
//     cors: {
//         origin: 'http://localhost:8101',
//         methods: ['GET', 'POST']
//     }
// })

let singlePlayService = new SinglePlayService(knex)
let singlePlayController = new SinglePlayController(singlePlayService);
declare module 'express-session' {
    interface SessionData {
        cookie: Cookie
        image: string
    }

}
export let sessionMiddleware = expressSession({
    secret: 'Project 2',
    resave: true,
    saveUninitialized: true,
})

// let routes = express.Router();
// io.on('connection', (socket) => {
//     socket.emit('me', socket.id)
//     console.log('id: ', socket.id)
//     socket.on('disconnect', () => {
//         socket.broadcast.emit('callEnded')
//     })
//     socket.on("callUser", (data) => {
//         io.to(data.userToCall).emit('callUser', { signal: data.signalData, from: data.from, name: data.name })
//     })
//     socket.on('answerCall', (data) => {
//         io.to(data.to).emit('callAccepted', data.signal)
//     })
//     socket.on('takeScreenShot', (data) => {
//         console.log('image? ', data)
//         let parts = data.image.split(/,\s*/);
//         const buffer = Buffer.from(parts[1], "base64");
//         let ext = parts[0].match(/\/(\w+);/)?.[1];
//         let filename = 'image' + "." + ext;
//         const filePath = path.join(`./public/uploads`, filename)
//         fs.writeFileSync(filePath, buffer);
//         socket.emit('takeScreenShotSuccess', 'success')
//     })
// })


app.use(sessionMiddleware)

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post('/lobby', singlePlayController.deleteImage)
app.get('/result', singlePlayController.getImage)
app.post('/getData', singlePlayController.getData)
app.get('/endGame', singlePlayController.endGame)
app.get('/rank', singlePlayController.getTopTenPlayers)
app.post('/getSpecialModeData', singlePlayController.getData)
app.post('/enterSpecialModeName', singlePlayController.enterName)
app.post('/enterName', singlePlayController.enterName)


// app.get('/', (req, res) => {
//     console.log('Server is connected');
//     res.end('Hello from express');
// });


const port = 8100;

app.use(express.static('public'))
app.use(express.static("uploads"))

app.use((_, res) => {
    res.sendFile(resolve(join("public", "404.html")));
});

app.listen(port, () => {
    print(port)
})