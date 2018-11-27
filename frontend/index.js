import React from 'react';
import ReactDOM from 'react-dom';

import CircularIndicator from './components/circular-indicator';

const test = (
  <div>
    <CircularIndicator value={40} size={200} thickness={10}/>
  </div>
);

ReactDOM.render(test, document.querySelector('#app'));
