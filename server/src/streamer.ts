import { SongSource } from "./song-source";
import { Logger } from "winston";

import EventEmitter from "events";
import { Writable } from 'stream';

const beforeWriter = new Writable({
    write(chunk, encoding, cb){
        console.log('Before');
    
    }
})

export default class Streamer extends EventEmitter {

    private stream_callback: any = null;

    constructor(private logger: Logger, private writer: Writable){
        super();

    }

    private sourceEnded(){
        this.logger.info('Song ended');
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
        this.logger.info('New song');

        // Setup end event
        source.read_stream.on('end', this.sourceEnded.bind(this));
        source.read_stream.pipe(new Writable({
            write: (chunk, enc, cb) => {
                this.send_chunk(chunk);
                this.stream_callback = cb;
            }
        }))
    }
}