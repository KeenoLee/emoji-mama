import express from 'express';
import { PlayerService } from './playerService';
import { PlayerController } from './playerController';

let app = express();

let routes = express.Router();
let playerService = new PlayerService();
let playerController = new PlayerController(playerService);

routes.post('/record', playerController.record)

// app.get('/', (req, res) => {
//     console.log('Server is connected');
//     res.end('Hello from express');
// });

const port = 8100;

app.listen(port, () => {
    console.log('listening at http://localhost:' + port)
})