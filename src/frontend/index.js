import React from 'react';
import ReactDOM from 'react-dom';

import Button from '@material-ui/core/Button';

const App = () => (
  <Button variant="contained" color="primary">
    Hello World
  </Button>
);

var mountNode = document.getElementById("app");
ReactDOM.render(<App/>, mountNode);
