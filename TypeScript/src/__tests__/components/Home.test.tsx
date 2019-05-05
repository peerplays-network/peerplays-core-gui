import * as React from 'react';
import {shallow} from 'enzyme';
import Home from '../../components/Home/Home';

describe('<Home/>', () => {
  test('should render correctly', () => {
    const component = shallow(<Home />);
  
    expect(component).toMatchSnapshot();
  });
});