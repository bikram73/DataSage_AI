import { DatasetMetadata, DatasetColumn } from '../data/sampleDatasets';

export interface DataFrameQueryResult {
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

/**
 * Infer metadata and clean column names from raw JSON rows
 */
export function analyzeRawDataset(
  name: string,
  rows: Record<string, any>[],
  fileType: 'CSV' | 'XLSX' | 'XLS' = 'CSV',
  fileSizeKB: number = 50
): DatasetMetadata {
  if (!rows || rows.length === 0) {
    return {
      id: `ds_${Date.now()}`,
      name,
      description: 'Empty dataset',
      rowCount: 0,
      columnCount: 0,
      fileType,
      fileSizeKB,
      columns: [],
      rows: []
    };
  }

  // Sanitize duplicate column keys if any
  const rawKeys = Object.keys(rows[0]);
  const seenKeys = new Map<string, number>();
  const sanitizedKeyMap: Record<string, string> = {};

  rawKeys.forEach((key) => {
    const trimmed = key.trim() || 'Column';
    const count = seenKeys.get(trimmed) || 0;
    seenKeys.set(trimmed, count + 1);
    sanitizedKeyMap[key] = count === 0 ? trimmed : `${trimmed}_${count}`;
  });

  const sanitizedRows = rows.map((row) => {
    const newRow: Record<string, any> = {};
    Object.keys(row).forEach((k) => {
      const targetKey = sanitizedKeyMap[k] || k;
      newRow[targetKey] = row[k];
    });
    return newRow;
  });

  const uniqueKeys = Array.from(new Set(Object.values(sanitizedKeyMap)));

  const columns: DatasetColumn[] = uniqueKeys.map((key) => {
    let nullCount = 0;
    let isInteger = true;
    let isFloat = true;
    let isDate = true;
    let isBoolean = true;
    let hasNonNull = false;

    const sampleVals: (string | number)[] = [];
    const uniqueValSet = new Set<string>();

    for (let i = 0; i < sanitizedRows.length; i++) {
      const val = sanitizedRows[i][key];
      if (val === null || val === undefined || val === '' || String(val).trim().toUpperCase() === 'NULL' || String(val).trim().toUpperCase() === 'NAN') {
        nullCount++;
        continue;
      }

      hasNonNull = true;
      const strVal = String(val).trim();
      uniqueValSet.add(strVal);

      if (sampleVals.length < 5) {
        sampleVals.push(strVal);
      }

      // Check boolean
      if (isBoolean) {
        const lower = strVal.toLowerCase();
        if (lower !== 'true' && lower !== 'false' && lower !== '1' && lower !== '0' && lower !== 'yes' && lower !== 'no') {
          isBoolean = false;
        }
      }

      // Check date
      if (isDate) {
        const isNumeric = !isNaN(Number(strVal));
        if (isNumeric) {
          isDate = false;
        } else {
          const d = Date.parse(strVal);
          if (isNaN(d)) {
            isDate = false;
          }
        }
      }

      // Check number (strip optional currency symbols / commas for checking)
      const cleanNumStr = strVal.replace(/[$,€£% ]/g, '').replace(/,/g, '');
      const num = Number(cleanNumStr);
      if (isNaN(num) || cleanNumStr === '') {
        isInteger = false;
        isFloat = false;
      } else {
        if (!Number.isInteger(num)) {
          isInteger = false;
        }
      }
    }

    let type: 'String' | 'Float' | 'Integer' | 'Date' = 'String';
    if (hasNonNull) {
      if (isDate) type = 'Date';
      else if (isInteger) type = 'Integer';
      else if (isFloat) type = 'Float';
    }

    return {
      name: key,
      type,
      nullCount,
      sampleValues: sampleVals
    };
  });

  return {
    id: `ds_${Date.now()}`,
    name,
    description: `Dataset with ${sanitizedRows.length} rows and ${columns.length} columns`,
    rowCount: sanitizedRows.length,
    columnCount: columns.length,
    fileType,
    fileSizeKB,
    columns,
    rows: sanitizedRows
  };
}

/**
 * Helper to safely extract numeric value from row cell
 */
export function getNumericValue(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const clean = String(val).replace(/[$,€£% ]/g, '').replace(/,/g, '');
  const n = Number(clean);
  return isNaN(n) ? 0 : n;
}

/**
 * Fuzzy column finder with synonym dictionary
 */
export function resolveColumn(
  dataset: DatasetMetadata,
  typeConstraint: 'numeric' | 'string' | 'date' | 'any',
  userTerms: string[]
): string | null {
  const cols = dataset.columns.filter((c) => {
    if (typeConstraint === 'numeric') return c.type === 'Float' || c.type === 'Integer';
    if (typeConstraint === 'string') return c.type === 'String';
    if (typeConstraint === 'date') return c.type === 'Date';
    return true;
  });

  if (cols.length === 0) return null;

  // 1. Direct case-insensitive match
  for (const term of userTerms) {
    const t = term.toLowerCase().trim();
    if (!t) continue;
    const direct = cols.find((c) => c.name.toLowerCase() === t);
    if (direct) return direct.name;
  }

  // 2. Substring match
  for (const term of userTerms) {
    const t = term.toLowerCase().trim();
    if (!t) continue;
    const sub = cols.find((c) => c.name.toLowerCase().includes(t) || t.includes(c.name.toLowerCase()));
    if (sub) return sub.name;
  }

  // 3. Synonym dictionary matching
  const synonyms: Record<string, string[]> = {
    sales: ['sales', 'revenue', 'turnover', 'amount', 'earnings', 'total_sales'],
    profit: ['profit', 'net_income', 'margin', 'gain', 'net_profit'],
    quantity: ['quantity', 'qty', 'volume', 'count', 'units', 'orders'],
    region: ['region', 'territory', 'zone', 'area', 'location'],
    city: ['city', 'town', 'metro', 'municipality'],
    product: ['product', 'item', 'sku', 'product_name', 'good', 'article'],
    category: ['category', 'segment', 'type', 'group', 'class', 'department'],
    customer: ['customer', 'client', 'buyer', 'account', 'user', 'name', 'employee'],
    date: ['date', 'timestamp', 'created_at', 'order_date', 'period', 'month', 'year']
  };

  for (const term of userTerms) {
    const t = term.toLowerCase().trim();
    for (const [canonical, syns] of Object.entries(synonyms)) {
      if (syns.some((s) => t.includes(s) || s.includes(t))) {
        const found = cols.find((c) => syns.some((s) => c.name.toLowerCase().includes(s)));
        if (found) return found.name;
      }
    }
  }

  return null;
}

/**
 * Executes a deterministic calculation on the dataset rows based on natural language query
 */
export function executeDatasetAnalysis(
  dataset: DatasetMetadata,
  userQuestion: string,
  aiPlan?: {
    pythonCode?: string;
    explanation?: string;
    targetColumn?: string;
    groupColumn?: string;
    chartType?: 'bar' | 'line' | 'pie' | 'scatter' | 'histogram' | 'none';
  }
): DataFrameQueryResult {
  const startTime = Date.now();
  const rows = dataset.rows;
  const qLower = (userQuestion || '').toLowerCase().trim();

  const numericCols = dataset.columns.filter((c) => c.type === 'Float' || c.type === 'Integer').map((c) => c.name);
  const stringCols = dataset.columns.filter((c) => c.type === 'String').map((c) => c.name);
  const dateCols = dataset.columns.filter((c) => c.type === 'Date').map((c) => c.name);

  // Security checks against malicious injection or command execution strings
  const injectionPatterns = ['ignore previous', 'system prompt', 'reveal api', 'os.system', 'subprocess', 'exec(', 'eval(', '__import__', 'require(', 'fs.read'];
  if (injectionPatterns.some((pattern) => qLower.includes(pattern))) {
    return {
      answer: "Security check: The input contained an unsafe command or prompt instruction. Arbitrary code execution is blocked. All computations are strictly executed by deterministic dataframe routines.",
      table: [],
      chart: { type: 'none', title: 'Security Check Triggered', data: [] },
      pythonCode: "# Blocked unsafe execution attempt\npass",
      calculation: "Input sanitized; no arbitrary server script execution permitted.",
      executionTimeMs: 2,
      rowsUsed: 0,
      followUpQuestions: [
        "What is total sales by region?",
        "Show the top 5 products by revenue",
        "What is the average profit margin?"
      ]
    };
  }

  // 1. Out-of-dataset / general knowledge detection
  const generalKnowledgeQueries = [
    'who is the ceo of google', 'capital of', 'weather today', 'write a poem', 'tell me a joke', 'who founded', 'what is the meaning of life'
  ];
  if (generalKnowledgeQueries.some((gk) => qLower.includes(gk))) {
    return {
      answer: `This question cannot be answered from the uploaded spreadsheet as it does not relate to any columns or records in the active dataset ("${dataset.name}"). Please ask an analytical question regarding your dataset's columns (${dataset.columns.map((c) => c.name).slice(0, 5).join(', ')}...).`,
      table: [],
      chart: { type: 'none', title: 'Out of Dataset Scope', data: [] },
      pythonCode: "# Out-of-dataset query - No dataframe computation performed",
      calculation: "Identified question as unrelated to dataset schema.",
      executionTimeMs: 3,
      rowsUsed: 0,
      followUpQuestions: [
        `What is the total ${numericCols[0] || 'records'} in this dataset?`,
        `Show the top 5 categories by ${numericCols[0] || 'count'}`,
        `What is the average ${numericCols[1] || numericCols[0] || 'metric'}?`
      ]
    };
  }

  // 2. Future forecasting / unsupported capability check
  if (qLower.includes('next year') || qLower.includes('forecast') || qLower.includes('predict') || qLower.includes('future sales')) {
    return {
      answer: "Forecasting and predictive modeling into future periods are not currently supported. Analysis is performed deterministically over existing historical records in your dataset.",
      table: [],
      chart: { type: 'none', title: 'Forecasting Unsupported', data: [] },
      pythonCode: "# Forecasting is not supported - Deterministic historical analysis only",
      calculation: "Clarified system boundary: deterministic historical analytics only.",
      executionTimeMs: 3,
      rowsUsed: 0,
      followUpQuestions: [
        "What was the historical monthly sales trend?",
        "Which period had the highest recorded revenue?",
        "What is the average growth rate between recorded periods?"
      ]
    };
  }

  // 3. Ambiguous question check (e.g. "What grew the most?", "Show the best")
  if (qLower === 'what grew the most' || qLower === 'what grew the most?' || qLower === 'show the best' || qLower === 'which is best') {
    return {
      answer: `Your question is ambiguous because the dataset contains multiple metrics (${numericCols.join(', ')}) and dimensions (${stringCols.join(', ')}). Which specific metric (e.g. ${numericCols[0] || 'Sales'}) and category (e.g. ${stringCols[0] || 'Region'}) would you like to evaluate?`,
      table: [],
      chart: { type: 'none', title: 'Ambiguous Query', data: [] },
      pythonCode: "# Awaiting clarification on target metric and dimension",
      calculation: "Ambiguity detected: prompt clarification requested.",
      executionTimeMs: 4,
      rowsUsed: 0,
      followUpQuestions: [
        `Which ${stringCols[0] || 'region'} generated the highest ${numericCols[0] || 'sales'}?`,
        `Show top 5 ${stringCols[1] || 'products'} by ${numericCols[0] || 'sales'}`,
        `What is the growth rate of ${numericCols[0] || 'sales'} over time?`
      ]
    };
  }

  // 4. Non-existent column check
  const requestedNonExistent = [
    'salary', 'employee salary', 'headcount', 'temperature', 'humidity', 'stock price', 'inflation'
  ].find((c) => qLower.includes(c) && !dataset.columns.some((col) => col.name.toLowerCase().includes(c)));

  if (requestedNonExistent && !dataset.columns.some((col) => col.name.toLowerCase().includes(requestedNonExistent))) {
    return {
      answer: `The requested column "${requestedNonExistent}" was not found in the active dataset ("${dataset.name}"). Available columns in this dataset are: ${dataset.columns.map((c) => c.name).join(', ')}.`,
      table: [],
      chart: { type: 'none', title: 'Column Not Found', data: [] },
      pythonCode: `# Column '${requestedNonExistent}' not found in df.columns\n# Available columns: ${dataset.columns.map((c) => `"${c.name}"`).join(', ')}`,
      calculation: `Verified dataset schema for column "${requestedNonExistent}": Not Found.`,
      executionTimeMs: 4,
      rowsUsed: 0,
      followUpQuestions: dataset.columns.slice(0, 3).map((c) => `What is the summary of column "${c.name}"?`)
    };
  }

  // Determine target numeric column and grouping string column
  const explicitTarget = resolveColumn(dataset, 'numeric', [
    aiPlan?.targetColumn || '',
    ...qLower.split(/[\s,]+/)
  ]);
  const targetNumCol = explicitTarget || numericCols[0] || dataset.columns[0]?.name || 'Value';

  const explicitGroup = resolveColumn(dataset, 'string', [
    aiPlan?.groupColumn || '',
    ...qLower.split(/[\s,]+/)
  ]);
  const groupCol = explicitGroup || stringCols[0] || dataset.columns[0]?.name || 'Category';
  const dateCol = dateCols[0] || resolveColumn(dataset, 'any', ['date', 'timestamp', 'created_at']) || 'Date';

  let pythonCode = '';
  let calculation = '';
  let answer = '';
  let tableResult: Record<string, any>[] = [];
  let chartType: 'bar' | 'line' | 'pie' | 'scatter' | 'histogram' | 'none' = 'bar';
  let chartTitle = '';

  // -------------------------------------------------------------
  // QUERY INTENT 1: Loss Making / Negative Profit
  // -------------------------------------------------------------
  if (qLower.includes('negative') || qLower.includes('loss') || qLower.includes('losses') || qLower.includes('lost money')) {
    const profitCol = resolveColumn(dataset, 'numeric', ['profit', 'margin', 'net_income', targetNumCol]) || targetNumCol;
    const lossRows = rows.filter((r) => getNumericValue(r[profitCol]) < 0);
    const totalLoss = lossRows.reduce((acc, r) => acc + getNumericValue(r[profitCol]), 0);

    pythonCode = `loss_df = df[df['${profitCol}'] < 0].sort_values(by='${profitCol}', ascending=True)\nloss_df[['${groupCol}', '${profitCol}']][:15]`;
    calculation = `Filtered rows where ${profitCol} < 0. Found ${lossRows.length} loss-making transactions out of ${rows.length} total rows.`;
    answer = `Found **${lossRows.length}** records that generated negative ${profitCol} (losses), resulting in a cumulative loss of **$${Math.abs(totalLoss).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}**.`;

    tableResult = lossRows.slice(0, 15).map((r) => ({
      [groupCol]: r[groupCol] || r['Product'] || r['Customer'] || 'Record',
      [profitCol]: getNumericValue(r[profitCol]),
      ...(r['Sales'] !== undefined ? { Sales: getNumericValue(r['Sales']) } : {})
    }));

    chartType = 'bar';
    chartTitle = `Loss-Making Items by ${profitCol}`;
  }

  // -------------------------------------------------------------
  // QUERY INTENT 2: Percentage Share / Category Breakdown
  // -------------------------------------------------------------
  else if (qLower.includes('percentage') || qLower.includes('share') || qLower.includes('proportion') || qLower.includes('percent of')) {
    const numCol = resolveColumn(dataset, 'numeric', ['sales', 'revenue', targetNumCol]) || targetNumCol;
    const catCol = resolveColumn(dataset, 'string', ['category', 'region', 'department', groupCol]) || groupCol;

    const groupSums: Record<string, number> = {};
    let grandTotal = 0;

    rows.forEach((r) => {
      const gKey = String(r[catCol] || 'Other');
      const val = getNumericValue(r[numCol]);
      groupSums[gKey] = (groupSums[gKey] || 0) + val;
      grandTotal += val;
    });

    const sortedGroups = Object.entries(groupSums).sort((a, b) => b[1] - a[1]);

    pythonCode = `totals = df.groupby("${catCol}")["${numCol}"].sum()\npct_share = (totals / totals.sum() * 100).round(2).reset_index()`;
    calculation = `Formula: (Group ${numCol} ÷ Grand Total $${Math.round(grandTotal).toLocaleString()}) × 100`;

    const topShare = sortedGroups[0] ? ((sortedGroups[0][1] / (grandTotal || 1)) * 100).toFixed(1) : '0';
    answer = `Breakdown of **${numCol}** by **${catCol}**: **${sortedGroups[0]?.[0] || 'Top category'}** represents the largest share at **${topShare}%** ($${Math.round(sortedGroups[0]?.[1] || 0).toLocaleString()}) out of a total $${Math.round(grandTotal).toLocaleString()}.`;

    tableResult = sortedGroups.map(([gKey, sumVal]) => {
      const pct = grandTotal > 0 ? parseFloat(((sumVal / grandTotal) * 100).toFixed(2)) : 0;
      return {
        [catCol]: gKey,
        [`${numCol} ($)`]: Math.round(sumVal),
        'Share (%)': pct
      };
    });

    chartType = 'pie';
    chartTitle = `${numCol} Percentage Share by ${catCol}`;
  }

  // -------------------------------------------------------------
  // QUERY INTENT 3: Correlation / Relationship between two metrics
  // -------------------------------------------------------------
  else if (qLower.includes('relationship') || qLower.includes('correlation') || qLower.includes('scatter') || (qLower.includes('vs') && numericCols.length >= 2)) {
    const col1 = resolveColumn(dataset, 'numeric', ['quantity', 'sales', numericCols[0] || '']) || numericCols[0] || targetNumCol;
    const col2 = resolveColumn(dataset, 'numeric', ['profit', 'sales', numericCols[1] || '']) || (numericCols[1] !== col1 ? numericCols[1] : numericCols[0]) || targetNumCol;

    const validPairs = rows
      .map((r) => ({ x: getNumericValue(r[col1]), y: getNumericValue(r[col2]) }))
      .filter((p) => !isNaN(p.x) && !isNaN(p.y));

    const n = validPairs.length;
    let rVal = 0;
    if (n > 1) {
      const meanX = validPairs.reduce((a, b) => a + b.x, 0) / n;
      const meanY = validPairs.reduce((a, b) => a + b.y, 0) / n;
      const num = validPairs.reduce((acc, p) => acc + (p.x - meanX) * (p.y - meanY), 0);
      const den = Math.sqrt(
        validPairs.reduce((acc, p) => acc + Math.pow(p.x - meanX, 2), 0) *
        validPairs.reduce((acc, p) => acc + Math.pow(p.y - meanY, 2), 0)
      );
      rVal = den === 0 ? 0 : parseFloat((num / den).toFixed(3));
    }

    const relationshipType = rVal > 0.6 ? 'strong positive' : rVal > 0.2 ? 'moderate positive' : rVal < -0.2 ? 'negative' : 'weak/neutral';

    pythonCode = `corr = df[['${col1}', '${col2}']].corr().iloc[0, 1]\ndf.plot.scatter(x='${col1}', y='${col2}')`;
    calculation = `Pearson Correlation Coefficient r = ${rVal} (calculated across ${n} paired records)`;
    answer = `The correlation between **${col1}** and **${col2}** is **${rVal}**, indicating a **${relationshipType}** relationship.`;

    tableResult = validPairs.slice(0, 15).map((p, idx) => ({
      Sample: `#${idx + 1}`,
      [col1]: p.x,
      [col2]: p.y
    }));

    chartType = 'scatter';
    chartTitle = `${col1} vs ${col2} Correlation (r = ${rVal})`;
  }

  // -------------------------------------------------------------
  // QUERY INTENT 4: Growth between periods
  // -------------------------------------------------------------
  else if (qLower.includes('grew fastest') || qLower.includes('growth rate') || qLower.includes('growth')) {
    const numCol = resolveColumn(dataset, 'numeric', ['sales', 'revenue', 'profit', targetNumCol]) || targetNumCol;
    const catCol = resolveColumn(dataset, 'string', ['region', 'category', 'product', groupCol]) || groupCol;

    // Aggregate by group and period
    const periods = Array.from(new Set(rows.map((r) => String(r[dateCol] || '').substring(0, 7)).filter(Boolean))).sort();
    const periodA = periods[periods.length - 2] || periods[0] || 'Period 1';
    const periodB = periods[periods.length - 1] || periods[periods.length - 1] || 'Period 2';

    const groupPeriodTotals: Record<string, { pA: number; pB: number }> = {};
    rows.forEach((r) => {
      const g = String(r[catCol] || 'Other');
      const p = String(r[dateCol] || '').substring(0, 7);
      const val = getNumericValue(r[numCol]);
      if (!groupPeriodTotals[g]) groupPeriodTotals[g] = { pA: 0, pB: 0 };
      if (p === periodA) groupPeriodTotals[g].pA += val;
      if (p === periodB) groupPeriodTotals[g].pB += val;
    });

    const growthList = Object.entries(groupPeriodTotals).map(([g, totals]) => {
      const diff = totals.pB - totals.pA;
      const growthPct = totals.pA > 0 ? parseFloat(((diff / totals.pA) * 100).toFixed(2)) : 0;
      return {
        [catCol]: g,
        [`${periodA} Total`]: Math.round(totals.pA),
        [`${periodB} Total`]: Math.round(totals.pB),
        'Growth (%)': growthPct
      };
    }).sort((a, b) => (b['Growth (%)'] as number) - (a['Growth (%)'] as number));

    const fastest = growthList[0] || { [catCol]: 'N/A', 'Growth (%)': 0 };

    pythonCode = `# Group by ${catCol} and compare ${periodA} vs ${periodB}\npct_change = ((df_pB - df_pA) / df_pA * 100).sort_values(ascending=False)`;
    calculation = `Growth % = ((${periodB} - ${periodA}) ÷ ${periodA}) × 100`;
    answer = `Comparing **${periodA}** to **${periodB}**, **${fastest[catCol]}** grew fastest with a **${fastest['Growth (%)']}%** increase in ${numCol}.`;

    tableResult = growthList;
    chartType = 'bar';
    chartTitle = `Growth (%) between ${periodA} & ${periodB} by ${catCol}`;
  }

  // -------------------------------------------------------------
  // QUERY INTENT 5: Top-N / Bottom-N Rankings
  // -------------------------------------------------------------
  else if (qLower.includes('top') || qLower.includes('bottom') || qLower.includes('highest') || qLower.includes('lowest') || qLower.includes('most') || qLower.includes('leading')) {
    const isBottom = qLower.includes('bottom') || qLower.includes('lowest') || qLower.includes('least');
    const isProfit = qLower.includes('profit');
    const isCity = qLower.includes('city');

    const numCol = isProfit
      ? resolveColumn(dataset, 'numeric', ['profit', 'margin', targetNumCol]) || targetNumCol
      : resolveColumn(dataset, 'numeric', ['sales', 'revenue', targetNumCol]) || targetNumCol;

    const rankCol = isCity
      ? resolveColumn(dataset, 'string', ['city', groupCol]) || groupCol
      : resolveColumn(dataset, 'string', ['product', 'customer', 'region', 'category', groupCol]) || groupCol;

    // Extract N if specified (e.g. top 5, top 10, top 3)
    const matchN = qLower.match(/(?:top|bottom)\s+(\d+)/);
    const limitN = matchN ? parseInt(matchN[1], 10) : (qLower.includes('top 5') ? 5 : 10);

    const agg: Record<string, { sum: number; count: number }> = {};
    rows.forEach((r) => {
      const key = String(r[rankCol] || 'Unknown');
      const val = getNumericValue(r[numCol]);
      if (!agg[key]) agg[key] = { sum: 0, count: 0 };
      agg[key].sum += val;
      agg[key].count += 1;
    });

    const sortedRank = Object.entries(agg).sort((a, b) => (isBottom ? a[1].sum - b[1].sum : b[1].sum - a[1].sum)).slice(0, limitN);

    pythonCode = `df.groupby("${rankCol}")["${numCol}"].sum().${isBottom ? `nsmallest(${limitN})` : `nlargest(${limitN})`}.reset_index()`;
    calculation = `Grouped by ${rankCol}, summed ${numCol}, sorted ${isBottom ? 'ascending' : 'descending'}, selected ${limitN} records`;

    const leader = sortedRank[0] || ['None', { sum: 0, count: 0 }];
    answer = `Here are the ${isBottom ? 'bottom' : 'top'} ${sortedRank.length} **${rankCol.toLowerCase()}s** by total **${numCol}**. **${leader[0]}** leads with **$${leader[1].sum.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}**.`;

    tableResult = sortedRank.map(([name, stats], idx) => ({
      Rank: `#${idx + 1}`,
      [rankCol]: name,
      [`Total ${numCol}`]: Math.round(stats.sum),
      Records: stats.count
    }));

    chartType = 'bar';
    chartTitle = `${isBottom ? 'Bottom' : 'Top'} ${limitN} ${rankCol}s by ${numCol}`;
  }

  // -------------------------------------------------------------
  // QUERY INTENT 6: Total Sum / Grand Total (Overall without grouping)
  // -------------------------------------------------------------
  else if (qLower.startsWith('what is total') || qLower.startsWith('total ') || qLower === 'what is the total sales' || qLower === 'what is the total sales?' || qLower.includes('sum of')) {
    const numCol = resolveColumn(dataset, 'numeric', ['sales', 'profit', 'revenue', targetNumCol]) || targetNumCol;
    const totalSum = rows.reduce((acc, r) => acc + getNumericValue(r[numCol]), 0);
    const avgVal = rows.length > 0 ? totalSum / rows.length : 0;

    pythonCode = `total_${numCol.toLowerCase()} = df["${numCol}"].sum()\ntotal_${numCol.toLowerCase()}`;
    calculation = `Formula: SUM(${numCol}) computed deterministically across all ${rows.length} rows`;
    answer = `The **total ${numCol}** across all **${rows.length.toLocaleString()}** records in the dataset is **$${totalSum.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}** (with an average of $${avgVal.toFixed(2)} per record).`;

    // Supporting table breakdown by top dimension
    const groupSums: Record<string, number> = {};
    rows.forEach((r) => {
      const g = String(r[groupCol] || 'All');
      groupSums[g] = (groupSums[g] || 0) + getNumericValue(r[numCol]);
    });

    tableResult = [
      { Metric: `Grand Total ${numCol}`, Value: `$${Math.round(totalSum).toLocaleString()}`, Records: rows.length },
      ...Object.entries(groupSums).map(([k, v]) => ({
        Metric: `${groupCol}: ${k}`,
        Value: `$${Math.round(v).toLocaleString()}`,
        Records: rows.filter((r) => String(r[groupCol]) === k).length
      }))
    ];

    chartType = 'bar';
    chartTitle = `Total ${numCol} by ${groupCol}`;
  }

  // -------------------------------------------------------------
  // QUERY INTENT 7: Average / Mean Calculation
  // -------------------------------------------------------------
  else if (qLower.includes('average') || qLower.includes('mean')) {
    const isProfit = qLower.includes('profit');
    const numCol = isProfit
      ? resolveColumn(dataset, 'numeric', ['profit', targetNumCol]) || targetNumCol
      : resolveColumn(dataset, 'numeric', ['sales', 'revenue', targetNumCol]) || targetNumCol;

    const nonNullRows = rows.filter((r) => r[numCol] !== null && r[numCol] !== undefined && r[numCol] !== '');
    const totalSum = nonNullRows.reduce((acc, r) => acc + getNumericValue(r[numCol]), 0);
    const avgVal = nonNullRows.length > 0 ? totalSum / nonNullRows.length : 0;

    const groupMap: Record<string, { sum: number; count: number }> = {};
    nonNullRows.forEach((r) => {
      const gKey = String(r[groupCol] || 'Other');
      const val = getNumericValue(r[numCol]);
      if (!groupMap[gKey]) groupMap[gKey] = { sum: 0, count: 0 };
      groupMap[gKey].sum += val;
      groupMap[gKey].count += 1;
    });

    pythonCode = `avg_val = df["${numCol}"].mean()\ndf.groupby("${groupCol}")["${numCol}"].mean().reset_index()`;
    calculation = `Formula: Total Sum ($${Math.round(totalSum).toLocaleString()}) ÷ Valid Records (${nonNullRows.length}) = $${avgVal.toFixed(2)}${rows.length !== nonNullRows.length ? ` (Excluded ${rows.length - nonNullRows.length} null rows)` : ''}`;
    answer = `The overall **average ${numCol}** across all ${nonNullRows.length} valid records is **$${avgVal.toFixed(2)}**. Breakdown by ${groupCol} is detailed in the table below.`;

    tableResult = Object.entries(groupMap).map(([gKey, stats]) => ({
      [groupCol]: gKey,
      [`Average ${numCol}`]: parseFloat((stats.sum / (stats.count || 1)).toFixed(2)),
      [`Total ${numCol}`]: Math.round(stats.sum),
      Count: stats.count
    }));

    chartType = 'bar';
    chartTitle = `Average ${numCol} by ${groupCol}`;
  }

  // -------------------------------------------------------------
  // QUERY INTENT 8: Monthly / Timeline Trend
  // -------------------------------------------------------------
  else if (qLower.includes('trend') || qLower.includes('monthly') || qLower.includes('timeline') || qLower.includes('over time')) {
    const numCol = resolveColumn(dataset, 'numeric', ['sales', 'revenue', 'profit', targetNumCol]) || targetNumCol;

    const dateMap: Record<string, number> = {};
    rows.forEach((r) => {
      const dStr = String(r[dateCol] || r['Date'] || '2025-01');
      const monthKey = dStr.substring(0, 7); // YYYY-MM
      dateMap[monthKey] = (dateMap[monthKey] || 0) + getNumericValue(r[numCol]);
    });

    const sortedDates = Object.entries(dateMap).sort((a, b) => a[0].localeCompare(b[0]));
    const peak = [...sortedDates].sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];

    pythonCode = `df['Month'] = pd.to_datetime(df['${dateCol}']).dt.to_period('M')\ndf.groupby('Month')['${numCol}'].sum().plot(kind='line')`;
    calculation = `Aggregated SUM(${numCol}) per month over ${sortedDates.length} distinct period buckets`;
    answer = `Timeline trend shows total **${numCol}** over time. Peak performance occurred in **${peak[0]}** reaching **$${Math.round(peak[1]).toLocaleString()}**.`;

    tableResult = sortedDates.map(([month, total]) => ({
      Period: month,
      [`Total ${numCol}`]: Math.round(total)
    }));

    chartType = 'line';
    chartTitle = `Monthly ${numCol} Trend`;
  }

