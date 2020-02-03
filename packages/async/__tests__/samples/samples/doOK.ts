import { doAsync, doAsyncConfirmed } from 'src/index';
import { loadData, loadDataWithMoreParams } from './consts';

export async function tester() {
  // @IMP: 新版返回promise
  const { result } = await doAsync({
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
  // @IMP: 新版返回promise
  const { code } = await doAsyncConfirmed({
    fetch: loadDataWithMoreParams,
    paramsGenerator: () => [1, '2']
  });
}
