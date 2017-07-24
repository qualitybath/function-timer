import * as uuid from 'uuid';

export type TimeSpent = {
  name: string;
  startTime: Date;
  endTime: Date;
  difference: number;
}

export type TimeToken = {
  token: string;
  identifier: string;
}

type IdentifierFormatter = (name: string, ...args: any[]) => string;

const buildIdentifier: IdentifierFormatter = (name: string, ...args: any[]): string => {
  return `${name}(${args.join(', ')})`;
}

export class TypeTime {
  private _map = new Map<TimeToken, TimeSpent>();
  private _formatter: IdentifierFormatter;
  private _zeroTime: Date = new Date();
  
  static DEFAULT_DATE = new Date(0,0,0);

  constructor(formatter = buildIdentifier) {
    this._formatter = formatter;
  }

  get times() {
    if (!this._map.size) {
      return [];
    }
    const values = [...this._map.values()];
    return values.map(t => ({
      ...t,
      delay: t.startTime.getTime() - this._zeroTime.getTime()
    }));
  }

  get totalTime() {
    if (!this._map.size) {
      return 0;
    }

    const values = [...this._map.values()];
    const latestEndTime = values.sort((a,b) => b.endTime.getTime() - a.endTime.getTime())[0].endTime;
    return latestEndTime.getTime() - this._zeroTime.getTime();
  }

  time(name: string): TimeToken {
    const startTime = new Date();
    const token = {
      token: uuid.v4() ,
      identifier: name

    }
    this._map.set(token, {
      startTime,
      name,
      difference: 0, //default value
      endTime: TypeTime.DEFAULT_DATE //default value
    });

    return token;
  }

  timeEnd(token: TimeToken) : TimeSpent | undefined {
    const endTime = new Date();
    const timeSpent = this._map.get(token);
    if (!timeSpent) {
      return;
    }

    const result: TimeSpent = {
      name: timeSpent.name!,
      startTime: timeSpent.startTime!,
      endTime,
      difference: endTime.getTime() - timeSpent.startTime!.getTime()
    }
    this._map.set(token, result);
    return result;
  }

  timeSync<FN extends Function>(fn: FN, name: string): FN {
    return ((...args: any[]) => {
      const identifier = this._formatter(name, ...args);
      const token = this.time(identifier);
      const result = fn(...args);
      this.timeEnd(token);
      return result;
    }) as any as FN;
  }

  timePromise<T, FN extends (...args: any[]) => Promise<T | undefined | null>>(fn: FN, name: string): FN {
    return (async (...args: any[]) => {
      const identifier = this._formatter(name, ...args);
      const token = this.time(identifier);
      const result = await fn(...args);
      this.timeEnd(token);
      return result;
    }) as any as FN;
  }

  timeCallback(fn: (...args: any[]) => any, name: string): (...args: any[]) => any {
    return (...args: any[]) => {
      const rest = [...args];
      const callback: any = rest.pop();
      const identifier = this._formatter(name, ...rest);
      const token = this.time(identifier);
      fn(...rest, (...argsCb: any[]) => {
        this.timeEnd(token);
        callback(...argsCb);
      });
    }
  }

  reset() {
    this._map.clear();
    this._zeroTime = new Date();
  }
}
