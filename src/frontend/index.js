import React from 'react';
import ReactDOM from 'react-dom';

import Button from '@material-ui/core/Button';

let rg = [1,2,3,4];

const App = () => (
  <div>
    <Button variant="contained" color="primary">
      Hello World
    </Button>
  </div>
);

var mountNode = document.getElementById("app");
ReactDOM.render(<App/>, mountNode);
