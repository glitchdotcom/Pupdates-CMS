import React from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

import { withStyles } from '@material-ui/core/styles';

const styles = (theme) => ({
  wrapper: {
    position: "relative",
  },
  indicatorTable: {
    position: "absolute",
    display: "table",
  },
  indicatorRow: {
    display: "table-row",
    height: "100%",
  },
  indicatorCell: {
    display: "table-cell",
    verticalAlign: "middle",
    textAlign: "center",
  },
});

function PureCircularIndicator(props) {
  const {classes, value, size, thickness} = props;
  
  return (
    <div className={classes.wrapper}>
      <div className={classes.indicatorTable} style={{height: size, width: size}}>
        <div className={classes.indicatorRow}>
          <div className={classes.indicatorCell}>
            <Typography style={{"font-size": Math.round(size/5)}}>{`${value}%`}</Typography>
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

export default withStyles(styles)(PureCircularIndicator);
