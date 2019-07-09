export interface State {
  id: number;
  name: string;
}

export const modelWithoutEffectsState: State = {
  id: 2,
  name: ''
};

export interface EffectsState {
  name: string;
}

export const modelWithEffectsState: EffectsState = {
  name: ''
};

export function overload(): any;
export function overload(one: string): any;
export function overload(one: string, two: number): any;
export function overload(...args: any[]) {
  // do nothing
}
