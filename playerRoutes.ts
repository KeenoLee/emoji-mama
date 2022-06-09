import express from 'express';
import { Client } from 'pg';
import { PlayerService } from './playerService';
import { PlayerController } from './playerController';

let app = express();

let routes = express.Router();
let client = new Client();
let playerService = new PlayerService(client);
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