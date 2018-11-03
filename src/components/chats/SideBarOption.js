import React, { Component } from 'react';

class SideBarOption extends Component {
  render() {
    const { name, lastMessage, active, onClick } = this.props;
    return (
      <div className={`user ${active ? 'active' : ''}`} onClick={onClick}>
        <div className="user-photo">{name[0].toUpperCase()}</div>
        <div className="user-info">
          <div className="name">{name}</div>
          {lastMessage && <div className="last-message">{lastMessage}</div>}
        </div>
      </div>
    );
  }
}

export default SideBarOption;
