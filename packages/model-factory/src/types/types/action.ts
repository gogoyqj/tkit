/**
 * Tkit Action
 * @property payload 参数
 */
export interface Tction<P> {
  payload: P;
}

/**  Tkit Basic Action */
export type AbstractAction = Tction<any>;
