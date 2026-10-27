import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  createMemoryRouter,
  RouterProvider,
  type RouteObject,
} from "react-router-dom";
import { routes } from "@/App";

function Thrower(): never {
  throw new Error("boom from a screen");
}

// Swap the element of every leaf route for one that throws, keeping the
// route table (and so its errorElements) exactly as the app has it.
function withThrowingScreens(list: RouteObject[]): RouteObject[] {
  return list.map((route) => {
    if (route.children) {
      return { ...route, children: withThrowingScreens(route.children) };
    }
    return { ...route, element: <Thrower /> };
  });
}

function everyRoute(list: RouteObject[]): RouteObject[] {
  return list.flatMap((route) => [route, ...everyRoute(route.children ?? [])]);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("router error handling", () => {
  it("shows the friendly page, not React Router's developer page, when a screen throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const router = createMemoryRouter(withThrowingScreens(routes), {
      initialEntries: ["/settings"],
    });
    render(<RouterProvider router={router} />);

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.queryByText(/Unexpected Application Error/i),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/boom from a screen/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go Home" })).toBeInTheDocument();
  });

  it("shows the friendly page when the shell itself throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const router = createMemoryRouter(
      routes.map((route) => ({ ...route, element: <Thrower /> })),
      { initialEntries: ["/"] },
    );
    render(<RouterProvider router={router} />);

    expect(await screen.findByText("Something went wrong")).toBeInTheDocument();
    expect(
      screen.queryByText(/Unexpected Application Error/i),
    ).not.toBeInTheDocument();
  });

  it("gives every route an errorElement", () => {
    for (const route of everyRoute(routes)) {
      expect(
        route.errorElement,
        `route ${route.path ?? "(index)"} has no errorElement`,
      ).toBeTruthy();
    }
  });
});
