import React from 'react';
import ReactDOM from 'react-dom';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

function App() {
  return (
    <div>
      <Button variant="contained" color="primary">
        Hello World
      </Button>
      <CircularProgress />
    </div>
  );
}

ReactDOM.render(<App />, document.querySelector('#app'));
