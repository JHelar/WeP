import EventEmitter from "events";
import { SongSource } from "./song-source";
import { Logger } from "winston";

export default class Streamer extends EventEmitter {

    constructor(private logger: Logger){
        super()
    }

    private sourceEnded(){
        this.logger.info('Song ended');
        this.emit('song_end');
    }

    private stream(source: SongSource){
        this.logger.info('Streaming')
        
        const { read_stream, buffer_size } = source;
        read_stream.on('data', chunk => {
            
        });
    }

    public play(source: SongSource){
        this.logger.info('New song');

        // Setup end event
        source.read_stream.on('end', this.sourceEnded.bind(this));

        // Start streaming new source
        this.stream(source);
    }
}