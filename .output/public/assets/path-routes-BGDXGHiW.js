var e=`import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { useLocation } from "@/lib/router-compat";

/**
 * Minimal path switch for the sub-apps (NotchSafety, ESM survey) that pick a
 * screen from the current path inside one shared URL space. The file-based
 * router owns the URL; this only chooses which element a sub-app shows.
 * Supports static segments, \`:param\` segments and a trailing \`*\`.
 */
interface RouteProps {
  path: string;
  element: ReactNode;
}

export function Route(_props: RouteProps): ReactElement | null {
  // Never rendered directly — <Routes> reads its props.
  return null;
}

function matches(pattern: string, pathname: string): boolean {
  if (pattern === "*") return true;
  const want = pattern.split("/").filter(Boolean);
  const have = pathname.split("/").filter(Boolean);
  const splat = want[want.length - 1] === "*";
  if (splat) want.pop();
  if (splat ? have.length < want.length : have.length !== want.length) return false;
  return want.every((segment, i) => segment.startsWith(":") || segment === have[i]);
}

export function Routes({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const routes: RouteProps[] = [];
  Children.forEach(children, (child) => {
    if (isValidElement<RouteProps>(child) && typeof child.props.path === "string") {
      routes.push(child.props);
    }
  });
  const hit = routes.find((route) => matches(route.path, pathname));
  return <>{hit ? hit.element : null}</>;
}
`;export{e as default};