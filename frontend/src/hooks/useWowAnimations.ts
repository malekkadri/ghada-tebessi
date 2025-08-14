import { useEffect } from 'react';

declare global {
  interface Window {
    WOW: any;
  }
}

export const useWowAnimations = () => {
  useEffect(() => {
    const initAnimations = () => {
      const wowElements = document.querySelectorAll('.wow');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            element.style.visibility = 'visible';
            element.classList.add('animated');
            
            if (element.classList.contains('fadeInUp')) {
              element.style.animation = 'fadeInUp 1s ease-in-out';
            } else if (element.classList.contains('zoomIn')) {
              element.style.animation = 'zoomIn 1s ease-in-out';
            }
            
            observer.unobserve(element);
          }
        });
      }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      wowElements.forEach((element) => {
        observer.observe(element);
      });
    };

    const timer = setTimeout(initAnimations, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);
};
