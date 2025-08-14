import { useEffect } from 'react';

const LoadBootstrap = () => {
  useEffect(() => {
    const bootstrapCSS = document.createElement('link');
    bootstrapCSS.href = '/assets/styleTemplate/css/bootstrap.min.css';
    bootstrapCSS.rel = 'stylesheet';
    document.head.appendChild(bootstrapCSS);

    return () => {
      document.head.removeChild(bootstrapCSS);
    };
  }, []);

  return null;
};

export default LoadBootstrap;