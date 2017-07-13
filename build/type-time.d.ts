export declare class TypeTime {
    private _map;
    private _times;
    private _formatter;
    private _zeroTime;
    constructor(formatter?: (name: string, ...args: any[]) => string);
    readonly times: {
        delay: number;
        name: string;
        startTime: Date;
        endTime: Date;
        difference: number;
    }[];
    readonly totalTime: number;
    time(name: string): void;
    timeEnd(name: string): void;
    timeSync<FN extends Function>(fn: FN, name: string): FN;
    timePromise<T, FN extends (...args: any[]) => Promise<T | undefined | null>>(fn: FN, name: string): FN;
    timeCallback(fn: (...args: any[]) => any, name: string): (...args: any[]) => any;
    reset(): void;
}
