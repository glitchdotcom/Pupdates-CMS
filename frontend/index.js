import React, { useState } from 'react';
import ReactDOM from 'react-dom';

import CircularIndicator from './components/circular-indicator';
import SimpleButton from './components/simple-button';

const Main = () => {
  const [value, setValue] = useState(40);
  const inc = () => setValue(Math.min(value + 10, 100));
  const dec = () => setValue(Math.max(0, value - 10));
  return (
    <div>
      <CircularIndicator value={value} size={200} thickness={10} />
      <SimpleButton onClick={inc}>More!</SimpleButton>
      <SimpleButton onClick={dec}>Less!</SimpleButton>
    </div>
  );
};

ReactDOM.render(<Main />, document.querySelector('#app'));
