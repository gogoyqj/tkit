---
name: event
menu: 'components'
---

# `npm i tkit-event`

> 观察者模式封装

所有事件共享一个观察者模式，所以请确保事件名命名唯一性，建议使用:

```shell
e:moduleName.eventName
```

例如:

```shell
e:User.login
e:User.logout
```

## Usage

### useEvent

推荐使用 hooks，实现了 emit & callback 类型的打通，以及事件的自动解除绑定

```ts
import { useEvent } from 'tkit-event';

...
const [emit, off] = useEvent('e:eventName', callback);
...
```

### EventWrapper

对于 Component 组件使用装饰器

```ts
import React from 'react';
import EventWrapperDecorator, { EventCenter, IEventWrapperProps } from 'tkit-event';

@EventWrapperDecorator()
class A extends React.Component<{} & IEventWrapperProps> {
  public constructor(props) {
    super(props);
    props.on('LOAD', () => console.log('load'));
  }

  public componentDidMount() {
    this.props.emit('LOAD');
    // or 全局广播
    EventCenter.emit('LOAD');
  }

  public render() {
    return null;
  }
}
```
