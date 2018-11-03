import React, { Component } from 'react';
import Layout from './components/Layout';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

class App extends Component {
  render() {
    return (
        <Layout title="Chat App" />
    );
  }
}

export default App;
