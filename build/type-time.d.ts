export declare type TimeSpent = {
    name: string;
    startTime: Date;
    endTime: Date;
    difference: number;
};
export declare type TimeToken = {
    token: string;
    identifier: string;
};
export declare class TypeTime {
    private _map;
    private _formatter;
    private _zeroTime;
    static DEFAULT_DATE: Date;
    constructor(formatter?: (name: string, ...args: any[]) => string);
    readonly times: {
        delay: number;
        name: string;
        startTime: Date;
        endTime: Date;
        difference: number;
    }[];
    readonly totalTime: number;
    time(name: string): TimeToken;
    timeEnd(token: TimeToken): TimeSpent | undefined;
    timeSync<FN extends Function>(fn: FN, name: string): FN;
    timePromise<T, FN extends (...args: any[]) => Promise<T | undefined | null>>(fn: FN, name: string): FN;
    timeCallback(fn: (...args: any[]) => any, name: string): (...args: any[]) => any;
    reset(): void;
}
