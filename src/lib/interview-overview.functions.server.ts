import { z } from "zod";
import { interviewOverview } from "./interview-overview.server";

export async function getInterviewOverview(rawData: unknown, request: Request) {
  const validate = ((input: unknown) => z.object({ path: z.string().min(1).max(299).refine((path) => !path.includes("/") && !path.includes("..")) }).parse(input));
  const data = validate(rawData);
return (interviewOverview(data.path));
}