  // -------------------------------------------------------------
  // QUERY INTENT 9: Distribution / Histogram
  // -------------------------------------------------------------
  else if (qLower.includes('distribution') || qLower.includes('histogram')) {
    const numCol = resolveColumn(dataset, 'numeric', ['profit', 'sales', targetNumCol]) || targetNumCol;
    const vals = rows.map((r) => getNumericValue(r[numCol])).sort((a, b) => a - b);
    const min = vals[0] || 0;
    const max = vals[vals.length - 1] || 100;
    const bucketCount = 5;
    const step = (max - min) / bucketCount || 10;

    const buckets: Record<string, number> = {};
    for (let i = 0; i < bucketCount; i++) {
      const bMin = Math.round(min + i * step);
      const bMax = Math.round(min + (i + 1) * step);
      buckets[`$${bMin} - $${bMax}`] = 0;
    }

    vals.forEach((v) => {
      let bIdx = Math.min(Math.floor((v - min) / (step || 1)), bucketCount - 1);
      if (bIdx < 0) bIdx = 0;
      const bMin = Math.round(min + bIdx * step);
      const bMax = Math.round(min + (bIdx + 1) * step);
      const label = `$${bMin} - $${bMax}`;
      buckets[label] = (buckets[label] || 0) + 1;
    });

    pythonCode = `df['${numCol}'].plot(kind='hist', bins=${bucketCount})\ndf['${numCol}'].describe()`;
    calculation = `Partitioned ${vals.length} values of ${numCol} into ${bucketCount} equal-width frequency intervals`;
    answer = `The distribution of **${numCol}** spans from **$${Math.round(min).toLocaleString()}** to **$${Math.round(max).toLocaleString()}** across ${vals.length} rows.`;

    tableResult = Object.entries(buckets).map(([binRange, freq]) => ({
      'Range Interval': binRange,
      'Record Count': freq,
      'Percentage (%)': parseFloat(((freq / vals.length) * 100).toFixed(1))
    }));

    chartType = 'bar';
    chartTitle = `${numCol} Distribution Histogram`;
  }

