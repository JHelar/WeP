"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const stream_1 = require("stream");
const beforeWriter = new stream_1.Writable({
    write(chunk, encoding, cb) {
        console.log('Before');
    }
});
class Streamer extends events_1.default {
    constructor(logger, writer) {
        super();
        this.logger = logger;
        this.writer = writer;
        this.stream_callback = null;
    }
    sourceEnded() {
        this.logger.info('Song ended');
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
        this.logger.info('New song');
        // Setup end event
        source.read_stream.on('end', this.sourceEnded.bind(this));
        source.read_stream.pipe(new stream_1.Writable({
            write: (chunk, enc, cb) => {
                this.send_chunk(chunk);
                this.stream_callback = cb;
            }
        }));
    }
}
exports.default = Streamer;
