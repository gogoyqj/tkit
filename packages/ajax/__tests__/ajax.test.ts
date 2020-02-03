import http from 'http';
import * as qs from 'qs'; // stringify
import originAxios from 'axios';

import axios from 'src/axios';
import ajaxV2 from 'src/new-ajax';
import { EventCenter } from 'tkit-event/lib/event';

const Error401 = { status: 401, message: 'Unauthorized' };
const TestData = { code: 0, data: { id: 2 } };
const TestData401 = { code: 401, message: Error401.message };
// @cc: f**k: 请确保 api 与 package.json .jest.testURL 一致
const api = 'http://localhost:4444/';
const params = { a: 200, b: 1 };
const params401 = { a: 401, b: 1 };

describe('utils/WrappedFetch work ok', () => {
  const statusError = jest.fn();
  const spyRequest = jest.fn();
  const server = http
    .createServer((req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      if (`${req.url}`.indexOf('200') !== -1) {
        res.statusCode = 200;
        res.end(JSON.stringify(TestData));
      } else {
        res.statusCode = Error401.status;
        res.end(Error401.message);
      }
    })
    .listen(4444);
  const cancelToken = new originAxios.CancelToken(() => {});

  beforeAll(() => {
    EventCenter.on('common.user.status', statusError);
  });

  afterAll(() => {
    EventCenter.off('common.user.status', statusError);
    server.close();
  });

  beforeEach(() => {
    statusError.mockReset();
    spyRequest.mockReset();
  });

  // v2
  it('get ok', async () => {
    const request = axios.request;

    axios.request = async (...args: any[]) => {
      spyRequest(...args);
      return request.apply(axios, args);
    };

    let res = await ajaxV2.ajax({
      method: 'GET',
      url: api,
      query: params401
    });
    expect(res).toMatchObject(TestData401);
    expect(spyRequest).toBeCalledWith({
      method: 'GET'.toLocaleLowerCase(),
      url: api,
      params: params401,
      headers: {},
      cancelToken
    });

    res = await ajaxV2.ajax({
      method: 'GET',
      url: api,
      query: params
    });
    expect(res).toMatchObject(TestData);
    expect(spyRequest).toBeCalledWith({
      method: 'GET'.toLocaleLowerCase(),
      url: api,
      params,
      headers: {},
      cancelToken
    });
  });

  it('postJSON ok', async () => {
    let res = await ajaxV2.ajax({
      method: 'POST',
      url: api,
      query: params401,
      data: params
    });
    expect(res).toMatchObject(TestData401);
    expect(spyRequest).toBeCalledWith({
      method: 'POST'.toLocaleLowerCase(),
      url: api,
      params: params401,
      data: params,
      headers: {
        'Content-Type': 'application/json'
      },
      cancelToken
    });

    res = await ajaxV2.ajax({
      method: 'POST',
      url: api,
      query: params,
      data: params
    });
    expect(res).toMatchObject(TestData);
    expect(spyRequest).toBeCalledWith({
      method: 'POST'.toLocaleLowerCase(),
      url: api,
      params,
      data: params,
      headers: {
        'Content-Type': 'application/json'
      },
      cancelToken
    });
  });

  it('post ok', async () => {
    let res = await ajaxV2.ajax({
      method: 'POST',
      url: api,
      query: params401,
      form: params
    });
    expect(res).toMatchObject(TestData401);
    expect(spyRequest).toBeCalledWith({
      method: 'POST'.toLocaleLowerCase(),
      url: api,
      params: params401,
      data: qs.stringify(params),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      cancelToken
    });

    res = await ajaxV2.ajax({
      method: 'POST',
      url: api,
      query: params,
      form: params
    });
    expect(res).toMatchObject(TestData);
    expect(spyRequest).toBeCalledWith({
      method: 'POST'.toLocaleLowerCase(),
      url: api,
      params,
      data: qs.stringify(params),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      cancelToken
    });
  });
});
