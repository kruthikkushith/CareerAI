
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Backend health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "CareerAI backend is running successfully!",
  });
});

// Fetch sample jobs from Greenhouse
async function getGreenhouseJobs() {
  const response = await fetch(
    "https://boards-api.greenhouse.io/v1/boards/example/jobs?content=true"
  );

  if (!response.ok) {
    throw new Error(`Greenhouse returned ${response.status}`);
  }

  const data = await response.json();

  return (data.jobs || []).map((job) => ({
    id: `greenhouse-${job.id}`,
    source: "Greenhouse",
    title: job.title,
    company: "DemoCorp",
    location: job.location?.name || "Not specified",
    description: job.content || "",
    jobUrl: job.absolute_url,
    applicationUrl: job.absolute_url,
    updatedAt: job.updated_at || null,
  }));
}

// Fetch sample jobs from Lever
async function getLeverJobs() {
  const response = await fetch(
    "https://api.lever.co/v0/postings/leverdemo?mode=json"
  );

  if (!response.ok) {
    throw new Error(`Lever returned ${response.status}`);
  }

  const data = await response.json();

  return (data || []).map((job) => ({
    id: `lever-${job.id}`,
    source: "Lever",
    title: job.text,
    company: "Lever Demo",
    location: job.categories?.location || "Not specified",
    description: job.descriptionPlain || "",
    jobUrl: job.hostedUrl,
    applicationUrl: job.applyUrl || job.hostedUrl,
    updatedAt: job.createdAt
      ? new Date(job.createdAt).toISOString()
      : null,
  }));
}

// Test both job sources
app.get("/api/jobs/test", async (req, res) => {
  const results = await Promise.allSettled([
    getGreenhouseJobs(),
    getLeverJobs(),
  ]);

  const jobs = [];
  const errors = [];

  results.forEach((result, index) => {
    const source = index === 0 ? "Greenhouse" : "Lever";

    if (result.status === "fulfilled") {
      jobs.push(...result.value);
    } else {
      errors.push({
        source,
        message: result.reason.message,
      });
    }
  });

  res.json({
    success: errors.length === 0,
    testMode: true,
    message:
      "These are demonstration jobs used to test API connections. They are not verified real vacancies.",
    totalJobs: jobs.length,
    jobs,
    errors,
  });
});

// Start server only after MongoDB connects
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `CareerAI backend running at http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start CareerAI:", error.message);
    process.exit(1);
  }
};

startServer();
