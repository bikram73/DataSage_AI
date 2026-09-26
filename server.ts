import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { SAMPLE_DATASETS, DatasetMetadata } from "./src/data/sampleDatasets";
import { analyzeRawDataset, executeDatasetAnalysis, computeDatasetStatistics } from "./src/server/analyticsEngine";

dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

// In-memory active session store (No dataset preloaded by default per requirement)
let activeDataset: DatasetMetadata | null = null;

// Initialize Gemini SDK server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API Routes
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", appName: "DataSage AI", hasActiveDataset: Boolean(activeDataset) });
});

// POST /api/clear - Clears active dataset
app.post("/api/clear", (_req, res) => {
  activeDataset = null;
  res.json({ message: "Dataset removed successfully" });
});

// DELETE /api/upload - Clears active dataset
app.delete("/api/upload", (_req, res) => {
  activeDataset = null;
  res.json({ message: "Dataset removed successfully" });
});

// GET /api/sample-datasets
app.get("/api/sample-datasets", (_req, res) => {
  res.json({
    datasets: Object.values(SAMPLE_DATASETS).map((ds) => ({
      id: ds.id,
      name: ds.name,
      description: ds.description,
      rowCount: ds.rowCount,
      columnCount: ds.columnCount,
      fileType: ds.fileType,
      fileSizeKB: ds.fileSizeKB
    }))
  });
});

// POST /api/upload
app.post("/api/upload", (req, res) => {
  try {
    const { datasetId, name, rows, fileType, fileSizeKB } = req.body;

    if (datasetId && SAMPLE_DATASETS[datasetId]) {
      activeDataset = SAMPLE_DATASETS[datasetId];
      return res.json({
        message: "Loaded sample dataset successfully",
        dataset: {
          id: activeDataset.id,
          name: activeDataset.name,
          description: activeDataset.description,
          rowCount: activeDataset.rowCount,
          columnCount: activeDataset.columnCount,
          fileType: activeDataset.fileType,
          fileSizeKB: activeDataset.fileSizeKB,
          columns: activeDataset.columns
        }
      });
    }

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: "Invalid or empty dataset provided" });
    }

    activeDataset = analyzeRawDataset(
      name || "Uploaded_Dataset.csv",
      rows,
      fileType || "CSV",
      fileSizeKB || Math.round(JSON.stringify(rows).length / 1024)
    );

    res.json({
      message: "Uploaded dataset parsed successfully",
      dataset: {
        id: activeDataset.id,
        name: activeDataset.name,
        description: activeDataset.description,
        rowCount: activeDataset.rowCount,
        columnCount: activeDataset.columnCount,
        fileType: activeDataset.fileType,
        fileSizeKB: activeDataset.fileSizeKB,
        columns: activeDataset.columns
      }
    });
  } catch (err: any) {
    console.error("Error in /api/upload:", err);
    res.status(500).json({ error: err.message || "Failed to process uploaded file" });
  }
});

// GET /api/preview
app.get("/api/preview", (_req, res) => {
  if (!activeDataset) {
    return res.json(null);
  }
  res.json({
    id: activeDataset.id,
    name: activeDataset.name,
    description: activeDataset.description,
    rowCount: activeDataset.rowCount,
    columnCount: activeDataset.columnCount,
    fileType: activeDataset.fileType,
    fileSizeKB: activeDataset.fileSizeKB,
    columns: activeDataset.columns,
    sampleRows: activeDataset.rows.slice(0, 100)
  });
});

// GET /api/statistics
app.get("/api/statistics", (_req, res) => {
  if (!activeDataset) {
    return res.json(null);
  }
  const stats = computeDatasetStatistics(activeDataset);
  res.json({
    datasetName: activeDataset.name,
    stats
  });
});

// POST /api/query
app.post("/api/query", async (req, res) => {
  try {
    const { question } = req.body;

    if (!activeDataset) {
      return res.status(400).json({ error: "No active dataset loaded. Please upload a dataset first." });
    }

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Question parameter is required" });
    }

    const schemaSummary = activeDataset.columns.map(
      (c) => `${c.name} (${c.type}, sample: ${c.sampleValues.slice(0, 3).join(", ")})`
    ).join("\n");

    const sampleDataSnippet = JSON.stringify(activeDataset.rows.slice(0, 3), null, 2);

    let aiPlan: any = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: `You are an expert Python Pandas data analyst for DataSage AI.
Analyze the user question regarding the dataset.

Dataset Schema:
${schemaSummary}

Sample Dataset Rows:
${sampleDataSnippet}

User Question: "${question}"

Formulate a Python Pandas calculation strategy. Respond in JSON with:
1. "pythonCode": Safe single or multi-line Pandas code using 'df' variable.
2. "explanation": Concise 1-2 sentence explanation of the calculation method.
3. "targetColumn": Primary metric column involved.
4. "groupColumn": Primary category/group column involved.
5. "chartType": Recommended chart ("bar", "line", "pie", "scatter", "histogram", "none").
`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                pythonCode: { type: Type.STRING },
                explanation: { type: Type.STRING },
                targetColumn: { type: Type.STRING },
                groupColumn: { type: Type.STRING },
                chartType: { type: Type.STRING }
              },
              required: ["pythonCode", "explanation"]
            }
          }
        });

        if (response && response.text) {
          aiPlan = JSON.parse(response.text.trim());
        }
      } catch (geminiErr) {
        console.warn("Gemini AI plan generation fallback to local execution engine:", geminiErr);
      }
    }

    // Execute exact computation on active dataframe
    const result = executeDatasetAnalysis(activeDataset, question, aiPlan);

    res.json(result);
  } catch (err: any) {
    console.error("Error in /api/query:", err);
    res.status(500).json({ error: err.message || "Failed to process data query" });
  }
});

// POST /api/chart
app.post("/api/chart", (req, res) => {
  try {
    const { chartType, xAxis, yAxis, aggregation } = req.body;
    const rows = activeDataset.rows;

    const groupMap: Record<string, { sum: number; count: number; mean: number }> = {};
    rows.forEach((r) => {
      const gKey = String(r[xAxis] || 'Other');
      const val = Number(r[yAxis]) || 0;
      if (!groupMap[gKey]) groupMap[gKey] = { sum: 0, count: 0, mean: 0 };
      groupMap[gKey].sum += val;
      groupMap[gKey].count += 1;
    });

    const data = Object.entries(groupMap).map(([k, stats]) => ({
      name: k,
      value: Math.round(aggregation === 'mean' ? stats.sum / stats.count : stats.sum),
      count: stats.count
    }));

    res.json({
      chartType: chartType || 'bar',
      xAxis,
      yAxis,
      data
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Chart generation failed" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DataSage AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
