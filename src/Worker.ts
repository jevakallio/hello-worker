import handleErrors from "./utils/handleErrors";
import UrlRouter from "./UrlRouter";

// define route table
const router = new UrlRouter();

router.route("GET", "/", () => "Hello Workers");

// Generate a new session id
router.route("POST", "/api/session", (request: Request, env) => {
  const ns: DurableObjectNamespace = env.objects;
  return {
    id: ns.newUniqueId().toString(),
  };
});

// Pass all session-related requests directly through
router.route('*', '/api/session/:id(/*)', (request, env, args) => {
  // Find the object by id
  const ns: DurableObjectNamespace = env.objects;
  const id = ns.idFromString(args.id);
  const obj: DurableObjectStub = env.objects.get(id);

  // Proxy the request to the object
  const path = args._;
  return obj.fetch(new Request(path, request));
});

// handle incoming requests
export default {
  async fetch(request, env) {
    return await handleErrors(request, async () => {
      return router.respond(request, env);
    });
  },
};
