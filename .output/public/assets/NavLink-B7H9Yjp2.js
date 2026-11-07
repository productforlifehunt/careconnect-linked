var e=`import { forwardRef, type ComponentProps } from "react";
import { Link, useLocation } from "@/lib/router-compat";
import { cn } from "@/lib/utils";

type LinkProps = ComponentProps<typeof Link>;

interface NavLinkCompatProps extends Omit<LinkProps, "className"> {
  to: string;
  /** Match the path exactly instead of as a prefix (react-router \`end\`). */
  end?: boolean | undefined;
  className?: string | undefined;
  activeClassName?: string | undefined;
  pendingClassName?: string | undefined;
}

/** Path-only part of a link target ("/inbox?tab=x" → "/inbox"). */
function targetPath(to: string): string {
  return (to.split("#")[0] ?? "").split("?")[0] || "/";
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName: _pending, to, end, ...props }, ref) => {
    const { pathname } = useLocation();
    const path = targetPath(to);
    const isActive = end || path === "/"
      ? pathname === path
      : pathname === path || pathname.startsWith(path.endsWith("/") ? path : \`\${path}/\`);
    return (
      <Link
        ref={ref}
        to={to}
        className={cn(className, isActive && activeClassName)}
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
`;export{e as default};