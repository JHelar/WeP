import url from 'url';
import fetch from 'node-fetch';
import fs from 'fs-extra';
import { Logger } from "winston";
import { SongSource, HEADER_CHUNK_SIZE, BUFFER_SIZE_STREAMING, SongSourceCreator } from "../song-source";

const TEMP_FILE_PATH = './tmp-file';

const localSource = (logger: Logger) : SongSourceCreator => {
    const create = async (songPath: string): Promise<SongSource> => {

        logger.info(`Creating SongSource from remote path: ${songPath}`);

        const result = await fetch(songPath);
        return new Promise<SongSource>((res, rej) => {

            const tempFile = fs.createWriteStream(TEMP_FILE_PATH);
            result.body.pipe(tempFile);
            result.body.on('error', rej);

            tempFile.on('finish', () => {
                const read_stream = fs.createReadStream(TEMP_FILE_PATH);
                const media_size = 0;//(localStat.size - HEADER_CHUNK_SIZE) / 2;

                read_stream.on('end', async () => {
                    await fs.unlink(TEMP_FILE_PATH)
                    logger.info('Deleted temp file.');
                })

                res({
                    read_stream,
                    buffer_size: BUFFER_SIZE_STREAMING,
                    media_size
                })
            })

            tempFile.on('error', rej);
        });
        
    }

    const isRemote = (songSource: string): Promise<boolean> => {
        const { hostname, path } = url.parse(songSource);
        return Promise.resolve((hostname && path!.match(/\.(mp3)$/) ? true : false));
    }

    return {
        create,
        check: isRemote
    }
}

export default localSource;