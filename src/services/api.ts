import { SAMPLE_DATASETS, DatasetMetadata } from '../data/sampleDatasets';
import { analyzeRawDataset, executeDatasetAnalysis, computeDatasetStatistics } from '../server/analyticsEngine';

export interface DatasetInfo {
  id: string;
  name: string;
  description: string;
  rowCount: number;
  columnCount: number;
  fileType: 'CSV' | 'XLSX' | 'XLS';
  fileSizeKB: number;
  columns?: Array<{
    name: string;
    type: 'String' | 'Float' | 'Integer' | 'Date';
    nullCount: number;
    sampleValues: (string | number)[];
  }>;
}

export interface PreviewData extends DatasetInfo {
  sampleRows: Record<string, any>[];
}

export interface QueryResult {
  answer: string;
  table: Array<Record<string, any>>;
  chart: {
    type: 'bar' | 'line' | 'pie' | 'scatter' | 'histogram' | 'none';
    title: string;
    xAxisKey?: string;
    yAxisKey?: string;
    data: Array<Record<string, any>>;
  };
  pythonCode: string;
  calculation: string;
  executionTimeMs: number;
  rowsUsed: number;
  followUpQuestions: string[];
}

export interface DatasetStatistics {
  datasetName: string;
  stats: {
    totalRows: number;
    totalCols: number;
    fileType: string;
    fileSizeKB: number;
    nullRatioPct: number;
    numericColCount: number;
    categoricalColCount: number;
    numericSummaries: Record<string, { mean: number; std: number; min: number; p25: number; median: number; p75: number; max: number }>;
  };
}

const sampleList = Object.values(SAMPLE_DATASETS);

// In-Memory state for client-side Netlify fallback
let currentLocalDataset: DatasetMetadata = sampleList[0];

export async function fetchSampleDatasets(): Promise<DatasetInfo[]> {
  try {
    const res = await fetch('/api/sample-datasets');
    if (res.ok) {
      const data = await res.json();
      if (data && data.datasets) return data.datasets;
    }
  } catch (err) {
    console.info('Using client-side fallback for sample datasets');
  }
  return sampleList.map((ds) => ({
    id: ds.id,
    name: ds.name,
    description: ds.description,
    rowCount: ds.rowCount,
    columnCount: ds.columnCount,
    fileType: ds.fileType,
    fileSizeKB: ds.fileSizeKB,
    columns: ds.columns
  }));
}

export async function loadSampleDataset(datasetId: string): Promise<DatasetInfo> {
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datasetId })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.dataset) return data.dataset;
    }
  } catch (err) {
    console.info('Using client-side fallback for sample dataset selection');
  }

  const sample = SAMPLE_DATASETS[datasetId] || sampleList[0];
  currentLocalDataset = sample;
  return {
    id: sample.id,
    name: sample.name,
    description: sample.description,
    rowCount: sample.rowCount,
    columnCount: sample.columnCount,
    fileType: sample.fileType,
    fileSizeKB: sample.fileSizeKB,
    columns: sample.columns
  };
}

export async function uploadCustomDataset(
  name: string,
  rows: Record<string, any>[],
  fileType: 'CSV' | 'XLSX' | 'XLS' = 'CSV',
  fileSizeKB: number = 50
): Promise<DatasetInfo> {
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, rows, fileType, fileSizeKB })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.dataset) return data.dataset;
    }
  } catch (err) {
    console.info('Using client-side fallback for custom dataset upload');
  }

  const analyzed = analyzeRawDataset(name, rows, fileType, fileSizeKB);
  currentLocalDataset = analyzed;

  return {
    id: analyzed.id,
    name: analyzed.name,
    description: analyzed.description,
    rowCount: analyzed.rowCount,
    columnCount: analyzed.columnCount,
    fileType: analyzed.fileType,
    fileSizeKB: analyzed.fileSizeKB,
    columns: analyzed.columns
  };
}

export async function fetchDatasetPreview(): Promise<PreviewData> {
  try {
    const res = await fetch('/api/preview');
    if (res.ok) {
      const data = await res.json();
      if (data && data.name) return data;
    }
  } catch (err) {
    console.info('Using client-side fallback for dataset preview');
  }

  return {
    id: currentLocalDataset.id,
    name: currentLocalDataset.name,
    description: currentLocalDataset.description,
    rowCount: currentLocalDataset.rowCount,
    columnCount: currentLocalDataset.columnCount,
    fileType: currentLocalDataset.fileType,
    fileSizeKB: currentLocalDataset.fileSizeKB,
    columns: currentLocalDataset.columns,
    sampleRows: currentLocalDataset.rows.slice(0, 100)
  };
}

export async function fetchDatasetStatistics(): Promise<DatasetStatistics> {
  try {
    const res = await fetch('/api/statistics');
    if (res.ok) {
      const data = await res.json();
      if (data && data.stats) return data;
    }
  } catch (err) {
    console.info('Using client-side fallback for statistics');
  }

  const stats = computeDatasetStatistics(currentLocalDataset);
  return {
    datasetName: currentLocalDataset.name,
    stats
  };
}

export async function queryDataset(question: string): Promise<QueryResult> {
  try {
    const res = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.answer) return data;
    }
  } catch (err) {
    console.info('Using client-side fallback for dataset query');
  }

  const result = executeDatasetAnalysis(currentLocalDataset, question);
  return result;
}
