import { afterEach, describe, expect, it } from "vitest";
import { startServer, type TestServer } from "./helpers";

let server: TestServer;

afterEach(async () => {
  await server?.close();
});

describe("workspaces.list-workspaces", () => {
  it("lists saved workspaces of the acting user", async () => {
    server = await startServer();
    await server.request("POST", "/", {
      body: { name: "Ops", payload: { tabs: [] } },
    });
    const handler = server.mock.operationHandlers.get(
      "workspaces.list-workspaces",
    )!;
    const result = await server.mock.actAs("user-1", () =>
      handler.run({}, {} as never),
    );
    expect(result.summary).toBe("1 workspaces");
    expect((result.data as { rows: unknown[] }).rows).toEqual([
      expect.objectContaining({ name: "Ops" }),
    ]);
  });
});
