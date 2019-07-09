---
name: event
menu: 'components'
---

# `npm i tkit-event`

> 观察者模式封装

## Usage

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
