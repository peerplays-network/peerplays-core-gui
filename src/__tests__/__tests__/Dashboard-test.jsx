import * as React from 'react';
import {shallow} from 'enzyme';
import Dashboard from '../../components/Clock/Clock';

describe('<Dashboard/>', () => {
  test('should render correctly', () => {
    const component = shallow(<Dashboard />);

    expect(component).toMatchSnapshot();
  });
});