import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { AddressInfo } from 'net';
import winston, { stream } from 'winston';

import sc, { Sources } from './src/song-source';
import Streamer from './src/streamer';

const app = express();

// Initialize a simple http server
const server = http.createServer(app);

// Initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

// Initialize logger
const logger = winston.createLogger({
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        verbose: 3,
        debug: 4,
        silly: 5
    },
    transports: [
        new winston.transports.Console()
    ]
})

// Initialize song source creator
const createSongSource = sc(logger, [
    Sources.Local(logger),
    Sources.Remote(logger)
]);

// Initialize Streamer
const streamer = new Streamer(logger);
streamer.on('song_data', data => logger.info(data));

createSongSource('http://ccrma.stanford.edu/~jos/mp3/Harpsichord.mp3')
    .then(result => {
        streamer.play(result);
    })
    .catch(err => logger.error(err.message))

// server.listen(process.env.PORT || 8080, () => {
//     console.log(`Server started on port ${(server.address() as AddressInfo).port}!`)
// })