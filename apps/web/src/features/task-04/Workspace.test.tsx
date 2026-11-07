import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ClusterExplorer } from "./Workspace";
const { calls } = vi.hoisted(() => ({ calls: vi.fn() }));
vi.mock("../../lib/api", async (original) => ({
  ...(await original<typeof import("../../lib/api")>()),
  useSegmentation: () => ({
    data: {
      run_id: "fixture-run",
      feature_count: 5,
      projection_variance: 0.25,
      projection: [],
      profiles: [
        {
          id: 0,
          name: "Documentaries",
          size: 50,
          share: 1,
          movie_count: 50,
          tv_count: 0,
          median_year: 2020,
          median_movie_minutes: 90,
          median_tv_seasons: null,
          genres: [{ name: "Documentaries", count: 50 }],
          countries: [{ name: "United States", count: 50 }],
          representatives: [],
        },
      ],
    },
  }),
  useClusterTitles: (
    cluster: string,
    type: string,
    query: string,
    offset: number,
  ) => {
    calls(cluster, type, query, offset);
    return {
      data: {
        run_id: "fixture-run",
        total: query === "absent" ? 0 : 50,
        offset,
        limit: 25,
        items: [],
      },
    };
  },
}));
describe("cluster exploration controls", () => {
  it("resets pagination when the cluster changes", async () => {
    render(
      <MemoryRouter>
        <ClusterExplorer />
      </MemoryRouter>,
    );
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(calls).toHaveBeenLastCalledWith("", "", "", 25);
    await user.selectOptions(screen.getByLabelText("Cluster"), "0");
    expect(calls).toHaveBeenLastCalledWith("0", "", "", 0);
    expect(
      screen.getByRole("heading", { name: "Documentaries" }),
    ).toBeInTheDocument();
  });
  it("shows an honest empty state for a search with no matches", async () => {
    render(
      <MemoryRouter>
        <ClusterExplorer />
      </MemoryRouter>,
    );
    const user = userEvent.setup();
    await user.type(
      screen.getByRole("textbox", { name: "Search titles" }),
      "absent",
    );
    await user.click(screen.getByRole("button", { name: "Search titles" }));
    expect(
      screen.getByText(
        "No titles match these filters. Try another cluster or search.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
  });
});
