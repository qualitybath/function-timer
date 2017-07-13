"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const buildIdentifier = (name, ...args) => {
    return `${name}(${args.join(', ')})`;
};
class TypeTime {
    constructor(formatter = buildIdentifier) {
        this._map = new Map();
        this._times = [];
        this._zeroTime = new Date();
        this._formatter = formatter;
    }
    get times() {
        if (!this._times.length) {
            return [];
        }
        const sorted = [...this._times].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        return sorted.map(t => (Object.assign({}, t, { delay: t.startTime.getTime() - this._zeroTime.getTime() })));
    }
    get totalTime() {
        if (!this._times.length) {
            return 0;
        }
        const latestEndTime = [...this._times].sort((a, b) => b.endTime.getTime() - a.endTime.getTime())[0].endTime;
        return latestEndTime.getTime() - this._zeroTime.getTime();
    }
    time(name) {
        const startTime = new Date();
        this._map.set(name, startTime);
    }
    timeEnd(name) {
        const endTime = new Date();
        const startTime = this._map.get(name);
        if (!startTime) {
            return;
        }
        this._times.push({
            name,
            startTime,
            endTime,
            difference: endTime.getTime() - startTime.getTime()
        });
    }
    timeSync(fn, name) {
        return ((...args) => {
            const identifier = this._formatter(name, ...args);
            this.time(identifier);
            const result = fn(...args);
            this.timeEnd(identifier);
            return result;
        });
    }
    timePromise(fn, name) {
        return ((...args) => __awaiter(this, void 0, void 0, function* () {
            const identifier = this._formatter(name, ...args);
            this.time(identifier);
            const result = yield fn(...args);
            this.timeEnd(identifier);
            return result;
        }));
    }
    timeCallback(fn, name) {
        return (...args) => {
            const rest = [...args];
            const callback = rest.pop();
            const identifier = this._formatter(name, ...rest);
            this.time(identifier);
            fn(...rest, (...argsCb) => {
                this.timeEnd(identifier);
                callback(...argsCb);
            });
        };
    }
    reset() {
        this._map.clear();
        this._times = [];
    }
}
exports.TypeTime = TypeTime;
