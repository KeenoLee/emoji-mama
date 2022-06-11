import express from 'express';
import expressSession from 'express-session'
import { knex } from './app'
import { PlayerService } from './playerService';
import { PlayerController } from './playerController';
import { SinglePlayController } from './singlePlayController';


let app = express();
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

let playerService = new PlayerService(knex);
let playerController = new PlayerController(playerService);
let singlePlayController = new SinglePlayController();

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

app.listen(port, () => {
    console.log('listening at http://localhost:' + port)
})