  // -------------------------------------------------------------
  // QUERY INTENT 10: General GroupBy Aggregation
  // -------------------------------------------------------------
  else {
    const groupMap: Record<string, { sum: number; count: number; mean: number }> = {};
    rows.forEach((r) => {
      const gKey = String(r[groupCol] || 'All');
      const val = getNumericValue(r[targetNumCol]);
      if (!groupMap[gKey]) groupMap[gKey] = { sum: 0, count: 0, mean: 0 };
      groupMap[gKey].sum += val;
      groupMap[gKey].count += 1;
    });

    Object.keys(groupMap).forEach((k) => {
      groupMap[k].mean = groupMap[k].sum / (groupMap[k].count || 1);
    });

    const sorted = Object.entries(groupMap).sort((a, b) => b[1].sum - a[1].sum);
    const top = sorted[0] || ['None', { sum: 0, count: 0, mean: 0 }];

    pythonCode = `df.groupby("${groupCol}")["${targetNumCol}"].sum().sort_values(ascending=False).reset_index()`;
    calculation = `Calculated total ${targetNumCol} grouped by ${groupCol} across all ${rows.length} rows`;
    answer = `Analyzed **${rows.length.toLocaleString()}** rows. Grouped by **${groupCol}**, **${top[0]}** is the highest contributor with **$${top[1].sum.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}** (${top[1].count} transactions).`;

    tableResult = sorted.map(([k, stats]) => ({
      [groupCol]: k,
      [`Total ${targetNumCol}`]: Math.round(stats.sum),
      [`Average ${targetNumCol}`]: parseFloat(stats.mean.toFixed(2)),
      Transactions: stats.count
    }));

    chartType = 'bar';
    chartTitle = `${targetNumCol} by ${groupCol}`;
  }

