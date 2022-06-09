import express from 'express';
import { PlayerService } from './playerService';
import { PlayerController } from './playerController';
import { SinglePlayController } from './singlePlayController';


let app = express();

// let routes = express.Router();
let playerService = new PlayerService();
let playerController = new PlayerController(playerService);
let singlePlayController = new SinglePlayController();

app.post('/record', playerController.record)

app.post('/sendImage', singlePlayController.sendImage)
// app.get('/', (req, res) => {
//     console.log('Server is connected');
//     res.end('Hello from express');
// });

const port = 8100;

app.use(express.static('public'))

app.listen(port, () => {
    console.log('listening at http://localhost:' + port)
})