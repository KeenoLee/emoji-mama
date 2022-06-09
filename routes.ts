import express from 'express';
import { PlayerService } from './playerService';
import { PlayerController } from './playerController';
import { SinglePlayController } from './singlePlayController';


let app = express();

let routes = express.Router();
let playerService = new PlayerService();
let playerController = new PlayerController(playerService);
let singlePlayController = new SinglePlayController();

routes.post('/record', playerController.record)

routes.post('/sendImage', singlePlayController.sendImage)
// app.get('/', (req, res) => {
//     console.log('Server is connected');
//     res.end('Hello from express');
// });

const port = 8100;

express.static('public')

app.listen(port, () => {
    console.log('listening at http://localhost:' + port)
})