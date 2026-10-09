import { createFileRoute } from "@tanstack/react-router";
import XianyuListings from "@/pages/XianyuListings";

export const Route = createFileRoute("/xianyu-listings")({
  component: XianyuListings,
});
