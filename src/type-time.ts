export type TimeSpent = {
  name: string;
  startTime: Date;
  endTime: Date;
  difference: number;
}

type IdentifierFormatter = (name: string, ...args: any[]) => string;

const buildIdentifier: IdentifierFormatter = (name: string, ...args: any[]): string => {
  return `${name}(${args.join(', ')})`;
}

export class TypeTime {
  private _map = new Map<string, TimeSpent>();
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

  time(name: string): void {
    const startTime = new Date();
    this._map.set(name, {
      startTime,
      name,
      difference: 0, //default value
      endTime: TypeTime.DEFAULT_DATE //default value
    });
  }

  timeEnd(name: string) : TimeSpent | undefined {
    const endTime = new Date();
    const timeSpent = this._map.get(name);
    if (!timeSpent) {
      return;
    }

    const result: TimeSpent = {
      name: timeSpent.name!,
      startTime: timeSpent.startTime!,
      endTime,
      difference: endTime.getTime() - timeSpent.startTime!.getTime()
    }
    this._map.set(name, result);
    return result;
  }

  timeSync<FN extends Function>(fn: FN, name: string): FN {
    return ((...args: any[]) => {
      const identifier = this._formatter(name, ...args);
      this.time(identifier);
      const result = fn(...args);
      this.timeEnd(identifier);
      return result;
    }) as any as FN;
  }

  timePromise<T, FN extends (...args: any[]) => Promise<T | undefined | null>>(fn: FN, name: string): FN {
    return (async (...args: any[]) => {
      const identifier = this._formatter(name, ...args);
      this.time(identifier);
      const result = await fn(...args);
      this.timeEnd(identifier);
      return result;
    }) as any as FN;
  }

  timeCallback(fn: (...args: any[]) => any, name: string): (...args: any[]) => any {
    return (...args: any[]) => {
      const rest = [...args];
      const callback: any = rest.pop();
      const identifier = this._formatter(name, ...rest);
      this.time(identifier);
      fn(...rest, (...argsCb: any[]) => {
        this.timeEnd(identifier);
        callback(...argsCb);
      });
    }
  }

  reset() {
    this._map.clear();
    this._zeroTime = new Date();
  }
}
