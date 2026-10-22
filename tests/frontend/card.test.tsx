import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  renderWithApp,
  type RenderedPluginApp,
} from "@termix-ssh/plugin-sdk/testing";
import type { PluginManifest } from "@termix-ssh/plugin-sdk/manifest";
import * as plugin from "../../src/frontend/index";
import manifestJson from "../../manifest.json";
import locales from "../../locales/en.json";

const manifest = manifestJson as unknown as PluginManifest;

let rendered: RenderedPluginApp | null = null;

afterEach(async () => {
  await rendered?.deactivate();
  rendered = null;
});

const workspace = {
  id: 4,
  userId: "u",
  name: "Prod debugging",
  color: null,
  icon: null,
  kind: "manual",
  isDefault: true,
  payload: { version: 1, tabs: [] },
  syncId: null,
  createdAt: "",
  updatedAt: "",
  lastUsedAt: null,
  tabCount: 3,
};

describe("workspaces dashboard card", () => {
  it("applies a saved workspace after confirming", async () => {
    const api = {
      get: vi.fn(async () => ({ data: [workspace] })),
      post: vi.fn(async () => ({ data: workspace })),
      put: vi.fn(async () => ({ data: workspace })),
    };
    rendered = await renderWithApp(plugin, {
      manifest,
      locales,
      api: api as never,
      permissions: ["workspaces.use"],
    });
    expect(rendered.registered.dashboardCards()).toEqual(["workspaces"]);
    rendered.renderDashboardCard("workspaces");
    expect(await screen.findByText("3 tabs")).toBeTruthy();
    fireEvent.click(screen.getByText("Prod debugging"));
    fireEvent.click(
      await screen.findByRole("button", { name: "Apply Workspace" }),
    );
    await waitFor(() => expect(api.post).toHaveBeenCalledWith("/4/apply"));
    expect(rendered.shellCalls.map((call) => call.method)).toContain(
      "applyLayout",
    );
  });
});
