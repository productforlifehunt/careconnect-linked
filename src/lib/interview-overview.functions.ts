import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { interviewOverview } from "./interview-overview.server";

export const getInterviewOverview = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ path: z.string().min(1).max(299).refine((path) => !path.includes("/") && !path.includes("..")) }).parse(input))
  .handler(({ data }) => interviewOverview(data.path));