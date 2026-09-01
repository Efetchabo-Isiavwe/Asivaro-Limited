import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

// Configure body parsers for JSON and file data
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Lazy Google Gen AI initialization
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in environment. Mocking fallback or using standard key.');
    }
    aiClient = new GoogleGenAI({ apiKey: apiKey || '' });
  }
  return aiClient;
}

// -------------------------------------------------------------
// Server Health
// -------------------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    name: 'ASIVAROOPS AI Engine',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// 1. ASK ASIVARO - Conversational AI Business Analyst
// -------------------------------------------------------------
app.post('/api/ai/ask', async (req: Request, res: Response) => {
  try {
    const { question, agentRole = 'analyst', contextData, conversationHistory = [] } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const ai = getAI();
    const systemPrompt = `You are ASIVAROOPS AI, an elite AI-powered Business Operating System and Chief Operating Officer / CFO Advisor specialized in African Small and Medium Enterprises (SMEs), particularly Nigerian and pan-African markets.
Tagline: "Ask your business. Know what to do next."

You are acting in the role of: ${agentRole.toUpperCase()} AGENT.
- ANALYST AGENT: Deep data analysis, correlation, growth trends, anomaly detection, sales mix.
- FINANCE AGENT: Cash flow, working capital, overdue receivables, margin protection, OpEx reduction, tax/VAT.
- OPERATIONS AGENT: Logistics, inventory replenishment, warehouse efficiency, diesel/power management, supplier terms.
- EXECUTIVE AGENT: Strategic decision-making, executive summaries, capital allocation, risk governance.
- ACTION AGENT: Concrete tactical task generation, standard operating procedures, accountability.

Organization Context:
- Currency: ${contextData?.currency || 'NGN'} (${contextData?.currencySymbol || '₦'})
- Business Name: ${contextData?.organizationName || 'Acme Distribution Nigeria'}
- Industry: ${contextData?.industry || 'FMCG & Wholesale Distribution'}
- Location: ${contextData?.location || 'Lagos, Nigeria'}

Current Business State Snapshot:
- Total Customers: ${contextData?.customersCount || 0}
- Total Invoices: ${contextData?.invoicesCount || 0}
- Overdue Receivables: ${contextData?.currencySymbol || '₦'}${(contextData?.overdueReceivables || 0).toLocaleString()}
- Total Expenses: ${contextData?.currencySymbol || '₦'}${(contextData?.totalExpenses || 0).toLocaleString()}
- Diesel / Power Spend: ${contextData?.currencySymbol || '₦'}${(contextData?.dieselSpend || 0).toLocaleString()}
- Cash Flow Runway: ${contextData?.runwayMonths || 3.8} months
- Key Customer Details: ${JSON.stringify(contextData?.customersSummary || [])}
- Key Invoices Details: ${JSON.stringify(contextData?.invoicesSummary || [])}
- Recent Expenses Details: ${JSON.stringify(contextData?.expensesSummary || [])}
- Low Stock Products: ${JSON.stringify(contextData?.lowStockProducts || [])}

Instruction:
1. Provide a direct, authoritative, commercially astute, and actionable answer.
2. Ground numbers directly in the business context provided.
3. Be culturally and commercially contextualized for African SME realities (e.g. diesel power costs, port logistics, payment habits, bank transfer verification, credit discipline, early payment discounts).
4. At the end of your response, if there are actionable next steps, output a JSON block wrapped in \`\`\`json containing an array of actionable recommendations that can be converted into tasks:
{
  "actionableInsights": [
    {
      "title": "Short imperative task title",
      "priority": "URGENT" | "HIGH" | "MEDIUM" | "LOW",
      "action": "Concrete operational description of what team members should do",
      "targetAssignee": "Suggested role or department",
      "suggestedDueDate": "YYYY-MM-DD"
    }
  ]
}
`;

    const prompt = `User Query: ${question}

Recent History:
${conversationHistory.slice(-4).map((m: any) => `${m.role}: ${m.content}`).join('\n')}

Provide your comprehensive analysis and actionable recommendations now:`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.3,
      },
    });

    const fullText = response.text || '';
    
    // Parse actionableInsights if present in markdown json
    let actionableInsights: any[] = [];
    try {
      const jsonMatch = fullText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        const parsed = JSON.parse(jsonMatch[1]);
        if (Array.isArray(parsed.actionableInsights)) {
          actionableInsights = parsed.actionableInsights;
        }
      }
    } catch (e) {
      console.warn('Failed to parse embedded JSON actionableInsights', e);
    }

    // Clean text by stripping json codeblock if needed or keeping formatting
    return res.json({
      answer: fullText,
      agentRole,
      actionableInsights,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Ask Asivaro API error:', error);
    return res.status(500).json({
      error: 'Failed to generate AI analysis',
      details: error?.message || String(error),
    });
  }
});