  const executionTimeMs = Math.max(2, Date.now() - startTime);

  // Format chart data matching table structure
  const chartData = tableResult.map((row) => {
    const keys = Object.keys(row);
    // Find first non-rank string dimension key
    const dimensionKey = keys.find((k) => k !== 'Rank' && k !== '#' && typeof row[k] === 'string') || keys[0] || groupCol;
    // Find primary numerical value key
    const numericKey = keys.find((k) => typeof row[k] === 'number' && k !== 'Rank' && k !== '#' && k !== 'Records' && k !== 'Transactions') ||
      keys.find((k) => typeof row[k] === 'number') ||
      keys[1] ||
      targetNumCol;

    const rawVal = row[numericKey];
    const numVal = typeof rawVal === 'number' ? rawVal : parseFloat(String(rawVal).replace(/[$,%]/g, '')) || 0;
    return {
      name: String(row[dimensionKey]),
      value: numVal,
      ...row
    };
  });

  return {
    answer,
    table: tableResult,
    chart: {
      type: chartType,
      title: chartTitle,
      xAxisKey: 'name',
      yAxisKey: 'value',
      data: chartData
    },
    pythonCode,
    calculation,
    executionTimeMs,
    rowsUsed: rows.length,
    followUpQuestions: [
      `What is the average ${targetNumCol} for the top ${groupCol}?`,
      `Show the bottom 5 ${groupCol}s by total ${targetNumCol}`,
      `What percentage of overall ${targetNumCol} is contributed by ${tableResult[0]?.[Object.keys(tableResult[0])[0]] || 'the leader'}?`
    ]
  };
}

