"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const stream_1 = require("stream");
const createWriteStream = (write) => new stream_1.Writable({
    write
});
class Streamer extends events_1.default {
    constructor(logger, writer) {
        super();
        this.logger = logger;
        this.writer = writer;
        this.stream_callback = null;
        this.send_next_chunk = this.send_next_chunk.bind(this);
        this.sourceEnded = this.sourceEnded.bind(this);
    }
    writeToStream(chunk, encoding, callback) {
        this.send_chunk(chunk);
        this.stream_callback = callback;
    }
    sourceEnded() {
        this.logger.debug('Source ended');
        this.emit('song:end');
    }
    send_chunk(chunk) {
        this.emit('song:chunk', {
            chunk
        });
    }
    send_next_chunk() {
        if (this.stream_callback) {
            this.stream_callback();
        }
    }
    play(source) {
        if (!source) {
            this.logger.info('No valid source to play.');
            return;
        }
        this.logger.info('New song');
        // Setup end event
        source.read_stream.on('end', this.sourceEnded);
        source.read_stream.pipe(createWriteStream(this.writeToStream.bind(this)));
    }
}
exports.default = Streamer;
