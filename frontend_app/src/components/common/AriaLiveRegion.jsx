import React, { useState, useEffect } from 'react';

const AriaLiveRegion = ({ children, polite = true }) => {
  const [messages, setMessages] = useState([]);

  const announce = (message) => {
    setMessages(prev => [...prev, { id: Date.now(), message }]);
  };

  // Clear messages after they've been announced
  useEffect(() => {
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        setMessages(prev => prev.slice(1));
      }, 1000); // Allow time for screen readers to announce

      return () => clearTimeout(timer);
    }
  }, [messages]);

  return (
    <div>
      {children({ announce })}
      <div
        aria-live={polite ? 'polite' : 'assertive'}
        aria-atomic="true"
        className="sr-only"
      >
        {messages.map(msg => (
          <div key={msg.id}>{msg.message}</div>
        ))}
      </div>
    </div>
  );
};

export default AriaLiveRegion;