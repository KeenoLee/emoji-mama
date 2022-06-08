import express from 'express';
// import { Request, Response } from 'express';

let app = express();

app.get('/', (req, res) => {
    console.log('Server is connected');
    res.end('Hello from express');
});

const port = 8100;

app.listen(port, () => {
    console.log('listening at http://localhost:' + port)
})