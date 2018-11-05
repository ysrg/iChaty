import React, { Component } from 'react';
import { get, last, differenceBy, uniqBy } from 'lodash';
import { Nav, NavItem, Navbar, NavbarToggler, NavbarBrand, Collapse } from 'reactstrap';
import { FaSearch as FASearch } from 'react-icons/fa';
import { MdEject } from 'react-icons/md';
import SideBarOption from './SideBarOption';
import { createChatNameFromUsers } from '../../factories';

export default class SideBar extends Component {
  static type = {
    CHATS: 'chats',
    USERS: 'users'
  };
  constructor(props) {
    super(props);
    this.toggleNavbar = this.toggleNavbar.bind(this);

    this.state = {
      collapsed: this.props.width < 767 ? true : false,
      reciever: '',
      activeSidebar: SideBar.type.CHATS
    };
  }

  toggleNavbar() {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  handleSubmit = e => {
    e.preventDefault();
    this.props.onSendPrivateMessage(this.state.reciever);
    this.setState({ reciever: '' });
  };

  addChatForUser = username => {
    this.props.onSendPrivateMessage(username);
    this.setActiveSidebar(SideBar.type.CHATS);
  };

  setActiveSidebar = newSideBar => {
    this.setState({ activeSidebar: newSideBar });
  };

  render() {
    const {
      user,
      users,
      setActiveChat,
      logout,
      chats,
      activeChat,
      width
    } = this.props;
    const { reciever, activeSidebar } = this.state;
    const filteredChats = uniqBy(chats, 'id')
    return (
      <div id="side-bar">
        <Navbar color="faded" light>
          <NavbarBrand className="mr-auto">iChaty</NavbarBrand>
          <div className="current-chat-nav">{this.props.activeChat ? this.props.activeChat.name : null}</div>
          <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
          {/* <h4>{this.props.name}</h4> */}
          <Collapse isOpen={!this.state.collapsed} navbar>
          <Nav navbar vertical>
            {/* <div className="heading">
          <div className="app-name">
            <h1>iChat</h1>
          </div>
          <div className="menu">
            <FAMenu />
          </div>
        </div>*/}
            <NavItem>
              <form onSubmit={this.handleSubmit} className="search">
                <i className="search-icon">
                  <FASearch />
                </i>
                <input
                  onChange={e => this.setState({ reciever: e.target.value })}
                  value={reciever}
                  placeholder="Search"
                  type="text"
                />
              </form>
            </NavItem>
            <NavItem>
              <div className="side-bar-select">
                <div
                  onClick={() => this.setActiveSidebar(SideBar.type.CHATS)}
                  className={`side-bar-select__option ${
                    activeSidebar === SideBar.type.CHATS ? 'active' : ''
                  }`}
                >
                  <span>Chats</span>
                </div>
                <div
                  onClick={() => this.setActiveSidebar(SideBar.type.USERS)}
                  className={`side-bar-select__option ${
                    activeSidebar === SideBar.type.USERS ? 'active' : ''
                  }`}
                >
                  <span>Users</span>
                </div>
              </div>
            </NavItem>
            <NavItem className="userList">
              <div
                className="users"
                ref="users"
                onClick={e => {
                  e.target === this.refs.user && setActiveChat(null);
                }}
              >
                {activeSidebar === SideBar.type.CHATS
                  ? filteredChats.map((chat,i,arr) => {
                      return (
                        <SideBarOption
                          key={chat.id}
                          lastMessage={get(last(chat.messages), 'message', '')}
                          name={
                            chat.isGlobal
                              ? chat.name
                              : createChatNameFromUsers(chat.users, user.name)
                          }
                          active={activeChat.id === chat.id}
                          onClick={() => {
                            this.props.setActiveChat(chat);
                            return width < 767 ? this.setState({
                              collapsed: !this.state.collapsed
                            }) : null;
                          }}
                        />
                      );
                    })
                  : differenceBy(users, [user], 'name').map(user => {
                      return (
                        <SideBarOption
                          key={user.id}
                          name={user.name}
                          onClick={() => {
                            this.addChatForUser(user.name);
                            return width < 767 ? this.setState({
                              collapsed: !this.state.collapsed
                            }) : null;
                          }}
                        />
                      );
                    })}
              </div>
            </NavItem>
            <NavItem className="small">
              <div className="current-user">
                <span>{user.name}</span>
                <div
                  onClick={() => {
                    logout();
                  }}
                  title="Logout"
                  className="logout"
                >
                  <MdEject />
                </div>
              </div>
            </NavItem>
          </Nav>
          </Collapse>
        </Navbar>
        <div className="current-user big">
          <span>{user.name}</span>
          <div
            onClick={() => {
              logout();
            }}
            title="Logout"
            className="logout"
          >
            <MdEject />
          </div>
        </div>
      </div>
    );
  }
}
