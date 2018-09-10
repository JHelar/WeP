import { SongSource } from "./song-source";
import { Logger } from "winston";

import EventEmitter from "events";
import { Writable } from 'stream';

const createWriteStream = (write: (chunk: any, encoding: string, callback: (error?: Error | null) => void) => void) => new Writable({
    write
})

export default class Streamer extends EventEmitter {

    private stream_callback: any = null;

    constructor(private logger: Logger, private writer: Writable){
        super();
        this.send_next_chunk = this.send_next_chunk.bind(this);
        this.sourceEnded = this.sourceEnded.bind(this);
    }

    private writeToStream(chunk: any, encoding: string, callback: (error?: Error | null) => void) {
        this.send_chunk(chunk);
        this.stream_callback = callback;
    }

    private sourceEnded(){
        this.logger.debug('Source ended');
        this.emit('song:end');
    }

    private send_chunk(chunk: Buffer){
        this.emit('song:chunk', {
            chunk
        })
    }

    public send_next_chunk(): void {
        if(this.stream_callback) {
            this.stream_callback();
        }
    }

    public play(source: SongSource){
        if(!source) {
            this.logger.info('No valid source to play.');
            return;
        }
        this.logger.info('New song');

        // Setup end event
        source.read_stream.on('end', this.sourceEnded);
        source.read_stream.pipe(createWriteStream(this.writeToStream.bind(this)));
    }
}