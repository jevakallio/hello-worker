import UrlPattern from "url-pattern";

/**
 * Minimalist URL router to simplify responding to
 * worker requests
 */
export default class UrlRouter {
  routes: any[];

  constructor() {
    this.routes = [];
  }

  route(method: string, path: string, handler: any) {
    this.routes.push({
      path,
      method,
      handler,
      pattern: new UrlPattern(path),
    });
  }

  match(request) {
    let args;
    const path = new URL(request.url).pathname;
    for (let route of this.routes) {
      if (
        (route.method === "*" || route.method === request.method) &&
        (args = route.pattern.match(path))
      ) {
        return { route, args };
      }
    }
  }

  async respond(request: Request, ctx: any, fallback = 404) {
    const match = this.match(request);
    if (!match) {
      return this.wrapResponse(fallback);
    }

    let response = await match.route.handler(request, ctx, match.args);
    return this.wrapResponse(response);
  }

  wrapResponse(response) {
    if (!response) {
      return;
    }

    if (response instanceof Response) {
      return response;
    }

    if (typeof response === "number") {
      return new Response("", { status: response });
    }

    if (typeof response === "string") {
      return new Response(response);
    }

    if (typeof response === "object") {
      return new Response(JSON.stringify(response), {
        headers: { "Content-Type": "application/json" },
      });
    }

    return response;
  }
}
