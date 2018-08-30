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
const fs_extra_1 = __importDefault(require("fs-extra"));
const song_source_1 = require("../song-source");
const localSource = (logger) => {
    const create = (songPath) => __awaiter(this, void 0, void 0, function* () {
        logger.info(`Creating SongSource from local path: ${songPath}`);
        const localStat = yield fs_extra_1.default.stat(songPath);
        if (!localStat.isFile())
            throw new Error(`${songPath} is not a file`);
        const media_size = (localStat.size - song_source_1.HEADER_CHUNK_SIZE) / 2;
        const read_stream = fs_extra_1.default.createReadStream(songPath, {
            flags: 'r',
            mode: 0x666,
            start: song_source_1.HEADER_CHUNK_SIZE
        });
        return {
            buffer_size: song_source_1.BUFFER_SIZE_STREAMING,
            media_size,
            read_stream
        };
    });
    const isLocal = (songSource) => {
        return fs_extra_1.default.pathExists(songSource);
    };
    return {
        create,
        check: isLocal
    };
};
exports.default = localSource;
