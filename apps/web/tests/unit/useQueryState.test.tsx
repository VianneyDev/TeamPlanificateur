import { createElement } from "react";
import { act } from "react";
import { createRoot, hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { useQueryState } from "@/hooks/useQueryState";

type Updater = string | ((prev: string) => string);

type HookApi = {
  value: string;
  set: (next: Updater) => void;
};

function Probe({
  queryKey,
  defaultValue,
  onChange,
}: {
  queryKey: string;
  defaultValue: string;
  onChange: (api: HookApi) => void;
}) {
  const [value, set] = useQueryState(queryKey, defaultValue);
  onChange({ value, set });
  return createElement("span", { "data-testid": "value" }, value);
}

function mount(
  queryKey: string,
  defaultValue: string,
  pathWithSearch: string,
): { getApi: () => HookApi; unmount: () => void } {
  window.history.replaceState({}, "", pathWithSearch);

  let api: HookApi | undefined;
  const container = document.createElement("div");
  document.body.appendChild(container);
  let root: Root;

  act(() => {
    root = createRoot(container);
    root.render(
      createElement(Probe, {
        queryKey,
        defaultValue,
        onChange: (next) => {
          api = next;
        },
      }),
    );
  });

  return {
    getApi: () => {
      if (!api) throw new Error("hook did not mount");
      return api;
    },
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

describe("useQueryState", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/gestion");
    document.body.innerHTML = "";
  });

  afterEach(() => {
    window.history.replaceState({}, "", "/gestion");
    document.body.innerHTML = "";
  });

  it("after SSR hydration, value matches the query string without a hydration mismatch", async () => {
    window.history.replaceState({}, "", "/gestion");

    let latest = "";
    const tree = createElement(Probe, {
      queryKey: "teamsStatus",
      defaultValue: "active",
      onChange: (api) => {
        latest = api.value;
      },
    });

    const html = renderToString(tree);
    expect(html).toContain("active");

    window.history.replaceState({}, "", "/gestion?teamsStatus=archived");

    const container = document.createElement("div");
    container.innerHTML = html;
    document.body.appendChild(container);

    const recoverableErrors: unknown[] = [];
    await act(async () => {
      hydrateRoot(container, tree, {
        onRecoverableError: (error) => {
          recoverableErrors.push(error);
        },
      });
    });

    expect(recoverableErrors).toEqual([]);
    expect(latest).toBe("archived");
  });

  it("set updates both React state and the URL", () => {
    const { getApi, unmount } = mount("status", "active", "/gestion?status=archived");

    expect(getApi().value).toBe("archived");

    act(() => {
      getApi().set("all");
    });

    expect(getApi().value).toBe("all");
    expect(window.location.search).toBe("?status=all");

    act(() => {
      getApi().set("active");
    });

    expect(getApi().value).toBe("active");
    expect(window.location.search).toBe("");

    unmount();
  });

  it("resyncs from the URL on popstate", () => {
    const { getApi, unmount } = mount("page", "1", "/gestion");

    act(() => {
      getApi().set("3");
    });
    expect(getApi().value).toBe("3");
    expect(window.location.search).toBe("?page=3");

    act(() => {
      window.history.pushState({}, "", "/gestion?page=2");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(getApi().value).toBe("2");

    unmount();
  });
});
