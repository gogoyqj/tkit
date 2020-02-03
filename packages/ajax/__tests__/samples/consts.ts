/**
 * @author: yangqianjun
 * @file: description
 * @Date: 2019-12-05 16:21:59
 * @LastEditors: yangqianjun
 * @LastEditTime: 2019-12-10 12:40:13
 */
import { NonStandardAjaxPromise as AjaxPromise } from 'src/new-ajax';

export type GetRes<I> = I extends Promise<infer R> ? R : never;

export type INull = GetRes<AjaxPromise<null>>;

export const Empty = {};
export type IEmpty = GetRes<AjaxPromise<typeof Empty>>;
export type IEmptyArray = GetRes<AjaxPromise<[]>>;

export const CodeOnly = {
  code: 0
};
export type ICodeOnly = GetRes<AjaxPromise<typeof CodeOnly>>;

export const CodeAndMessage = {
  ...CodeOnly,
  message: ''
};
export type ICodeAndMessage = GetRes<AjaxPromise<typeof CodeAndMessage>>;

export const FullWithNumber = {
  ...CodeAndMessage,
  result: 0
};
export type IFullWithNumber = GetRes<AjaxPromise<typeof FullWithNumber>>;

export const FullWithString = {
  ...CodeAndMessage,
  result: ''
};
export type IFullWithString = GetRes<AjaxPromise<typeof FullWithString>>;

export const FullWithObject = {
  ...CodeAndMessage,
  result: {
    0: '1'
  }
};
export type IFullWithObject = GetRes<AjaxPromise<typeof FullWithObject>>;

export const FullWithArray = {
  ...CodeAndMessage,
  result: ['1']
};

export type IFullWithArray = GetRes<AjaxPromise<typeof FullWithArray>>;

export type IArrayMap = GetRes<AjaxPromise<{ [key: string]: { id: number; name: string }[] }>>;
export type INonStandardResult = GetRes<
  AjaxPromise<{
    code?: number;
    message?: string;
    ok?: boolean;
    result?: number[];
    success?: boolean;
  }>
>;
