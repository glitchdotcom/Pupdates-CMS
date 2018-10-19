import React from 'react';
import ReactDOM from 'react-dom';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  indicatorTable: {
    display: "table",
    height: "100%",
  },
  indicatorRow: {
    display: "table-row",
    height: "100%",
  },
  indicatorCell: {
    display: "table-cell",
    verticalAlign: "middle",
  },
});

function PureCircularIndicator(props) {
  const {classes, value, size, thickness} = props;
  
  return (
    <div className={classes.wrapper}>
      <div className={classes.indicatorTable}>
        <div className={classes.indicatorRow}>
          <div className={classes.indicatorCell}>
            {value}
          </div>
        </div>
      </div>
      <CircularProgress
        variant="static"
        value={value}
        size={size}
        thickness={thickness}
      />
    </div>
  );
}

const StyledCircularIndicator = withStyles(styles)(PureCircularIndicator);

ReactDOM.render(<StyledCircularIndicator value={40} size={200} thickness={10}/>, document.querySelector('#app'));
