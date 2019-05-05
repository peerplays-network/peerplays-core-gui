import React, {Component} from 'react';

export default class Clock extends Component<{}, {time: Date}> {
  tick() {
    this.setState({
      time: new Date()
    });
  }

  componentWillMount() {
    this.tick();
  }

  componentDidMount() {
    setInterval(() => this.tick(), 1000);
  }

  render() {
    return (
      <p className='clock__time--now'>{this.state.time.toLocaleTimeString()}</p>
    );
  }
}