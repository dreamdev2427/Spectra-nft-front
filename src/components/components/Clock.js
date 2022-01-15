import React, { Component } from "react";

class Clock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      cntFromMountTime : 0,
      intervalID: 0,
      deadline: props.deadline,
      isEnded : false
    };
  }
  
  async componentDidMount() {
    this.getTimeUntil(this.state.deadline);
    const intervalID = setInterval(() => this.getTimeUntil(), 1000);
    this.setState({intervalID: intervalID});
  }

  async componentWillReceiveProps(nextProps) {
     this.setState({ deadline: nextProps.deadline});
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalID);
  }

  leading0(num) {
    return num < 10 ? "0" + num : num;
  }

  getTimeUntil = () => {
    const time = this.state.deadline - this.state.cntFromMountTime;
    if (time <= 0) 
    {
      this.setState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      this.props.checkAuctionStatus(true);
      this.setState({isEnded: true});
    } else {
      const seconds = Math.floor((time / 1000) % 60);
      const minutes = Math.floor((time / 1000 / 60) % 60);
      const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
      const days = Math.floor(time / (1000 * 60 * 60 * 24));
      this.setState({ days, hours, minutes, seconds });
      var cnt = this.state.cntFromMountTime;
      this.setState({ cntFromMountTime : cnt + 1000 });
      this.props.checkAuctionStatus(false);      
      this.setState({isEnded: false});
    }
  }

  render() {
    const { isEnded } = this.state;
    return (
      <div style={{textAlign: 'center'}}>
        { isEnded && (
          <span style={{marginRight: '1 em', color: "red"}} >Auction Ended</span>
        )}
        { !isEnded && (
          <>
          <div className="Clock-days">{this.leading0(this.state.days)}d</div>
          <div className="Clock-hours">
            {this.leading0(this.state.hours)}h
          </div>
          <div className="Clock-minutes">
            {this.leading0(this.state.minutes)}m
          </div>
          <div className="Clock-seconds">
            {this.leading0(this.state.seconds)}s
          </div>
          </>
        )
        }
      </div>
    );
  }
}
export default Clock;
