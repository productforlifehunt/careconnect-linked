//#region node_modules/.nitro/vite/services/ssr/assets/use-mobile-BM9QkVlR.js
var use_mobile_default = "import * as React from \"react\";\n\nconst MOBILE_BREAKPOINT = 768;\n\nexport function useIsMobile() {\n  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);\n\n  React.useEffect(() => {\n    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);\n    const onChange = () => {\n      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);\n    };\n    mql.addEventListener(\"change\", onChange);\n    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);\n    return () => mql.removeEventListener(\"change\", onChange);\n  }, []);\n\n  return !!isMobile;\n}\n";
//#endregion
export { use_mobile_default as default };
