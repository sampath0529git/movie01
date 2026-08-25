import React from 'react';

export const LogoImage = ({ className = "w-10 h-10" }: { className?: string }) => {
  return (
    <img 
      src="https://i.ibb.co/cK8BhRKk/movie.png"
      alt="MovieVibe Logo"
      className={className}
      referrerPolicy="no-referrer"
    />
  );
};

