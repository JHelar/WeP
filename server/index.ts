import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { AddressInfo } from 'net';
import winston, { stream } from 'winston';
import { Writable } from 'stream';

import sc, { Sources, SongSource } from './src/song-source';
import createQueue from './src/song-queue';
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
const streamer = new Streamer(logger, new Writable({
    write(chunk, enc, cb) {
        console.log(chunk);
        cb();
    }
}));

// Initialize SongQueue
const queue = createQueue<SongSource>();

// Add items to queue
const songs = Promise.all([
    createSongSource('http://ccrma.stanford.edu/~jos/mp3/Harpsichord.mp3'),
    createSongSource('https://www.sample-videos.com/audio/mp3/crowd-cheering.mp3'),
])

songs
    .then(s => {
        s.forEach(queue.enqueue)
        streamer.play(queue.pop()!)
    })
    .catch(logger.error);

streamer.on('song:end', () => {
    logger.info('Song ended, play next');
    streamer.play(queue.pop()!);
});
streamer.on('song:chunk', chunk => {
    logger.info('Chunk')
    setTimeout(streamer.send_next_chunk, 1000);
});

// server.listen(process.env.PORT || 8080, () => {
//     console.log(`Server started on port ${(server.address() as AddressInfo).port}!`)
// })