// -------------------------------------------------------------
// 2. REAL-TIME AI BUSINESS AUDIT & INSIGHTS GENERATION
// -------------------------------------------------------------
app.post('/api/ai/insights/generate', async (req: Request, res: Response) => {
  try {
    const { organizationName, currencySymbol = '₦', data } = req.body;

    const ai = getAI();
    const prompt = `You are the Lead Strategic AI Engine for ASIVAROOPS AI.
Scan and audit the following real-time SME business records for "${organizationName || 'Acme Distribution Nigeria'}":

Business Data Payload:
${JSON.stringify(data, null, 2)}

Generate structured business intelligence separated into EXACTLY 3 sections:
1. URGENT: Critical issues requiring immediate 24-48 hour intervention (e.g., severe overdue receivables, cash flow risks, stockouts).
2. RISKS: Emerging vulnerabilities, inflationary cost spikes (e.g. diesel/power surge), slow paying customers, supplier dependencies, tax/compliance.
3. OPPORTUNITIES: High-margin product growth, early settlement payment terms, discount bundling, supplier renegotiation, regional market expansions.

Output format MUST be strictly valid JSON matching this exact schema:
{
  "insights": [
    {
      "title": "Clear headline with monetary impact",
      "category": "Financial" | "Operational" | "Customer Risk" | "Growth Opportunity" | "Compliance & Tax" | "Inventory",
      "severity": "CRITICAL" | "WARNING" | "OPPORTUNITY" | "INFO",
      "section": "URGENT" | "RISKS" | "OPPORTUNITIES",
      "explanation": "2-sentence executive summary of the issue",
      "evidence": "Concrete proof citing specific invoices, amounts, customers or expense items",
      "impact": "Financial and operational consequence if unaddressed",
      "recommendation": "Direct strategic decision",
      "suggestedActions": [
        "Action step 1",
        "Action step 2"
      ]
    }
  ]
}
Return between 4 to 6 high-value, highly specific insights.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{"insights": []}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Insights generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate AI insights',
      details: error?.message || String(error),
    });
  }
});

// -------------------------------------------------------------
// 3. DOCUMENT INTELLIGENCE AGENT - Extract & Analyze
// -------------------------------------------------------------
app.post('/api/ai/document/extract', async (req: Request, res: Response) => {
  try {
    const { fileName, fileType, textContent, base64Data, mimeType } = req.body;

    if (!fileName) {
      return res.status(400).json({ error: 'File name is required' });
    }

    const ai = getAI();
    let contents: any = [];

    const promptText = `You are the Document Intelligence AI Agent for ASIVAROOPS AI.
Analyze this business document ("${fileName}") thoroughly.
Extract all structured commercial, operational, and financial data with high precision.

Extract:
1. documentType: Exactly one of "INVOICE", "RECEIPT", "CONTRACT", "BANK_STATEMENT", "WAYBILL", "TAX_DOCUMENT", "OTHER"
2. date: Extracted or inferred document date (YYYY-MM-DD)
3. vendor: Supplier or issuer company name
4. customer: Recipient company or buyer name
5. amount: Total monetary figure (number only)
6. currency: "NGN", "USD", "EUR", "GBP", etc.
7. invoiceNumber: Reference or document code
8. lineItems: Array of { description, quantity, unitPrice, amount }
9. dueDate: Payment due date if applicable (YYYY-MM-DD)
10. importantClauses: Array of key legal, delivery, or commercial terms
11. risks: Array of financial, logistical, demurrage, price-shift, or penalty risks identified
12. taxDetails: VAT/WHT rates or breakdown if present
13. summary: Concise 2-sentence executive summary

Return ONLY valid JSON matching this schema:
{
  "documentType": "INVOICE",
  "date": "2026-08-10",
  "vendor": "Company Name",
  "customer": "Customer Name",
  "amount": 1500000,
  "currency": "NGN",
  "invoiceNumber": "INV-12345",
  "dueDate": "2026-09-10",
  "lineItems": [
    { "description": "Item name", "quantity": 10, "unitPrice": 150000, "amount": 1500000 }
  ],
  "importantClauses": ["Clause 1", "Clause 2"],
  "risks": ["Risk 1", "Risk 2"],
  "taxDetails": "7.5% VAT included",
  "summary": "Document overview..."
}`;

    if (base64Data && mimeType && (mimeType.startsWith('image/') || mimeType === 'application/pdf')) {
      contents = [
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data.replace(/^data:.*?;base64,/, ''),
          },
        },
        { text: promptText },
      ];
    } else {
      contents = [
        {
          text: `${promptText}\n\nDocument Content / Raw Text:\n${textContent || fileName}`,
        },
      ];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      success: true,
      extractedData: parsed,
      fileName,
    });
  } catch (error: any) {
    console.error('Document extraction error:', error);
    return res.status(500).json({
      error: 'Failed to process document with AI',
      details: error?.message || String(error),
    });
  }
});

// -------------------------------------------------------------
// 4. EXECUTIVE REPORT GENERATOR
// -------------------------------------------------------------
app.post('/api/ai/reports/generate', async (req: Request, res: Response) => {
  try {
    const { reportType, organizationName, currencySymbol = '₦', data } = req.body;

    const ai = getAI();
    const prompt = `You are the Executive Strategy AI Engine for ASIVAROOPS AI.
Generate a comprehensive, boardroom-ready "${reportType}" for "${organizationName || 'Acme Distribution Nigeria'}".

Live Business Data:
${JSON.stringify(data, null, 2)}

Requirements:
- Executive Summary: Clear, sharp synthesis of operational health, cash flow, revenue trajectory, and immediate challenges.
- Key Metrics: Calculate or verify revenue, expenses, net profit, margin %, overdue receivables, cash balance, and estimated runway in months.
- Sections: Generate 3 to 4 detailed thematic sections (e.g. Commercial & Sales Performance, Cost Control & OpEx Pressures, Liquidity & Working Capital, Operational & Logistics Pipeline).
- Strategic Priorities: 4 to 5 numbered high-priority executive directives for the next cycle.
- Risks & Mitigations: 3 key risks with severity (HIGH/MEDIUM/LOW) and concrete tactical mitigation plans.

Return ONLY valid JSON matching this schema:
{
  "title": "Title of the Report",
  "period": "E.g., Week ending Aug 31, 2026 or August 2026",
  "executiveSummary": "Paragraph overview...",
  "keyMetrics": {
    "revenue": 33100000,
    "expenses": 25100000,
    "netProfit": 8000000,
    "netMarginPercentage": 24.1,
    "overdueReceivables": 10050000,
    "runwayMonths": 3.8,
    "cashBalance": 19450000
  },
  "sections": [
    {
      "heading": "Section Title",
      "content": "Detailed analysis paragraph...",
      "bulletPoints": ["Point 1", "Point 2", "Point 3"]
    }
  ],
  "strategicPriorities": [
    "Priority 1",
    "Priority 2",
    "Priority 3",
    "Priority 4"
  ],
  "risksAndMitigations": [
    {
      "risk": "Risk description",
      "severity": "HIGH",
      "mitigation": "Mitigation strategy"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Report generation error:', error);
    return res.status(500).json({
      error: 'Failed to generate executive report',
      details: error?.message || String(error),
    });
  }
});

// -------------------------------------------------------------
// 5. AI PAYMENT REMINDER GENERATOR (Nigerian/African SME context)
// -------------------------------------------------------------
app.post('/api/ai/payment-reminder', async (req: Request, res: Response) => {
  try {
    const { customerName, contactPerson, invoiceNumber, amountDue, daysOverdue, currencySymbol = '₦', tone = 'firm' } = req.body;

    const ai = getAI();
    const prompt = `Write a professional, culturally astute Nigerian/African SME debt collection message and WhatsApp notice for:
- Company: ${customerName}
- Contact Person: ${contactPerson}
- Invoice Number: ${invoiceNumber}
- Amount Due: ${currencySymbol}${Number(amountDue).toLocaleString()}
- Days Overdue: ${daysOverdue} days
- Tone: ${tone} (Options: 'polite_reminder', 'firm_overdue', 'executive_escalation', 'legal_demand')

Generate two outputs in JSON:
1. "formalEmail": Formatted formal business email with subject line, greeting, bank settlement instructions, and deadline.
2. "whatsappMessage": Crisp, polite yet direct WhatsApp message suitable for quick messaging.
3. "earlySettlementOffer": A recommended 1.5% - 2% early-settlement incentive if paid within 48 hours.

Return strictly valid JSON:
{
  "emailSubject": "...",
  "formalEmail": "...",
  "whatsappMessage": "...",
  "earlySettlementOffer": "..."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Payment reminder generator error:', error);
    return res.status(500).json({
      error: 'Failed to generate payment reminder',
      details: error?.message || String(error),
    });
  }
});

// -------------------------------------------------------------
// Vite Middleware / Static Serving
// -------------------------------------------------------------
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ASIVAROOPS AI Server active on http://0.0.0.0:${PORT}`);
  });
}

start();
