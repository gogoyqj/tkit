import { doAsync, doAsyncConfirmed } from '@src/index';
import { loadData, loadDataWithMoreParams } from './consts';

export function tester() {
  doAsync({
    fetch: loadData,
    params: 1
  });
  doAsync({
    fetch: loadData,
    paramsGenerator: () => [1]
  });
  doAsync({
    fetch: loadDataWithMoreParams,
    paramsGenerator: () => [1, '2']
  });

  doAsyncConfirmed({
    fetch: loadData,
    params: 1
  });
  doAsyncConfirmed({
    fetch: loadData,
    paramsGenerator: () => [1]
  });
  doAsyncConfirmed({
    fetch: loadDataWithMoreParams,
    paramsGenerator: () => [1, '2']
  });
}
