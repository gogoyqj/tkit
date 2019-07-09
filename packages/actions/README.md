---
name: actions
menu: 'redux'
---

# `npm i tkit-actions`

## Usage

```typescript
import { createAction, Action, handleActions, bindActionCreators, Dispatch } from 'tkit-actions';

const actions = {
  doSomething: () => createAction('DO', {})
};

const reducer = handleActions({
  DO: <S>(s: S, action: Action<{}>) => ({ ...s })
});

// bindActionCreators 通过 reselect 添加了 cache
function mapDispatchToProps(dispatch: Dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  };
}
```
