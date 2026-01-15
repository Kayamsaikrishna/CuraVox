import React, { useState, useEffect } from 'react';

const FocusVisible = ({ children }) => {
  const [usingKeyboard, setUsingKeyboard] = useState(false);

  useEffect(() => {
    const handleMouseDown = () => setUsingKeyboard(false);
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') setUsingKeyboard(true);
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const child = React.Children.only(children);

  return React.cloneElement(child, {
    className: `${child.props.className || ''} ${usingKeyboard ? 'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2' : ''}`,
  });
};

export default FocusVisible;