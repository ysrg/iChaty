import React, { Component } from 'react';

class Messages extends Component {
  constructor(props) {
    super(props);
    this.scrollDown = this.scrollDown.bind(this);
  }
  componentDidMount() {
    this.scrollDown();
  }
  componentDidUpdate(prevProps, prevState) {
    this.scrollDown();
  }

  scrollDown() {
    const { container } = this.refs;
    container.scrollTop = container.scrollHeight;
  }

  render() {
    const { messages, user, typingUsers } = this.props;
    return (
      <div ref="container" className="thread-container">
        <div className="thread">
          {messages.map(mes => {
            return (
              <div
                key={mes.id}
                className={`message-container ${mes.sender === user.name &&
                  'right'}`}
              >
                <div className="time"><span>{mes.sender.slice(0,1).toUpperCase()}</span></div>
                <div className="data">
                  <div className="message">{mes.message}</div>
                  <div className="name">{mes.time}</div>
                </div>
              </div>
            );
          })}
          <div className="typing-user">
            {typingUsers.map(name => {
              return (
                  <span>{`${name} is typing...`}</span>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}

export default Messages;
