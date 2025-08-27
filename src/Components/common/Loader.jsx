import React from 'react';
import './Loader.css';

const Loader = ({ 
  variant = 'pulse', 
  size = 'md', 
  text = '', 
  fullscreen = false,
  className = '' 
}) => {
  const getLoaderClass = () => {
    const baseClass = fullscreen ? 'loader-fullscreen' : 'loader-container';
    const sizeClass = size !== 'md' ? `loader-${size}` : '';
    return `${baseClass} ${sizeClass} ${className}`.trim();
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'spinner':
        return 'loader-spinner';
      case 'dots':
        return 'loader-dots';
      case 'wave':
        return 'loader-wave';
      case 'ring':
        return 'loader-ring';
      case 'heartbeat':
        return 'loader-heartbeat';
      default:
        return 'loader';
    }
  };

  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="loader-dots">
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
            <div className="loader-dot"></div>
          </div>
        );
      case 'wave':
        return (
          <div className="loader-wave">
            <div className="loader-wave-bar"></div>
            <div className="loader-wave-bar"></div>
            <div className="loader-wave-bar"></div>
            <div className="loader-wave-bar"></div>
            <div className="loader-wave-bar"></div>
          </div>
        );
      default:
        return <div className={getVariantClass()}></div>;
    }
  };

  return (
    <div className={getLoaderClass()}>
      {renderVariant()}
      {text && <div className="loader-text">{text}</div>}
    </div>
  );
};

export default Loader; 