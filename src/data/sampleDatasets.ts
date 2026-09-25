export interface DatasetColumn {
  name: string;
  type: 'String' | 'Float' | 'Integer' | 'Date';
  nullCount: number;
  sampleValues: (string | number)[];
}

export interface DatasetMetadata {
  id: string;
  name: string;
  description: string;
  rowCount: number;
  columnCount: number;
  fileType: 'CSV' | 'XLSX' | 'XLS';
  fileSizeKB: number;
  columns: DatasetColumn[];
  rows: Record<string, any>[];
}

export const SAMPLE_DATASETS: Record<string, DatasetMetadata> = {
  sales_data: {
    id: 'sales_data',
    name: 'Sales_Report.xlsx',
    description: 'Enterprise Global Sales & Revenue Dataset with 1,000+ transaction records',
    rowCount: 1000,
    columnCount: 9,
    fileType: 'XLSX',
    fileSizeKB: 142,
    columns: [
      { name: 'Date', type: 'Date', nullCount: 0, sampleValues: ['2025-01-15', '2025-01-16', '2025-01-17'] },
      { name: 'Region', type: 'String', nullCount: 0, sampleValues: ['North America', 'Europe', 'Asia Pacific', 'Latin America'] },
      { name: 'Product', type: 'String', nullCount: 0, sampleValues: ['Cloud Analytics Suite', 'Enterprise AI Engine', 'Data Vault Pro'] },
      { name: 'Category', type: 'String', nullCount: 0, sampleValues: ['Software', 'Hardware', 'Services'] },
      { name: 'Sales', type: 'Float', nullCount: 0, sampleValues: [12500, 8400, 24500, 3100] },
      { name: 'Profit', type: 'Float', nullCount: 0, sampleValues: [3750, 2100, 8580, -450] },
      { name: 'Quantity', type: 'Integer', nullCount: 0, sampleValues: [12, 5, 20, 2] },
      { name: 'Customer', type: 'String', nullCount: 0, sampleValues: ['Acme Corp', 'GlobalTech', 'Apex Solutions', 'Nexus Systems'] },
      { name: 'City', type: 'String', nullCount: 0, sampleValues: ['New York', 'London', 'Tokyo', 'Berlin'] }
    ],
    rows: generateSalesRows()
  },
  hr_analytics: {
    id: 'hr_analytics',
    name: 'HR_Employee_Analytics.csv',
    description: 'Employee attrition, compensation, performance ratings, and tenure metrics',
    rowCount: 500,
    columnCount: 8,
    fileType: 'CSV',
    fileSizeKB: 68,
    columns: [
      { name: 'Employee_ID', type: 'String', nullCount: 0, sampleValues: ['EMP-1001', 'EMP-1002', 'EMP-1003'] },
      { name: 'Department', type: 'String', nullCount: 0, sampleValues: ['Engineering', 'Sales', 'Marketing', 'Product'] },
      { name: 'Salary', type: 'Float', nullCount: 0, sampleValues: [95000, 120000, 88000, 145000] },
      { name: 'Tenure_Years', type: 'Float', nullCount: 0, sampleValues: [2.5, 4.1, 1.2, 6.0] },
      { name: 'Performance_Score', type: 'Integer', nullCount: 0, sampleValues: [4, 5, 3, 4] },
      { name: 'Satisfaction_Level', type: 'Float', nullCount: 0, sampleValues: [0.82, 0.95, 0.64, 0.88] },
      { name: 'Promoted_Last_Year', type: 'String', nullCount: 0, sampleValues: ['Yes', 'No', 'No', 'Yes'] },
      { name: 'Remote_Ratio', type: 'Float', nullCount: 0, sampleValues: [1.0, 0.5, 0.0, 1.0] }
    ],
    rows: generateHrRows()
  },
  marketing_campaigns: {
    id: 'marketing_campaigns',
    name: 'Marketing_Campaign_ROI.csv',
    description: 'Omnichannel advertising spend, impressions, clicks, conversions, and ROI performance',
    rowCount: 350,
    columnCount: 8,
    fileType: 'CSV',
    fileSizeKB: 45,
    columns: [
      { name: 'Campaign', type: 'String', nullCount: 0, sampleValues: ['Q1 Growth Push', 'AI Launch Promo', 'Retargeting Surge'] },
      { name: 'Channel', type: 'String', nullCount: 0, sampleValues: ['Google Ads', 'LinkedIn', 'Meta', 'Organic Search'] },
      { name: 'Ad_Spend', type: 'Float', nullCount: 0, sampleValues: [15000, 28000, 9500, 42000] },
      { name: 'Impressions', type: 'Integer', nullCount: 0, sampleValues: [450000, 890000, 230000] },
      { name: 'Clicks', type: 'Integer', nullCount: 0, sampleValues: [12500, 24100, 6800] },
      { name: 'Conversions', type: 'Integer', nullCount: 0, sampleValues: [620, 1150, 290] },
      { name: 'Revenue', type: 'Float', nullCount: 0, sampleValues: [45000, 98000, 22000] },
      { name: 'ROI_Percentage', type: 'Float', nullCount: 0, sampleValues: [200.0, 250.0, 131.5] }
    ],
    rows: generateMarketingRows()
  }
};

