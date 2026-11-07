/** Small React Router adapter for the app's existing string based navigation calls. */
import {
  Link as RouterLink,
  Navigate as RouterNavigate,
  NavLink as RouterNavLink,
  Outlet,
  useLocation as useRouterLocation,
  useNavigate as useRouterNavigate,
  useParams as useRouterParams,
  useSearchParams as useRouterSearchParams,
  type LinkProps,
  type NavLinkProps,
} from "react-router";
import { forwardRef, type ComponentProps } from "react";

type NavigateOptions = { replace?: boolean; state?: unknown };
type NavigateFn = {
  (to: string | number, options?: NavigateOptions): void;
  (delta: number): void;
};

export function useNavigate(): NavigateFn {
  return useRouterNavigate() as NavigateFn;
}

export function useLocation() {
  const location = useRouterLocation();
  return { ...location, search: location.search };
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>(): T {
  return useRouterParams() as T;
}

export function useSearchParams() {
  return useRouterSearchParams();
}

type CompatLinkProps = Omit<LinkProps, "to"> & { to: string };
export const Link = forwardRef<HTMLAnchorElement, CompatLinkProps>(function Link(props, ref) {
  return <RouterLink ref={ref} {...props} />;
});

type CompatNavLinkProps = Omit<NavLinkProps, "to"> & { to: string };
export const NavLink = forwardRef<HTMLAnchorElement, CompatNavLinkProps>(function NavLink(props, ref) {
  return <RouterNavLink ref={ref} {...props} />;
});

export function Navigate(props: ComponentProps<typeof RouterNavigate>) {
  return <RouterNavigate {...props} />;
}

export { Outlet };
