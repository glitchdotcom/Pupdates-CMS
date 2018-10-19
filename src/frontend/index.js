import React from 'react';
import ReactDOM from 'react-dom';

import Button from '@material-ui/core/Button';

let rg = [1,2,3,4];

const App = () => (
  <Button variant="contained" color="primary">
    Hello World
  </Button>
);
// nice, ha?
// what is missing keys?
// see web console: 
/*Warning: Each child in an array or iterator should have a unique "key" prop.

Check the render method of `App`. See https://fb.me/react-warning-keys for more information.
    in span (created by App)
    in App */
// ohhh gotcha! Perhaps SSR might do it?
// ah yeah, maybe
// i wonder about accessibility...
// I think I can shave 2 seconds by removing the development NODE_ENV.
var mountNode = document.getElementById("app");
ReactDOM.render(<App/>, mountNode);
