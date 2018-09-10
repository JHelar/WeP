"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const ws_1 = __importDefault(require("ws"));
const winston_1 = __importDefault(require("winston"));
const stream_1 = require("stream");
const song_source_1 = __importStar(require("./src/song-source"));
const song_queue_1 = __importDefault(require("./src/song-queue"));
const streamer_1 = __importDefault(require("./src/streamer"));
const app = express_1.default();
// Initialize a simple http server
const server = http_1.default.createServer(app);
// Initialize the WebSocket server instance
const wss = new ws_1.default.Server({ server });
// Initialize logger
const logger = winston_1.default.createLogger({
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        verbose: 3,
        debug: 4,
        silly: 5
    },
    transports: [
        new winston_1.default.transports.Console()
    ]
});
// Initialize song source creator
const createSongSource = song_source_1.default(logger, [
    song_source_1.Sources.Local(logger),
    song_source_1.Sources.Remote(logger)
]);
// Initialize Streamer
const streamer = new streamer_1.default(logger, new stream_1.Writable({
    write(chunk, enc, cb) {
        console.log(chunk);
        cb();
    }
}));
// Initialize SongQueue
const queue = song_queue_1.default();
// Add items to queue
const songs = Promise.all([
    createSongSource('http://ccrma.stanford.edu/~jos/mp3/Harpsichord.mp3'),
    createSongSource('https://www.sample-videos.com/audio/mp3/crowd-cheering.mp3'),
]);
songs
    .then(s => {
    s.forEach(queue.enqueue);
    streamer.play(queue.pop());
})
    .catch(logger.error);
streamer.on('song:end', () => {
    logger.info('Song ended, play next');
    streamer.play(queue.pop());
});
streamer.on('song:chunk', chunk => {
    logger.info('Chunk');
    setTimeout(streamer.send_next_chunk, 1000);
});
// server.listen(process.env.PORT || 8080, () => {
//     console.log(`Server started on port ${(server.address() as AddressInfo).port}!`)
// })
