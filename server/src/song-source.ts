import fs from 'fs-extra';
import url from 'url';
import fetch from 'node-fetch';
import { Logger } from 'winston'

// Interfaces
export interface SongSource {
    media_size: number,
    buffer_size: number,
    read_stream: fs.ReadStream
}

export interface SongSourceCreator {
    create: (songPath: string) => Promise<SongSource>,
    check: (songSource: string) => Promise<boolean>
}

// Constants

export const HEADER_CHUNK_SIZE: number = 40;
export const BUFF_SIZE_AUDIO_RENDERER = 16384;
export const TRANSMIT_CHUNK_MULTIPLIER = 2;
export const BUFFER_SIZE_STREAMING = BUFF_SIZE_AUDIO_RENDERER * TRANSMIT_CHUNK_MULTIPLIER;

// SourceCreators
import Local from './song-sources/local-file';
import Remote from './song-sources/remote-file';

export const Sources = {
    Local,
    Remote
}

const createSongSourceAsync = (logger: Logger, sourceCreators: SongSourceCreator[] = []) => async (songSource: string): Promise<SongSource> => {
    if (!songSource) throw new Error('Invalid songSource: ' + songSource);

    for (const creator of sourceCreators){
        if(await creator.check(songSource)) {
            return creator.create(songSource);
        }
    }

    throw new Error('Could not resolve songSource to any supported types.');
}

export default createSongSourceAsync;