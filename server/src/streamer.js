"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
class Streamer extends events_1.default {
    constructor(logger) {
        super();
        this.logger = logger;
    }
    sourceEnded() {
        this.logger.info('Song ended');
        this.emit('song_end');
    }
    stream(source) {
        this.logger.info('Streaming');
        const { read_stream, buffer_size } = source;
        read_stream.on('data', this.logger.info);
    }
    play(source) {
        this.logger.info('New song');
        // Setup end event
        source.read_stream.on('end', this.sourceEnded.bind(this));
        // Start streaming new source
        this.stream(source);
    }
}
exports.default = Streamer;
