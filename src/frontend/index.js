import React from 'react';
import ReactDOM from 'react-dom';

import Button from '@material-ui/core/Button';

let rg = [1,2,3,4];

const App = () => (
  <div>
    <Button variant="contained" color="primary">
      Hello World
    </Button>
    <div onClick={()=>{}}>
      This div should trigger an accessibility linting error, because you don't click on divs. On the client?
    </div>
                                              
                                              
  </div>
);

var mountNode = document.getElementById("app");
ReactDOM.render(<App/>, mountNode);
