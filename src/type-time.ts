export type TimeSpent = Readonly<{
  name: string;
  startTime: Date;
  endTime: Date;
  difference: number;
}>

type IdentifierFormatter = (name: string, ...args: any[]) => string;

const buildIdentifier: IdentifierFormatter = (name: string, ...args: any[]): string => {
  return `${name}(${args.join(', ')})`;
}

export class TypeTime {
  private _map = new Map<string, Date>();
  private _times: Array<TimeSpent> = [];
  private _formatter: IdentifierFormatter;
  private _zeroTime: Date = new Date();

  constructor(formatter = buildIdentifier) {
    this._formatter = formatter;
  }

  get times() {
    if (!this._times.length) {
      return [];
    }
    const sorted = [...this._times].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    return sorted.map(t => ({
      ...t,
      delay: t.startTime.getTime() - this._zeroTime.getTime()
    }));
  }

  get totalTime() {
    if(!this._times.length) {
      return 0;
    }

    const latestEndTime = [...this._times].sort((a,b) => b.endTime.getTime() - a.endTime.getTime())[0].endTime;
    return latestEndTime.getTime() - this._zeroTime.getTime();
  }

  time(name: string): void {
    const startTime = new Date();
    this._map.set(name, startTime);
  }

  timeEnd(name: string) : TimeSpent | undefined {
    const endTime = new Date();
    const startTime = this._map.get(name);
    if (!startTime) {
      return;
    }
    const timeSpent = {
      name,
      startTime,
      endTime,
      difference: endTime.getTime() - startTime.getTime()
    };

    this._times.push(timeSpent);
    return timeSpent;
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
    this._times = [];
    this._zeroTime = new Date();
  }
}
