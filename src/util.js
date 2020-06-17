import React from 'react';

// Sync with constants.scss
export const GUTTER_MD_PX = 16;
export const GUTTER_LG_PX = 24;

export function useViewport() {
  const [width, setWidth] = React.useState(window.innerWidth);

  React.useEffect(() => {
    const handleWindowResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, []);

  return { width };
}
