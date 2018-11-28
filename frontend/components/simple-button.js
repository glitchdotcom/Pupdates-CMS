import React from 'react';

import './simple-button.less';

export default function PureSimpleButton(props) {
  return (
    <button {...props} className="simple-button-main">{props.children}</button>
  );
}
