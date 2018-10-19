import React from 'react';
import ReactDOM from 'react-dom';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  indicator: {
    position: "absolute",
    display: "table-cell",
    verticalAlign: "middle",
    minHeight: "2em",
  },
});

function App() {
  return (
    <div>
      <div>
      </div>
      <CircularProgress
        variant="static"
        value={40}
        size={200}
        thickness={10}
      />
    </div>
  );
}

ReactDOM.render(<App />, document.querySelector('#app'));
