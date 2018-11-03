import React, { Component } from 'react';

class MessageInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      isTyping: false
    };
  }
  componentWillUnmount() {
    this.stopCheckingTyping();
  }

  handleSubmit = e => {
    e.preventDefault();
    this.sendMessage();
    this.setState({ message: '' });
  };

  sendMessage = () => {
    this.props.sendMessage(this.state.message);
  };

  sendTyping = () => {
    this.lastUpdateTime = Date.now();
    if (!this.state.isTyping) {
      this.setState({ isTyping: true });
      this.props.sendTyping(true);
      this.startCheckingTyping();
    }
  };

  startCheckingTyping = () => {
    this.typingInterval = setInterval(() => {
      if (Date.now() - this.lastUpdateTime > 300) {
        this.setState({ isTyping: false });
        this.stopCheckingTyping();
      }
    }, 300);
  };

  stopCheckingTyping = () => {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.props.sendTyping(false);
    }
  };

  render() {
    const { message } = this.state;
    return (
      <div className="message-input">
        <form onSubmit={this.handleSubmit} className="message-form">
          <input
            type="text"
            id="message"
            ref="messageInput"
            className="form-control"
            value={message}
            placeholder="Message"
            onKeyUp={e => e.keyCode !== 13 && this.sendTyping()}
            onChange={({ target: { value: v } }) => {
              this.setState({ message: v });
            }}
          />
          <button disabled={message.length < 1} type="submit" className="send">
            Send
          </button>
        </form>
      </div>
    );
  }
}

export default MessageInput;
