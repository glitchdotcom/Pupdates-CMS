import React from 'react';
import ReactDOM from 'react-dom';

import CircularIndicator from './components/circular-indicator';

ReactDOM.render(<CircularIndicator value={40} size={200} thickness={10}/>, document.querySelector('#app'));
