import fs from 'fs-extra';
import { Logger } from "winston";
import { SongSource, HEADER_CHUNK_SIZE, BUFFER_SIZE_STREAMING, SongSourceCreator } from "../song-source";

const localSource = (logger: Logger) : SongSourceCreator => {
    const create = async (songPath: string): Promise<SongSource> => {
        
        logger.info(`Creating SongSource from local path: ${songPath}`);

        const stat = await fs.stat(songPath);

        if (!stat.isFile()) throw new Error(`${songPath} is not a file`);

        const media_size = (stat.size - HEADER_CHUNK_SIZE) / 2;

        const read_stream = fs.createReadStream(songPath, {
            flags: 'r',
            mode: 0x666,
            highWaterMark: BUFFER_SIZE_STREAMING
        })

        return {
            buffer_size: BUFFER_SIZE_STREAMING,
            media_size,
            read_stream
        }
    }

    const isLocal = (songSource: string): Promise<boolean> => {
        return fs.pathExists(songSource);
    }

    return {
        create,
        check: isLocal
    }
}

export default localSource;