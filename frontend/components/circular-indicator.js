import React from 'react';

import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';

import './circular-indicator.less';

function PureCircularIndicator(props) {
  const {value, size, thickness} = props;
  
  const content = {
    fontSize: Math.round(size/5),
  };
  
  return (
    <div className="circular-indicator-wrapper">
      <div style={{height: size, width: size}} className="circular-indicator-table">
        <div className="circular-indicator-row">
          <div className="circular-indicator-cell">
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
