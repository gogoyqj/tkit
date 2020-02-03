import { doAsync, doAsyncConfirmed } from 'src/index';
import { loadData, loadDataWithMoreParams } from './consts';

export function tester() {
  doAsync({
    fetch: loadData,
    params: ''
  });
  doAsync({
    fetch: loadData,
    paramsGenerator: () => ''
  });
  doAsync({
    fetch: loadDataWithMoreParams,
    params: ''
  });
  doAsync({
    fetch: loadDataWithMoreParams,
    paramsGenerator: () => ''
  });

  doAsyncConfirmed({
    fetch: loadData,
    params: ''
  });
  doAsyncConfirmed({
    fetch: loadData,
    paramsGenerator: () => ''
  });
  doAsyncConfirmed({
    fetch: loadDataWithMoreParams,
    params: ''
  });
  doAsyncConfirmed({
    fetch: loadDataWithMoreParams,
    paramsGenerator: () => ''
  });
}
