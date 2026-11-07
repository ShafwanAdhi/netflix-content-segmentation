import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Note, PageHeading, RunStamp, State } from "../../components/Shared";
import {
  modelName,
  percent,
  useClusterTitles,
  useSegmentation,
} from "../../lib/api";
import type { SegmentationResults } from "../../lib/api";
const colors = [
  "#000000",
  "#555555",
  "#888888",
  "#222222",
  "#666666",
  "#000000",
  "#555555",
  "#888888",
  "#222222",
  "#666666",
];
const shapes = [
  "circle",
  "square",
  "diamond",
  "triangle",
  "cross",
  "star",
  "wye",
] as const;
const color = (id: number) => colors[id % colors.length];
function Stamp({ data }: { data: SegmentationResults }) {
  return <RunStamp run={data.run_id} />;
}
function ClusterMap({
  data,
  selected = "",
}: {
  data: SegmentationResults;
  selected?: string;
}) {
  return (
    <>
      <div
        className="cluster-map"
        role="img"
        aria-label={`PCA visualization of ${data.projection.length} sampled titles, marked by cluster symbol and grayscale`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 15, right: 20, bottom: 25, left: 0 }}>
            <CartesianGrid stroke="#d0d0d0" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name="PC 1"
              tick={{ fontSize: 12 }}
              label={{
                value: "Principal component 1",
                position: "bottom",
                fontSize: 12,
              }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="PC 2"
              tick={{ fontSize: 12 }}
              width={45}
            />
            <Tooltip
              content={({ active, payload }) =>
                active && payload?.length ? (
                  <div className="map-tooltip">
                    <strong>{payload[0].payload.title}</strong>
                    <p>
                      Cluster {payload[0].payload.cluster} /{" "}
                      {payload[0].payload.type}
                    </p>
                  </div>
                ) : null
              }
            />
            {data.profiles
              .filter(
                (profile) => selected === "" || String(profile.id) === selected,
              )
              .map((profile) => (
                <Scatter
                  key={profile.id}
                  name={`Cluster ${profile.id}`}
                  data={data.projection.filter(
                    (point) => point.cluster === profile.id,
                  )}
                  fill={color(profile.id)}
                  fillOpacity={1}
                  shape={shapes[profile.id % shapes.length]}
                  legendType={shapes[profile.id % shapes.length]}
                  isAnimationActive={false}
                />
              ))}
            <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12 }} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <p className="table-note">
        {data.projection.length.toLocaleString()} proportionally sampled titles.
        Two PCA components explain {percent(data.projection_variance)} of
        feature variance. Distances and overlap in this view are approximations;
        clustering uses all {data.feature_count} feature dimensions.
      </p>
    </>
  );
}
export function SegmentationOverview() {
  const { data, error, isPending } = useSegmentation();
  if (!data) return <State error={error} loading={isPending} />;
  return (
    <>
      <PageHeading
        eyebrow="TASK 04 / UNSUPERVISED LEARNING"
        title="Find structure in the catalog."
        action={
          <Link className="button" to="/explore">
            Explore the groups
          </Link>
        }
      >
        Group titles by genre, origin, type and release attributes. Inspect the
        similarities without assuming an audience or popularity score.
      </PageHeading>
      <div className="summary-strip">
        <div>
          <span>UNIQUE CONTENT ENTITIES</span>
          <strong>{data.catalog_rows.toLocaleString()}</strong>
          <small>{data.removed_rows} repeated rows removed</small>
        </div>
        <div>
          <span>SELECTED GROUPS</span>
          <strong>{data.k}</strong>
          <small>{modelName(data.algorithm)}</small>
        </div>
        <div>
          <span>MEAN SILHOUETTE</span>
          <strong>{data.selected.silhouette_mean.toFixed(3)}</strong>
          <small>Internal separation, not accuracy</small>
        </div>
        <div>
          <span>SEED STABILITY</span>
          <strong>{data.selected.stability_ari.toFixed(3)}</strong>
          <small>Mean pairwise adjusted Rand index</small>
        </div>
      </div>
      <section className="report-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">01 / CATALOG GEOMETRY</p>
            <h2>A map of metadata similarities</h2>
          </div>
          <span className="subtle-label">PCA / VISUALIZATION ONLY</span>
        </div>
        <ClusterMap data={data} />
      </section>
      <section className="report-section">
        <p className="eyebrow">02 / GROUP SIZES</p>
        <h2>Different patterns, different scales.</h2>
        <div className="cluster-size-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.profiles}
              margin={{ left: 0, right: 10, bottom: 10, top: 20 }}
            >
              <CartesianGrid vertical={false} stroke="#d0d0d0" />
              <XAxis
                dataKey="id"
                tickFormatter={(value) => `C${value}`}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => [value, "Titles"]}
                labelFormatter={(id) => `Cluster ${id}`}
              />
              <Bar dataKey="size" isAnimationActive={false}>
                {data.profiles.map((profile) => (
                  <Cell key={profile.id} fill={color(profile.id)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="cluster-directory">
          {data.profiles.map((profile) => (
            <Link key={profile.id} to={`/explore?cluster=${profile.id}`}>
              <span
                className="cluster-swatch"
                style={{ background: color(profile.id) }}
              />
              <span>
                <strong>Cluster {profile.id}</strong>
                <small>{profile.name}</small>
              </span>
              <span>{profile.size.toLocaleString()}</span>
            </Link>
          ))}
        </div>
      </section>
      <Note>
        The selected silhouette indicates partial, not perfect separation.
        Cluster IDs are arbitrary; descriptive names summarize the most frequent
        genres. These are catalog groups, not verified viewer segments.
      </Note>
      <Stamp data={data} />
    </>
  );
}
export function ClusterExplorer() {
  const { data, error, isPending } = useSegmentation();
  const [params, setParams] = useSearchParams();
  const cluster = params.get("cluster") ?? "";
  const [type, setType] = useState("");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const titles = useClusterTitles(cluster, type, search, offset);
  if (!data) return <State error={error} loading={isPending} />;
  const profile = data.profiles.find((item) => String(item.id) === cluster);
  const select = (value: string) => {
    setParams(value ? { cluster: value } : {});
    setOffset(0);
  };
  return (
    <>
      <PageHeading
        eyebrow="TASK 04 / CLUSTER EXPLORER"
        title="Inspect the groups, title by title."
      >
        Use catalog profiles and representative titles to interpret each group.
        The map is a projection, not a measure of prediction confidence.
      </PageHeading>
      <div className="explorer-controls">
        <label>
          Cluster
          <select
            value={cluster}
            onChange={(event) => select(event.target.value)}
          >
            <option value="">All clusters</option>
            {data.profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                Cluster {profile.id} — {profile.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Content type
          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setOffset(0);
            }}
          >
            <option value="">All content</option>
            <option>Movie</option>
            <option>TV Show</option>
          </select>
        </label>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setSearch(query);
            setOffset(0);
          }}
        >
          <label htmlFor="title-search">Search titles</label>
          <div>
            <input
              id="title-search"
              value={query}
              maxLength={200}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search the catalog…"
            />
            <button aria-label="Search titles" type="submit">
              Search
            </button>
          </div>
        </form>
      </div>
      <div className="segment-explorer-grid">
        <section>
          <ClusterMap data={data} selected={cluster} />
          <div className="cluster-chip-list" aria-label="Filter clusters">
            {data.profiles.map((item) => (
              <button
                key={item.id}
                aria-pressed={cluster === String(item.id)}
                onClick={() =>
                  select(cluster === String(item.id) ? "" : String(item.id))
                }
              >
                <i style={{ background: color(item.id) }} />C{item.id}
              </button>
            ))}
          </div>
        </section>
        <aside className="cluster-profile" data-motion-revision={cluster}>
          {profile ? (
            <>
              <p className="eyebrow">
                CLUSTER {profile.id} / FULL GROUP PROFILE
              </p>
              <h2>{profile.name}</h2>
              <p>
                {profile.size.toLocaleString()} titles ·{" "}
                {percent(profile.share)} of the catalog
              </p>
              <dl>
                <div>
                  <dt>Movies / TV shows</dt>
                  <dd>
                    {profile.movie_count} / {profile.tv_count}
                  </dd>
                </div>
                <div>
                  <dt>Median release year</dt>
                  <dd>{profile.median_year}</dd>
                </div>
                <div>
                  <dt>Median film minutes</dt>
                  <dd>{profile.median_movie_minutes ?? "Not applicable"}</dd>
                </div>
                <div>
                  <dt>Median TV seasons</dt>
                  <dd>{profile.median_tv_seasons ?? "Not applicable"}</dd>
                </div>
              </dl>
              <h3>Top genres</h3>
              {profile.genres.map((item) => (
                <div className="profile-frequency" key={item.name}>
                  <span>{item.name}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
              <h3>Top countries</h3>
              {profile.countries.map((item) => (
                <div className="profile-frequency" key={item.name}>
                  <span>{item.name}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </>
          ) : (
            <div className="cluster-profile-empty">
              <h2>Choose a cluster.</h2>
              <p>
                Select a group to inspect its genres, countries and separate
                duration summaries.
              </p>
            </div>
          )}
        </aside>
      </div>
      {profile && (
        <section className="report-section">
          <p className="eyebrow">NEAREST-CENTROID EXAMPLES</p>
          <h2>Representative titles</h2>
          <p className="section-description">
            Five titles nearest to this group’s mean in the full weighted
            feature space. These are illustrative representatives, not
            recommendations.
          </p>
          <div
            className="table-scroll"
            tabIndex={0}
            role="region"
            aria-label="Scrollable results table"
          >
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Year</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {profile.representatives.map((row) => (
                  <tr key={row.show_id}>
                    <td>{row.title}</td>
                    <td>{row.type}</td>
                    <td>{row.release_year}</td>
                    <td>{row.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <section className="report-section">
        <div className="section-heading">
          <h2>Catalog titles</h2>
          <span className="subtle-label">
            {titles.data?.total.toLocaleString() ?? "…"} MATCHING TITLES
          </span>
        </div>
        {titles.error ? (
          <State error={titles.error} />
        ) : !titles.data ? (
          <State loading />
        ) : (
          <>
            <div
              className="table-scroll"
              tabIndex={0}
              role="region"
              aria-label="Scrollable results table"
            >
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Cluster</th>
                    <th>Type</th>
                    <th>Year</th>
                    <th>Duration</th>
                    <th>Country</th>
                  </tr>
                </thead>
                <tbody>
                  {titles.data.items.map((row) => (
                    <tr key={row.show_id}>
                      <td>{row.title}</td>
                      <td>C{row.cluster}</td>
                      <td>{row.type}</td>
                      <td>{row.release_year}</td>
                      <td>{row.duration}</td>
                      <td>{row.country}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!titles.data.total && (
              <p className="empty-catalog" role="status">
                No titles match these filters. Try another cluster or search.
              </p>
            )}
            <div className="pagination">
              <span>
                {titles.data.total
                  ? `${offset + 1}–${Math.min(offset + 25, titles.data.total)} of ${titles.data.total.toLocaleString()}`
                  : "0 matches"}
              </span>
              <button
                aria-label="Previous page"
                disabled={offset === 0}
                onClick={() => setOffset(Math.max(0, offset - 25))}
              >
                Previous
              </button>
              <button
                aria-label="Next page"
                disabled={offset + 25 >= titles.data.total}
                onClick={() => setOffset(offset + 25)}
              >
                Next
              </button>
            </div>
          </>
        )}
      </section>
      <Note>
        Profile counts describe the whole selected cluster; content-type and
        title-search filters apply to the catalog table. Genre/country counts
        are multi-label and can sum beyond group size.
      </Note>
      <Stamp data={data} />
    </>
  );
}
export function SegmentationEvaluation() {
  const { data, error, isPending } = useSegmentation();
  if (!data) return <State error={error} loading={isPending} />;
  const algorithms = [...new Set(data.experiments.map((row) => row.algorithm))];
  const curve = Array.from(new Set(data.experiments.map((row) => row.k))).map(
    (k) =>
      Object.fromEntries([
        ["k", k],
        ...algorithms.map((algorithm) => [
          algorithm,
          data.experiments.find(
            (row) => row.algorithm === algorithm && row.k === k,
          )?.silhouette_mean,
        ]),
      ]),
  );
  return (
    <>
      <PageHeading
        eyebrow="TASK 04 / INTERNAL VALIDATION"
        title="Compare structure, not classification accuracy."
      >
        Three algorithms, nine cluster counts, three seeds. Every candidate uses
        the same features and scoring sample.
      </PageHeading>
      <div className="selected-model">
        <span className="tag">SELECTED MODEL</span>
        <strong>
          {modelName(data.algorithm)} / k={data.k}
        </strong>
        <span>
          {data.sample_size.toLocaleString()} scoring titles / 3 seeds
        </span>
      </div>
      <div className="summary-strip">
        <div>
          <span>MEAN SILHOUETTE ↑</span>
          <strong>{data.selected.silhouette_mean.toFixed(3)}</strong>
          <small>Std {data.selected.silhouette_std.toFixed(3)}</small>
        </div>
        <div>
          <span>DAVIES–BOULDIN ↓</span>
          <strong>{data.selected.davies_bouldin.toFixed(3)}</strong>
          <small>Lower suggests stronger separation</small>
        </div>
        <div>
          <span>CALINSKI–HARABASZ ↑</span>
          <strong>{data.selected.calinski_harabasz.toFixed(0)}</strong>
          <small>Compare within this representation</small>
        </div>
        <div>
          <span>SEED ARI ↑</span>
          <strong>{data.selected.stability_ari.toFixed(3)}</strong>
          <small>Same-catalog initialization stability</small>
        </div>
      </div>
      <section className="report-section">
        <p className="eyebrow">01 / SELECTION CURVE</p>
        <h2>How separation changes with group count</h2>
        <div className="comparison-curve">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={curve}
              margin={{ left: 0, right: 25, top: 25, bottom: 10 }}
            >
              <CartesianGrid stroke="#d0d0d0" strokeDasharray="3 3" />
              <XAxis
                dataKey="k"
                label={{
                  value: "Number of clusters",
                  position: "insideBottom",
                  offset: -5,
                  fontSize: 12,
                }}
              />
              <YAxis domain={["auto", "auto"]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 20 }} />
              {algorithms.map((name, i) => (
                <Line
                  key={name}
                  type="linear"
                  dataKey={name}
                  name={modelName(name)}
                  stroke={color(i)}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
      <Note>
        Silhouette is geometric evidence, not semantic ground truth. The
        selected k={data.k} is the best among tested values 2–10, not a globally
        optimal group count. Two-dimensional PCA explains only{" "}
        {percent(data.projection_variance)} of variance.
      </Note>
      <section className="report-section">
        <p className="eyebrow">02 / ALL CANDIDATES</p>
        <h2>A complete record of the comparison</h2>
        <div
          className="table-scroll"
          tabIndex={0}
          role="region"
          aria-label="Scrollable results table"
        >
          <table>
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>k</th>
                <th>Silhouette</th>
                <th>Std</th>
                <th>DB ↓</th>
                <th>CH ↑</th>
                <th>ARI ↑</th>
                <th>Eligible</th>
              </tr>
            </thead>
            <tbody>
              {data.experiments.map((row) => (
                <tr
                  className={
                    row.algorithm === data.algorithm && row.k === data.k
                      ? "selected-row"
                      : ""
                  }
                  key={`${row.algorithm}-${row.k}`}
                >
                  <td>{modelName(row.algorithm)}</td>
                  <td>{row.k}</td>
                  <td>{row.silhouette_mean.toFixed(3)}</td>
                  <td>{row.silhouette_std.toFixed(3)}</td>
                  <td>{row.davies_bouldin.toFixed(3)}</td>
                  <td>{row.calinski_harabasz.toFixed(0)}</td>
                  <td>{row.stability_ari.toFixed(3)}</td>
                  <td>{row.eligible ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="table-note">
          Eligibility requires convergence, all requested groups, and at least
          1% catalog share in every group for every seed. All reported scores
          are in-sample internal diagnostics.
        </p>
      </section>
      <Stamp data={data} />
    </>
  );
}
export function SegmentationMethodology() {
  const { data, error, isPending } = useSegmentation();
  if (!data) return <State error={error} loading={isPending} />;
  return (
    <>
      <PageHeading
        eyebrow="TASK 04 / EXPERIMENT DESIGN"
        title="Define similarity before discovering groups."
      >
        The representation determines what “similar” means. Every modeling and
        visualization choice is explicit.
      </PageHeading>
      <div className="pipeline-strip">
        {[
          "Source audit",
          "Entity deduplication",
          "Block-weighted metadata",
          "Compare clusters",
          "Profiles + projection",
        ].map((text) => (
          <span key={text}>{text}</span>
        ))}
      </div>
      <section className="method-grid">
        <div>
          <p className="eyebrow">THE WORKFLOW</p>
          <ol className="workflow">
            {[
              [
                "Prepare entities",
                "Verify the same supplied CSV and retain the first row per normalized title/type/year. Seven repeated rows are removed; Task 3 artifacts remain independent.",
              ],
              [
                "Encode and scale",
                "L2-normalize each categorical block. Robust-scale year and log-duration within each content type; cap values at ±3 IQR-scaled units. Film minutes and TV seasons remain distinct.",
              ],
              [
                "Balance the blocks",
                "Genre 1.00; type 0.35; country 0.35; year 0.25; duration 0.25. These multiply block vectors, so they define the geometry rather than percentage contributions.",
              ],
              [
                "Compare 27 candidates",
                "K-Means, MiniBatch K-Means, and diagonal-covariance Gaussian Mixture; k=2–10 and seeds 42, 43, 44. Evaluate the same fixed 1,500-title sample in full feature space.",
              ],
              [
                "Interpret and freeze",
                "Choose eligible candidates by mean silhouette, then lower DB, lower k and fixed algorithm order. Refit at seed 42, save assignments, summarize groups, and project with PCA for display only.",
              ],
            ].map(([heading, text], i) => (
              <li key={heading}>
                <span>0{i + 1}</span>
                <div>
                  <h2>{heading}</h2>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <aside className="method-aside">
          <h2>Descriptive, not predictive validation.</h2>
          <p>
            The encoder and models fit the full deduplicated catalog. There is
            no held-out accuracy claim: this is an unsupervised description of
            this snapshot.
          </p>
          <h3>What is excluded?</h3>
          <p>
            Rating, title, source ID, director and date added. Titles are used
            only for entity review and display. Ratings do not define or name
            groups.
          </p>
          <h3>What does stability mean?</h3>
          <p>
            Pairwise adjusted Rand index compares seed assignments on the same
            catalog. It does not assess resampling, future releases, or semantic
            correctness.
          </p>
          <h3>How are titles chosen?</h3>
          <p>
            Representatives are nearest to a group’s mean in the full weighted
            space. The map shows a proportional group sample; names summarize
            the top two genres.
          </p>
        </aside>
      </section>
      <Note>
        Feature weights, distance metrics, and candidate ranges are modeling
        choices. Historical coverage, unknown country metadata and coarse
        catalog categories limit interpretation. Cluster IDs can permute between
        fits.
      </Note>
      <Stamp data={data} />
    </>
  );
}
