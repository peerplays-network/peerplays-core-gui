import * as React from 'react';
import {shallow} from 'enzyme';
import Modal from './src/components/Modal/CantConnectModal/CantConnectModal';

describe('<Home/>', () => {
  test('should render correctly', () => {
    const component = shallow(<Modal />);

    expect(component).toMatchSnapshot();
  });
});