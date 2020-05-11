import React, { Component } from "react";

class Clock extends Component {
  state = { time: {}, seconds: 30 };

  secondsToTime = (secs) => {
    let hours = Math.floor(secs / (60 * 60));

    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);

    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);

    let obj = {
      h: hours,
      m: minutes,
      s: seconds,
    };
    return obj;
  };

  componentDidMount() {
    let timeLeftVar = this.secondsToTime(this.state.seconds);
    this.setState({ time: timeLeftVar });
    this.timer = setInterval(this.countDown, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  countDown = () => {
    // Remove one second, set state so a re-render happens.
    let seconds = this.state.seconds - 1;
    this.setState({
      time: this.secondsToTime(seconds),
      seconds: seconds,
    });

    // Check if we're at zero.
    if (seconds === 0) {
      clearInterval(this.timer);
    }
  };

  render() {
    return (
      <p>
        00:
        {this.state.time.s < 10 ? `0${this.state.time.s}` : this.state.time.s}
        {this.state.time.s === 0 ? (
          <p>There is likely a different issue. Please try again later.</p>
        ) : null}
      </p>
    );
  }
}

export default Clock;
