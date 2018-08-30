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
// Constants
exports.HEADER_CHUNK_SIZE = 40;
exports.BUFF_SIZE_AUDIO_RENDERER = 16384;
exports.TRANSMIT_CHUNK_MULTIPLIER = 2;
exports.BUFFER_SIZE_STREAMING = exports.BUFF_SIZE_AUDIO_RENDERER * exports.TRANSMIT_CHUNK_MULTIPLIER;
// SourceCreators
const local_file_1 = __importDefault(require("./song-sources/local-file"));
const remote_file_1 = __importDefault(require("./song-sources/remote-file"));
exports.Sources = {
    Local: local_file_1.default,
    Remote: remote_file_1.default
};
const createSongSourceAsync = (logger, sourceCreators = []) => (songSource) => __awaiter(this, void 0, void 0, function* () {
    if (!songSource)
        throw new Error('Invalid songSource: ' + songSource);
    for (const creator of sourceCreators) {
        if (yield creator.check(songSource)) {
            return creator.create(songSource);
        }
    }
    throw new Error('Could not resolve songSource to any supported types.');
});
exports.default = createSongSourceAsync;
