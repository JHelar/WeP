"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createQueue = () => {
    const data_array = [];
    const enqueue = (data) => data_array.unshift(data);
    const pop = () => data_array.pop();
    const last = () => data_array[data_array.length - 1];
    const first = () => data_array[0];
    const size = () => data_array.length;
    return {
        enqueue,
        pop,
        first,
        last,
        size
    };
};
exports.default = createQueue;
