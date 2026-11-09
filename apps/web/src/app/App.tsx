import { ProjectMetadata } from "./ProjectMetadata";
import { useSectionNavigation } from "./useSectionNavigation";
import { useWorkspaceMotion } from "./useWorkspaceMotion";
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  Link,
} from "react-router";
import { DatasetPage } from "../components/Dataset";
import {
  SegmentationOverview,
  ClusterExplorer,
  SegmentationEvaluation,
  SegmentationMethodology,
} from "../features/task-04/Workspace";

export function App() {
  const location = useLocation();
  const sectionNavRef = useSectionNavigation(location.pathname);
  const mainRef = useWorkspaceMotion(location.pathname);
  return (
    <>
      <ProjectMetadata />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="masthead">
        <Link
          className="brand"
          to="/overview"
          aria-label="Netflix Content Segmentation home"
        >
          <span className="brand-mark" aria-hidden="true">
            <img src="/logo.svg?v=2" width="64" height="64" alt="" />
          </span>
          <span>
            CONTENT SEGMENTATION<small>NETFLIX / CATALOG CLUSTERING</small>
          </span>
        </Link>
        <div className="masthead-meta">
          <strong>INDEPENDENT ML PROJECT</strong>
          <span>CATALOG SNAPSHOT / 25 SEP 2021</span>
        </div>
      </header>
      <div className="workspace">
        <nav
          ref={sectionNavRef}
          className="section-nav"
          aria-label="Project sections"
        >
          {[
            ["overview", "Overview"],
            ["dataset", "About Dataset"],
            ["explore", "Explore"],
            ["evaluation", "Evaluation"],
            ["methodology", "Methodology"],
          ].map(([path, label], i) => (
            <NavLink key={path} to={`/${path}${location.search}`}>
              <small aria-hidden="true">{String(i + 1).padStart(2, "0")}</small>
              {label}
            </NavLink>
          ))}
        </nav>
        <main
          ref={mainRef}
          id="main"
          tabIndex={-1}
          key={location.pathname}
          className="page-enter"
        >
          <Routes>
            <Route path="/" element={<Navigate to="/overview" replace />} />
            <Route path="/dataset" element={<DatasetPage />} />
            <Route path="/overview" element={<SegmentationOverview />} />
            <Route path="/explore" element={<ClusterExplorer />} />
            <Route path="/evaluation" element={<SegmentationEvaluation />} />
            <Route path="/methodology" element={<SegmentationMethodology />} />
            <Route
              path="*"
              element={
                <div className="not-found">
                  <p className="eyebrow">404 / UNKNOWN SECTION</p>
                  <h1>Page not found</h1>
                  <Link to="/overview">Return to project</Link>
                </div>
              }
            />
          </Routes>
        </main>
        <footer>
          <span>Netflix / Content Segmentation</span>
          <span>
            Independent portfolio project. Not affiliated with Netflix.
          </span>
          <Link className="footer-index" to="/dataset">
            Dataset &amp; decisions
          </Link>
        </footer>
      </div>
    </>
  );
}