function generateSalesRows(): Record<string, any>[] {
  const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
  const cities: Record<string, string[]> = {
    'North America': ['New York', 'San Francisco', 'Chicago', 'Toronto'],
    'Europe': ['London', 'Berlin', 'Paris', 'Amsterdam'],
    'Asia Pacific': ['Tokyo', 'Singapore', 'Sydney', 'Seoul'],
    'Latin America': ['Sao Paulo', 'Mexico City', 'Buenos Aires', 'Bogota']
  };
  const products = ['Cloud Analytics Suite', 'Enterprise AI Engine', 'Data Vault Pro', 'CyberGuard AI', 'Workflow Automation'];
  const categories: Record<string, string> = {
    'Cloud Analytics Suite': 'Software',
    'Enterprise AI Engine': 'Software',
    'Data Vault Pro': 'Hardware',
    'CyberGuard AI': 'Software',
    'Workflow Automation': 'Services'
  };
  const basePrices: Record<string, number> = {
    'Cloud Analytics Suite': 12000,
    'Enterprise AI Engine': 28000,
    'Data Vault Pro': 18000,
    'CyberGuard AI': 15000,
    'Workflow Automation': 8000
  };
  const customers = [
    'Acme Corp', 'GlobalTech', 'Apex Solutions', 'Nexus Systems', 'Vanguard Inc',
    'Starlight Labs', 'Horizon Media', 'Quantum Capital', 'Pulse Health', 'Beacon Dynamics'
  ];

  const rows: Record<string, any>[] = [];
  const startDate = new Date('2025-01-01');

  for (let i = 0; i < 1000; i++) {
    const region = regions[i % regions.length];
    const regionCities = cities[region];
    const city = regionCities[i % regionCities.length];
    const product = products[(i * 3 + i % 5) % products.length];
    const category = categories[product];
    const customer = customers[(i * 7) % customers.length];
    const quantity = (i % 15) + 1;
    const basePrice = basePrices[product];
    const sales = Math.round((basePrice * (0.85 + (i % 30) * 0.01) * quantity) / 10) * 10;
    
    // Profit multiplier: Europe & Asia Pacific have high margin, Latin America has occasional losses
    let profitMargin = 0.28 + ((i % 11) * 0.02);
    if (i % 23 === 0) profitMargin = -0.08; // Loss making orders for Q&A testing
    const profit = Math.round(sales * profitMargin);

    const date = new Date(startDate.getTime() + (i * 8 * 3600 * 1000));
    const dateStr = date.toISOString().split('T')[0];

    rows.push({
      Date: dateStr,
      Region: region,
      Product: product,
      Category: category,
      Sales: sales,
      Profit: profit,
      Quantity: quantity,
      Customer: customer,
      City: city
    });
  }

  return rows;
}

function generateHrRows(): Record<string, any>[] {
  const depts = ['Engineering', 'Sales', 'Marketing', 'Product', 'Customer Success', 'HR', 'Finance'];
  const rows: Record<string, any>[] = [];

  for (let i = 0; i < 500; i++) {
    const dept = depts[i % depts.length];
    const tenure = parseFloat((0.5 + (i % 12) * 0.8).toFixed(1));
    const baseSalary = 60000 + (dept === 'Engineering' || dept === 'Product' ? 35000 : 15000);
    const salary = Math.round(baseSalary + tenure * 4500 + (i % 20) * 1200);
    const perf = (i % 3) + 3; // 3, 4, or 5
    const sat = parseFloat((0.55 + (i % 45) * 0.01).toFixed(2));
    const promoted = (tenure > 3 && i % 4 === 0) ? 'Yes' : 'No';
    const remote = i % 2 === 0 ? 1.0 : (i % 3 === 0 ? 0.5 : 0.0);

    rows.push({
      Employee_ID: `EMP-${1000 + i}`,
      Department: dept,
      Salary: salary,
      Tenure_Years: tenure,
      Performance_Score: perf,
      Satisfaction_Level: sat,
      Promoted_Last_Year: promoted,
      Remote_Ratio: remote
    });
  }

  return rows;
}

function generateMarketingRows(): Record<string, any>[] {
  const channels = ['Google Ads', 'LinkedIn', 'Meta', 'Organic Search', 'YouTube Ads'];
  const campaigns = ['Q1 Growth Push', 'AI Launch Promo', 'Retargeting Surge', 'Enterprise LeadGen', 'Brand Awareness'];
  const rows: Record<string, any>[] = [];

  for (let i = 0; i < 350; i++) {
    const channel = channels[i % channels.length];
    const campaign = `${campaigns[i % campaigns.length]} #${Math.floor(i / 5) + 1}`;
    const spend = Math.round(5000 + (i % 40) * 1200);
    const cpm = channel === 'LinkedIn' ? 45 : (channel === 'Google Ads' ? 25 : 15);
    const impressions = Math.round((spend / cpm) * 1000);
    const ctr = channel === 'Organic Search' ? 0.045 : 0.022;
    const clicks = Math.round(impressions * ctr);
    const convRate = 0.05 + (i % 10) * 0.005;
    const conversions = Math.round(clicks * convRate);
    const valPerConv = 120 + (i % 15) * 20;
    const revenue = Math.round(conversions * valPerConv);
    const roi = parseFloat((((revenue - spend) / spend) * 100).toFixed(1));

    rows.push({
      Campaign: campaign,
      Channel: channel,
      Ad_Spend: spend,
      Impressions: impressions,
      Clicks: clicks,
      Conversions: conversions,
      Revenue: revenue,
      ROI_Percentage: roi
    });
  }

  return rows;
}