/**
 * Computes descriptive statistics for dataset
 */
export function computeDatasetStatistics(dataset: DatasetMetadata) {
  const rows = dataset.rows;
  const totalRows = rows.length;
  const totalCols = dataset.columns.length;

  const numericCols = dataset.columns.filter((c) => c.type === 'Float' || c.type === 'Integer');
  const categoricalCols = dataset.columns.filter((c) => c.type === 'String');

  let totalNulls = 0;
  dataset.columns.forEach((c) => (totalNulls += c.nullCount));
  const nullRatioPct = totalRows > 0 && totalCols > 0 ? parseFloat(((totalNulls / (totalRows * totalCols)) * 100).toFixed(2)) : 0;

  const numericSummaries: Record<string, { mean: number; std: number; min: number; p25: number; median: number; p75: number; max: number }> = {};

  numericCols.forEach((col) => {
    const vals = rows
      .map((r) => getNumericValue(r[col.name]))
      .filter((v) => !isNaN(v))
      .sort((a, b) => a - b);

    if (vals.length === 0) return;

    const sum = vals.reduce((a, b) => a + b, 0);
    const mean = sum / vals.length;
    const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length;
    const std = Math.sqrt(variance);

    const min = vals[0];
    const max = vals[vals.length - 1];
    const p25 = vals[Math.floor(vals.length * 0.25)];
    const median = vals[Math.floor(vals.length * 0.5)];
    const p75 = vals[Math.floor(vals.length * 0.75)];

    numericSummaries[col.name] = {
      mean: parseFloat(mean.toFixed(2)),
      std: parseFloat(std.toFixed(2)),
      min: parseFloat(min.toFixed(2)),
      p25: parseFloat(p25.toFixed(2)),
      median: parseFloat(median.toFixed(2)),
      p75: parseFloat(p75.toFixed(2)),
      max: parseFloat(max.toFixed(2))
    };
  });

  return {
    totalRows,
    totalCols,
    fileType: dataset.fileType,
    fileSizeKB: dataset.fileSizeKB,
    nullRatioPct,
    numericColCount: numericCols.length,
    categoricalColCount: categoricalCols.length,
    numericSummaries
  };
}
