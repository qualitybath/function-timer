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
const uuid = require("uuid");
const buildIdentifier = (name, ...args) => {
    return `${name}(${args.join(', ')})`;
};
class TypeTime {
    constructor({ formatter = buildIdentifier, enabled = true } = {}) {
        this._map = new Map();
        this._zeroTime = new Date();
        this._formatter = formatter;
        this._enabled = enabled;
    }
    get times() {
        if (!this._map.size) {
            return [];
        }
        const values = [...this._map.values()];
        return values.map(t => (Object.assign({}, t, { delay: t.startTime.getTime() - this._zeroTime.getTime() })));
    }
    get totalTime() {
        if (!this._map.size) {
            return 0;
        }
        const values = [...this._map.values()];
        const latestEndTime = values.sort((a, b) => b.endTime.getTime() - a.endTime.getTime())[0].endTime;
        return latestEndTime.getTime() - this._zeroTime.getTime();
    }
    time(name) {
        const startTime = new Date();
        const token = {
            token: uuid.v4(),
            identifier: name
        };
        if (!this._enabled) {
            return token;
        }
        this._map.set(token, {
            startTime,
            name,
            difference: 0,
            endTime: TypeTime.DEFAULT_DATE //default value
        });
        return token;
    }
    timeEnd(token) {
        if (!this._enabled) {
            return;
        }
        const endTime = new Date();
        const timeSpent = this._map.get(token);
        if (!timeSpent) {
            return;
        }
        const result = {
            name: timeSpent.name,
            startTime: timeSpent.startTime,
            endTime,
            difference: endTime.getTime() - timeSpent.startTime.getTime()
        };
        this._map.set(token, result);
        return result;
    }
    timeSync(fn, name) {
        return ((...args) => {
            const identifier = this._formatter(name, ...args);
            const token = this.time(identifier);
            const result = fn(...args);
            this.timeEnd(token);
            return result;
        });
    }
    timePromise(fn, name) {
        return ((...args) => __awaiter(this, void 0, void 0, function* () {
            const identifier = this._formatter(name, ...args);
            const token = this.time(identifier);
            const result = yield fn(...args);
            this.timeEnd(token);
            return result;
        }));
    }
    timeCallback(fn, name) {
        return (...args) => {
            const rest = [...args];
            const callback = rest.pop();
            const identifier = this._formatter(name, ...rest);
            const token = this.time(identifier);
            fn(...rest, (...argsCb) => {
                this.timeEnd(token);
                callback(...argsCb);
            });
        };
    }
    enable() {
        this._enabled = true;
    }
    disable() {
        this._enabled = false;
    }
    reset() {
        this._map.clear();
        this._zeroTime = new Date();
    }
}
TypeTime.DEFAULT_DATE = new Date(0, 0, 0);
exports.TypeTime = TypeTime;
