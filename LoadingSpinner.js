

import React from 'react';

const LoadingSpinner = ({ message = "Loading...", size = "normal" }) => {
  return (
    <div className="loading-spinner">
      <div className={`spinner ${size}`}></div>
      <div className="loading-message">{message}</div>
    </div>
  );
};

export default LoadingSpinner;