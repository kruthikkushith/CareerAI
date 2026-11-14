
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/api";

function App() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const response = await fetch(`${API_URL}/jobs/test`);

        if (!response.ok) {
          throw new Error("Unable to connect to the job service.");
        }

        const data = await response.json();

        setJobs(data.jobs || []);
        setTestMode(data.testMode === true);

        if (data.errors?.length) {
          setError(
            data.errors.map((item) =>
              `${item.source}: ${item.message}`
            ).join(" | ")
          );
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) => {
    const text = `${job.title} ${job.company} ${job.location}`
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">Career<span>AI</span></div>

        <nav>
          <a href="#home">Home</a>
          <a href="#jobs">Find Jobs</a>
          <a href="#about">About</a>
          <button className="login-btn">Login</button>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <p className="eyebrow">YOUR CAREER, YOUR FUTURE</p>

          <h1>
            Find the right job.
            <br />
            <span>Build your future.</span>
          </h1>

          <p className="hero-description">
            Discover opportunities and move closer to your dream career
            with CareerAI.
          </p>

          <div className="search-box">
            <input
              type="text"
              placeholder="Search job title, company or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button onClick={() =>
              document.getElementById("jobs")?.scrollIntoView({
                behavior: "smooth",
              })
            }>
              Search Jobs
            </button>
          </div>
        </section>

        <section className="jobs-section" id="jobs">
          <div className="section-heading">
            <div>
              <p className="eyebrow">EXPLORE OPPORTUNITIES</p>
              <h2>Latest Job Listings</h2>
            </div>

            <span className="job-count">
              {filteredJobs.length} jobs found
            </span>
          </div>

          {testMode && (
            <div className="demo-warning">
              Demo mode: These are sample listings used to test API
              connections. They are not verified real vacancies.
            </div>
          )}

          {loading && <p className="message">Loading jobs...</p>}

          {error && (
            <p className="error-message">
              {error}
            </p>
          )}

          {!loading && filteredJobs.length === 0 && (
            <p className="message">No matching jobs found.</p>
          )}

          <div className="job-grid">
            {filteredJobs.map((job) => (
              <article className="job-card" key={job.id}>
                <div className="job-top">
                  <span className="source">{job.source}</span>
                </div>

                <h3>{job.title}</h3>
                <p className="company">{job.company}</p>
                <p className="location">
                  <span>📍</span> {job.location}
                </p>

                <a
                  className="apply-btn"
                  href={job.applicationUrl || job.jobUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View Listing ↗
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section" id="about">
          <h2>More than just a job search</h2>
          <p>
            CareerAI aims to help candidates discover relevant jobs,
            understand their skills and manage their career journey
            in one place.
          </p>
        </section>
      </main>

      <footer>
        <div className="logo">Career<span>AI</span></div>
        <p>Building better career opportunities.</p>
        <p>© 2026 CareerAI. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
