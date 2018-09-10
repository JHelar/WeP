"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = __importDefault(require("url"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const uuid_1 = __importDefault(require("uuid"));
const song_source_1 = require("../song-source");
const TEMP_FILE_PATH = './temp/';
const localSource = (logger) => {
    const create = (songPath) => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Creating SongSource from remote path: ${songPath}`);
        const result = yield node_fetch_1.default(songPath);
        return new Promise((res, rej) => {
            const tempFilePath = `${TEMP_FILE_PATH}temp-${uuid_1.default.v1()}`;
            const tempFile = fs_extra_1.default.createWriteStream(tempFilePath);
            result.body.pipe(tempFile);
            result.body.on('error', rej);
            tempFile.on('finish', () => __awaiter(this, void 0, void 0, function* () {
                const stat = yield fs_extra_1.default.stat(tempFilePath);
                const read_stream = fs_extra_1.default.createReadStream(tempFilePath, {
                    flags: 'r',
                    mode: 0x666,
                    highWaterMark: song_source_1.BUFFER_SIZE_STREAMING
                });
                const media_size = (stat.size - song_source_1.HEADER_CHUNK_SIZE) / 2;
                read_stream.on('end', () => __awaiter(this, void 0, void 0, function* () {
                    yield fs_extra_1.default.unlink(tempFilePath);
                    logger.info('Deleted temp file.');
                }));
                res({
                    buffer_size: song_source_1.BUFFER_SIZE_STREAMING,
                    read_stream,
                    media_size
                });
            }));
            tempFile.on('error', rej);
        });
    });
    const isRemote = (songSource) => {
        const { hostname, path } = url_1.default.parse(songSource);
        return Promise.resolve((hostname && path.match(/\.(mp3)$/) ? true : false));
    };
    return {
        create,
        check: isRemote
    };
};
exports.default = localSource;
