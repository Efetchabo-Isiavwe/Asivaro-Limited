import React, { useState } from 'react';
import {
  BarChart3,
  FileText,
  Sparkles,
  Printer,
  Copy,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Download,
  Building2,
  ShieldCheck
} from 'lucide-react';
import { useBusinessData } from '../../context/BusinessDataContext';
import { useAuth } from '../../context/AuthContext';
import { Currency } from '../common/Currency';

export const ReportsView: React.FC = () => {
  const { currentOrg } = useAuth();
  const {
    metrics,
    customers,
    invoices,
    expenses,
    insights,
    tasks
  } = useBusinessData();

  const [reportType, setReportType] = useState('weekly_executive');
  const [period, setPeriod] = useState('August 2026');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const symbol = currentOrg?.currencySymbol || '₦';

  const reportTypes = [
    { id: 'weekly_executive', label: 'Weekly Executive Briefing', desc: 'Weekly snapshot of cash flow, critical debtor risks, and operational priorities.' },
    { id: 'monthly_financial', label: 'Monthly Financial & Board Review', desc: 'Comprehensive monthly P&L synthesis, margin breakdown, and OpEx trends.' },
    { id: 'debtor_recovery', label: 'Debtor Recovery & Working Capital Audit', desc: 'Detailed aging ledger review with tactical recovery strategies.' },
    { id: 'expense_anomaly', label: 'Expense & Fuel Overheads Audit', desc: 'Deep dive into diesel inflation, logistics, and cost containment.' },
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    setGeneratedReport(null);

    try {
      const res = await fetch('/api/ai/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          period,
          businessData: {
            orgName: currentOrg?.name,
            currencySymbol: symbol,
            metrics,
            customersSummary: customers.map((c) => ({ name: c.name, balance: c.outstandingBalance, health: c.paymentHealth })),
            invoicesSummary: invoices.slice(0, 8),
            expensesSummary: expenses.slice(0, 8),
            insightsSummary: insights.map((i) => ({ title: i.title, section: i.section, rec: i.recommendation })),
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to generate report');
      const data = await res.json();
      setGeneratedReport(data.report);
    } catch (err) {
      console.error('Report error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = () => {
    if (!generatedReport) return;
    const text = `
${generatedReport.title || 'Executive Report'}
Generated for ${currentOrg?.name} - ${period}

EXECUTIVE SUMMARY:
${generatedReport.executiveSummary}

FINANCIAL HIGHLIGHTS:
- Revenue: ${symbol}${generatedReport.financialHighlights?.revenue?.toLocaleString() || metrics.totalRevenue.toLocaleString()}
- Operating Expenses: ${symbol}${generatedReport.financialHighlights?.expenses?.toLocaleString() || metrics.totalExpenses.toLocaleString()}
- Net Profit: ${symbol}${generatedReport.financialHighlights?.netProfit?.toLocaleString() || metrics.netProfit.toLocaleString()}
- Cash Flow Runway: ${generatedReport.financialHighlights?.runwayMonths || metrics.runwayMonths} months

KEY RISKS:
${(generatedReport.keyRisks || []).map((r: string) => `- ${r}`).join('\n')}

OPPORTUNITIES:
${(generatedReport.opportunities || []).map((o: string) => `- ${o}`).join('\n')}

TACTICAL ACTION PLAN:
${(generatedReport.actionPlan || []).map((a: any) => `- [${a.priority}] ${a.task} (Owner: ${a.owner}, Due: ${a.timeline})`).join('\n')}
    `;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Configuration & Trigger Card */}
      <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-2.5 pb-4 border-b border-neutral-100">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-neutral-900">
              Executive AI Report Generator
            </h3>
            <p className="text-xs text-neutral-500">
              Synthesizes real-time ledger data into formatted boardroom presentations.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="md:col-span-2">
            <label className="font-bold text-xs text-neutral-700 block mb-1.5">
              Select Report Template
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {reportTypes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setReportType(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    reportType === t.id
                      ? 'border-emerald-600 bg-emerald-50/50 text-neutral-900 ring-2 ring-emerald-500/20'
                      : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                  }`}
                >
                  <p className="font-bold text-xs text-neutral-900">{t.label}</p>
                  <p className="text-[11px] text-neutral-500 mt-1 leading-snug">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-between space-y-3">
            <div>
              <label className="font-bold text-xs text-neutral-700 block mb-1.5">
                Reporting Period
              </label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="e.g. August 2026 or Q3 2026"
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 text-neutral-900 font-semibold"
              />
            </div>

            <button
              id="btn-generate-report"
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Synthesizing Executive Report...' : 'Generate Executive Report'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generated Report Display */}
      {isGenerating && (
        <div className="py-16 text-center bg-white rounded-2xl border border-neutral-200">
          <Sparkles className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
          <h4 className="font-bold text-base text-neutral-900">Gemini is compiling your executive report...</h4>
          <p className="text-xs text-neutral-500 mt-1">Cross-referencing revenue velocity, overdue debtors & fuel cost inflation.</p>
        </div>
      )}

      {generatedReport && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-md p-6 lg:p-8 space-y-6 animate-in fade-in duration-300">
          {/* Document Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider font-extrabold bg-neutral-900 text-white px-2 py-0.5 rounded">
                  OFFICIAL EXECUTIVE BRIEF
                </span>
                <span className="text-xs text-neutral-500 font-medium">{period}</span>
              </div>
              <h2 className="text-xl font-black text-neutral-900 mt-1">
                {generatedReport.title || 'Executive Management Review'}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Organization: <strong>{currentOrg?.name}</strong> • Tax ID: {currentOrg?.taxId}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyText}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-xs font-semibold transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
              </button>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF</span>
              </button>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
              1. Executive Summary
            </h4>
            <p className="text-xs text-neutral-800 leading-relaxed bg-neutral-50 p-4 rounded-xl border border-neutral-100">
              {generatedReport.executiveSummary}
            </p>
          </div>

          {/* Financial Highlights */}
          <div className="space-y-2">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
              2. Key Financial Highlights & Margins
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                <span className="text-[10px] uppercase font-bold text-emerald-700">Gross Revenue</span>
                <p className="text-base font-black text-emerald-900 mt-1">
                  <Currency amount={generatedReport.financialHighlights?.revenue || metrics.totalRevenue} symbol={symbol} />
                </p>
              </div>

              <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-100">
                <span className="text-[10px] uppercase font-bold text-rose-700">Total OpEx</span>
                <p className="text-base font-black text-rose-900 mt-1">
                  <Currency amount={generatedReport.financialHighlights?.expenses || metrics.totalExpenses} symbol={symbol} />
                </p>
              </div>

              <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
                <span className="text-[10px] uppercase font-bold text-blue-700">Net Margin</span>
                <p className="text-base font-black text-blue-900 mt-1">
                  <Currency amount={generatedReport.financialHighlights?.netProfit || metrics.netProfit} symbol={symbol} />
                </p>
              </div>

              <div className="p-3.5 bg-neutral-100 rounded-xl border border-neutral-200">
                <span className="text-[10px] uppercase font-bold text-neutral-600">Runway</span>
                <p className="text-base font-black text-neutral-900 mt-1">
                  {generatedReport.financialHighlights?.runwayMonths || metrics.runwayMonths} Months
                </p>
              </div>
            </div>
          </div>

          {/* Risks & Opportunities Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Risks */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-600">
                3. Critical Operational Risks
              </h4>
              <div className="bg-rose-50/40 border border-rose-100 rounded-xl p-4 space-y-2 text-xs text-rose-900">
                {(generatedReport.keyRisks || []).map((risk: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">
                4. Commercial Growth & Margin Levers
              </h4>
              <div className="bg-emerald-50/40 border border-emerald-100 rounded-xl p-4 space-y-2 text-xs text-emerald-900">
                {(generatedReport.opportunities || []).map((opp: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{opp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Plan */}
          {generatedReport.actionPlan && generatedReport.actionPlan.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
                5. 7-Day Tactical Execution Plan
              </h4>
              <div className="border border-neutral-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold">
                    <tr>
                      <th className="p-3">Priority</th>
                      <th className="p-3">Tactical Directive</th>
                      <th className="p-3">Responsible Owner</th>
                      <th className="p-3 text-right">Target Deadline</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {generatedReport.actionPlan.map((ap: any, idx: number) => (
                      <tr key={idx}>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            ap.priority === 'CRITICAL' || ap.priority === 'HIGH'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-neutral-100 text-neutral-700'
                          }`}>
                            {ap.priority}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-neutral-900">{ap.task}</td>
                        <td className="p-3 text-neutral-600">{ap.owner}</td>
                        <td className="p-3 text-right font-medium text-neutral-800">{ap.timeline}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
