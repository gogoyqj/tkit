/**
 * @author: yangqianjun
 * @file: ajax统一封装
 * @Date: 2019-11-21 15:26:02
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-01-08 18:39:44
 */

import ajax from './new-ajax';

export * from './axios';
export * from './new-ajax';
export * from './graphql';
export default ajax;
export {
  AjaxCancelCode,
  AjaxErrorCode,
  GraphQLErrorCode,
  TkitAbstractAjaxResult,
  TkitAjaxResult,
  TkitAjaxFunction,
  AjaxCancelMessage
} from './consts';
