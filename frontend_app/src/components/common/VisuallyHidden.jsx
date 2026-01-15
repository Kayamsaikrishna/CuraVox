import React from 'react';

const VisuallyHidden = ({ children, asChild = false }) => {
  const style = {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: '0',
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    borderWidth: '0',
  };

  if (asChild) {
    const child = React.Children.only(children);
    return React.cloneElement(child, { style: { ...child.props.style, ...style } });
  }

  return (
    <span style={style} className="sr-only">
      {children}
    </span>
  );
};

export default VisuallyHidden;