import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import { useEvent } from 'src/useEvent';

describe('event/useEvent', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container = null as any;
  });

  describe('event/useEvent', () => {
    it('emit/off works ok', async () => {
      const callback = jest.fn((id: number, name: string) => void 0);

      const Presenter = () => {
        const [emit, off] = useEvent('e:Test', callback);
        return (
          <>
            <button className="emit" onClick={() => emit(2, 'skipper')}></button>
            <button className="off" onClick={off}></button>
          </>
        );
      };
      act(() => {
        ReactDOM.render(<Presenter />, container);
      });

      const emitButton = container.querySelector('.emit') as HTMLButtonElement;
      const offButton = container.querySelector('.off') as HTMLButtonElement;

      act(() => {
        emitButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(callback).toBeCalledWith(2, 'skipper');
      callback.mockClear();

      act(() => {
        offButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        emitButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      expect(callback).toBeCalledTimes(0);
    });
  });
});
