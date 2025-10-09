import React from 'react';
import notFoundImage from '../images/404.jpg';

const NotFound = () => {
  return (
    <div 
      style={{
        height: '100vh',
        width: '100vw',
        backgroundImage: `url(${notFoundImage})`,
        backgroundSize: 'cover',        
        backgroundPosition: 'center',   
        backgroundRepeat: 'no-repeat',  
        backgroundAttachment: 'fixed',  
        margin: 0,
        padding: 0
      }}
    />
  );
};

export default NotFound;