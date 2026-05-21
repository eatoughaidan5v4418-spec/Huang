declare module "next/server.js" {
  export class NextRequest extends Request {
    nextUrl: URL;
  }

  export class NextResponse<T = unknown> extends Response {
    static json<JsonBody>(body: JsonBody, init?: ResponseInit): NextResponse<JsonBody>;
  }
}
