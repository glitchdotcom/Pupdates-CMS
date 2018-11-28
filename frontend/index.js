import React from 'react';
import ReactDOM from 'react-dom';

import CircularIndicator from './components/circular-indicator';
import SimpleButton from './components/simple-button';

const test = (
  <div>
    <CircularIndicator value={40} size={200} thickness={10}/>
    <SimpleButton onClick={() => {alert("Hello!");}}>Click me!</SimpleButton>
  </div>
);

ReactDOM.render(test, document.querySelector('#app'));
