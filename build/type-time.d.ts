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
    private _enabled;
    static DEFAULT_DATE: Date;
    constructor({formatter, enabled}?: {
        formatter?: (name: string, ...args: any[]) => string;
        enabled?: boolean;
    });
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
    enable(): void;
    disable(): void;
    reset(): void;
}
