/**
 * @file: model.reducers 接口定义
 * @author: yangqianjun
 * @Date: 2020-02-06 16:39:19
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-07 19:51:49
 */

import { AbstractAction } from '../action';

/** model reducers */
export interface Reducers<M> {
  [doSomething: string]: <P extends AbstractAction>(state: Readonly<M>, action: P) => M;
}

/** immer reducer，state 不需要 readOnly */
export interface CMReducers<M> {
  // void | M 则兼容 Reducers
  [doSomethingCM: string]: <P extends AbstractAction>(state: M, action: P) => void | M;
}
