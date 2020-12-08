import UrlRouter from "./UrlRouter";
import handleErrors from "./utils/handleErrors";

type TODO = any;

const router = new UrlRouter();

router.route("GET", "/", async (request, obj: DurableObjectDefinition) => {
  const data = await obj.storage.list();
  return {
    size: data.size,
    values: Object.fromEntries(data)
  };
});

router.route(
  "POST",
  "(/:id)",
  async (request, obj: DurableObjectDefinition, args) => {
    const data = {
      id: args.id,
      timestamp: +new Date(),
    };

    await obj.storage.put(args.id, data);
    return obj;
  }
);

export default class DurableObjectDefinition implements DurableObject {
  // durable storage interface
  storage: DurableObjectStorage;
  // websocket connections
  connections: TODO[];
  // last seen message timestamp
  lastTimestamp: number;

  constructor(controller, _env) {
    this.storage = controller.storage;
    this.connections = [];
    this.lastTimestamp = 0;
  }

  async fetch(request: Request, info: RequestInfo) {
    return await handleErrors(request, async () => {
      return router.respond(request, this);
    });
  }
}
