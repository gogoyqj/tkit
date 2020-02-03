import React from 'react';
import { mount } from 'enzyme';

import { EventCenter } from 'src/event';
import EventWrapper, { IEventWrapperProps } from 'src/EventWrapper';

describe('event/EventWrapper', () => {
  describe('event/EventWrapper', () => {
    it('subscribe works ok', () => {
      const mes = {};
      const callback = jest.fn(() => null);
      const TestRender = jest.fn((props: IEventWrapperProps) => {
        expect(props.on).toBeInstanceOf(Function);
        expect(props.once).toBeInstanceOf(Function);
        expect(props.emit).toBeInstanceOf(Function);
        props.on('test', callback);
        return null;
      });
      const CP = EventWrapper(TestRender);
      const tree = mount(<CP callback={callback} />);
      callback.mockClear();
      EventCenter.emit('test', mes);
      expect(callback).toBeCalledWith(mes);
      expect(callback).toBeCalledTimes(1);

      callback.mockClear();
      tree.unmount();
      EventCenter.emit('test', mes);
      expect(callback).toBeCalledTimes(0);
    });
  });
});
