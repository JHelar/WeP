interface Queue<DataType> {
    enqueue: (data: DataType) => number,
    pop: () => DataType | undefined,
    last: () => DataType | undefined,
    first: () => DataType | undefined,
    size: () => number
}

const createQueue = <DataType>(): Queue<DataType> => {
    const data_array: DataType[] = [];

    const enqueue = (data: DataType): number => data_array.unshift(data);

    const pop = (): DataType | undefined => data_array.pop();

    const last = (): DataType | undefined => data_array[data_array.length - 1];

    const first = (): DataType  | undefined => data_array[0];

    const size = (): number => data_array.length;

    return {
        enqueue,
        pop,
        first,
        last,
        size
    }
}

export default createQueue;