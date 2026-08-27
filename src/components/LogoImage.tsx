import React from 'react';

export const LogoImage = ({ className = "w-10 h-10" }: { className?: string }) => {
  return (
    <img 
      src="https://i.ibb.co/cK8BhRKk/movie.png"
      alt="MovieZen Logo"
      className={`${className} object-contain`}
      width="512"
      height="512"
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
};
