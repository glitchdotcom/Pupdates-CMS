import React from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

import './circular-indicator.css';

function PureCircularIndicator(props) {
  const {value, size, thickness} = props;
  
  const table = {
    position: "absolute",
    display: "table",
    height: size,
    width: size,
  };
  
  const row = {
    display: "table-row",
    height: "100%",
  };
  
  const cell = {
    display: "table-cell",
    verticalAlign: "middle",
    textAlign: "center",
  };
  
  const content = {
    fontSize: Math.round(size/5),
  };
  
  return (
    <div className="wrapper">
      <div style={table}>
        <div style={row}>
          <div style={cell}>
            <Typography style={content}>{`${value}%`}</Typography>
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

export default PureCircularIndicator;
