// Hosting runs the server bundle as a Worker module, which accepts only handler exports.
import { createRequestHandler } from "react-router";
import * as build from "virtual:react-router/server-build";

const handler = createRequestHandler(build as never, "production");

export default {
  fetch(request: Request) {
    return handler(request);
  },
};
