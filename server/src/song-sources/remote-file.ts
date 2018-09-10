import url from 'url';
import fetch from 'node-fetch';
import fs from 'fs-extra';
import { Logger } from "winston";
import uuid from 'uuid';

import { SongSource, HEADER_CHUNK_SIZE, BUFFER_SIZE_STREAMING, SongSourceCreator } from "../song-source";


const TEMP_FILE_PATH = './temp/';

const localSource = (logger: Logger) : SongSourceCreator => {
    const create = async (songPath: string): Promise<SongSource> => {

        logger.info(`Creating SongSource from remote path: ${songPath}`);

        const result = await fetch(songPath);
        return new Promise<SongSource>((res, rej) => {

            const tempFilePath = `${TEMP_FILE_PATH}temp-${uuid.v1()}`;

            const tempFile = fs.createWriteStream(tempFilePath);
            result.body.pipe(tempFile);
            result.body.on('error', rej);

            tempFile.on('finish', async () => {
                const stat = await fs.stat(tempFilePath);

                const read_stream = fs.createReadStream(tempFilePath,{
                    flags: 'r',
                    mode: 0x666,
                    highWaterMark: BUFFER_SIZE_STREAMING
                });

                const media_size = (stat.size - HEADER_CHUNK_SIZE) / 2;

                read_stream.on('end', async () => {
                    await fs.unlink(tempFilePath)
                    logger.info('Deleted temp file.');
                })

                res({
                    buffer_size: BUFFER_SIZE_STREAMING,
                    read_stream,
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