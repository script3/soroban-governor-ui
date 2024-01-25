import { useState, useEffect } from "react";

/**sm	640px	@media (min-width: 640px) { ... }
md	768px	@media (min-width: 768px) { ... }
lg	1024px	@media (min-width: 1024px) { ... }
xl	1280px	@media (min-width: 1280px) { ... }
2xl	1536px	@media (min-width: 1536px) { ... } */

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  xxl: 1536,
};
export const useBreakpoints = () => {
  const [width, setWidth] = useState<number>(breakpoints.sm);

  useEffect(() => {
    const handleWindowResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);

  return {
    width,
    breakpoints: {
      sm: width <= breakpoints.md,
      md: width >= breakpoints.md,
      lg: width >= breakpoints.lg,
      xl: width >= breakpoints.xl,
      xxl: width >= breakpoints.xxl,
    },
  };
};
