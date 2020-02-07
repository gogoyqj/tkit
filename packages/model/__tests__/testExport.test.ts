/**
 * @file: export members
 * @author: yangqianjun
 * @Date: 2020-02-06 20:50:31
 * @LastEditors: yangqianjun
 * @LastEditTime: 2020-02-06 20:54:35
 */

import createModel, { Tction, M, MM, CM, ASYNC_EFFECT_EVENT_NAME } from 'src/index';

describe('should compatible with lower version', () => {
  it('export members should be defined', () => {
    // 此处不应报错
    const action: Tction<number> = { payload: 1 };

    expect(typeof createModel).toBe('function');
    expect(typeof CM).toBe('function');
    expect(typeof M).toBe('function');
    expect(typeof MM).toBe('function');
    expect(typeof ASYNC_EFFECT_EVENT_NAME).toBe('string');
  });
});
