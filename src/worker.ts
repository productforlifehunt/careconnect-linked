// Hosting runs the server bundle as a Worker module that needs a default fetch
// handler; the named React Router build exports stay for Node-style servers.
import { createRequestHandler } from "react-router";
import * as build from "virtual:react-router/server-build";

export * from "virtual:react-router/server-build";

const handler = createRequestHandler(build as never, "production");

export default {
  fetch(request: Request) {
    return handler(request);
  },
};
