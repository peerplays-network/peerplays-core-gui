import * as React from 'react';
import {shallow} from 'enzyme';
import Clock from '../../components/Clock/Clock';

describe('<Home/>', () => {
  test('should render correctly', () => {
    const component = shallow(<Clock />);
  
    expect(component).toMatchSnapshot();
  });
});