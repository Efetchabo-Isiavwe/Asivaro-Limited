import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Plus,
  RefreshCw,
  Filter,
  Flame,
  ArrowRight,
  TrendingUp,
  Layers
} from 'lucide-react';
import { useBusinessData } from '../../context/BusinessDataContext';
import { useAuth } from '../../context/AuthContext';
import { Insight, InsightCategory, InsightSection } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export const InsightsView: React.FC = () => {
  const { currentOrg } = useAuth();
  const {
    insights,
    runAiAudit,
    isAiAuditing,
    convertInsightToTask,
    metrics
  } = useBusinessData();

  const [activeSection, setActiveSection] = useState<InsightSection | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [createdTasks, setCreatedTasks] = useState<Record<string, boolean>>({});

  const handleConvert = async (item: Insight) => {
    await convertInsightToTask(item);
    setCreatedTasks((prev) => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setCreatedTasks((prev) => ({ ...prev, [item.id]: false }));
    }, 4000);
  };

  const filteredInsights = insights.filter((i) => {
    const matchesSection = activeSection === 'ALL' || i.section === activeSection;
    const matchesCat = categoryFilter === 'ALL' || i.category === categoryFilter;
    return matchesSection && matchesCat;
  });

  const urgentCount = insights.filter((i) => i.section === 'URGENT').length;
  const risksCount = insights.filter((i) => i.section === 'RISKS').length;
  const oppsCount = insights.filter((i) => i.section === 'OPPORTUNITIES').length;
  const obsCount = insights.filter((i) => i.section === 'OBSERVATIONS').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Run Audit Button */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white rounded-2xl p-6 lg:p-7 border border-neutral-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-lg lg:text-xl font-black text-white">
              Autonomous Business Intelligence Radar
            </h2>
          </div>
          <p className="text-xs text-neutral-300 max-w-xl leading-relaxed">
            Gemini continuously cross-analyzes your debtors, vendor invoices, product margins, and cash burn to protect your SME from cash-flow shocks.
          </p>
        </div>

        <button
          id="btn-run-full-audit"
          onClick={runAiAudit}
          disabled={isAiAuditing}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg transition-all z-10 shrink-0 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isAiAuditing ? 'animate-spin' : ''}`} />
          <span>{isAiAuditing ? 'Auditing Ledger & Outflows...' : 'Re-Run Live AI Business Audit'}</span>
        </button>
      </div>

      {/* Section Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSection('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'ALL'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
            }`}
          >
            All Findings ({insights.length})
          </button>

          <button
            onClick={() => setActiveSection('URGENT')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'URGENT'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>URGENT ({urgentCount})</span>
          </button>

          <button
            onClick={() => setActiveSection('RISKS')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'RISKS'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>RISKS ({risksCount})</span>
          </button>

          <button
            onClick={() => setActiveSection('OPPORTUNITIES')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSection === 'OPPORTUNITIES'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>OPPORTUNITIES ({oppsCount})</span>
          </button>
        </div>

        {/* Category dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="ALL">All Categories</option>
          <option value="Receivables">Receivables & Debtors</option>
          <option value="Inventory">Inventory & Supply Chain</option>
          <option value="CashFlow">Cash Flow & Runway</option>
          <option value="Procurement">Procurement & Overheads</option>
          <option value="Sales">Sales & Margins</option>
          <option value="Compliance">Compliance & Tax</option>
        </select>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInsights.map((item) => {
          const isCreated = createdTasks[item.id];
          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.severity} />
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">
                    {item.section}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-neutral-900 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-neutral-600 leading-relaxed">
                  {item.explanation}
                </p>

                {/* Evidence & Action Box */}
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-0.5">
                      Empirical Data Evidence:
                    </span>
                    <p className="text-neutral-800 font-medium">{item.evidence}</p>
                  </div>

                  <div className="pt-2 border-t border-neutral-200/80">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-0.5">
                      Recommended Operational Action:
                    </span>
                    <p className="text-emerald-900 font-semibold">{item.recommendation}</p>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400">
                  Detected: {new Date(item.detectedAt).toLocaleDateString()}
                </span>

                <button
                  id={`btn-convert-insight-${item.id}`}
                  onClick={() => handleConvert(item)}
                  disabled={isCreated}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isCreated
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                      : 'bg-neutral-900 hover:bg-neutral-800 text-white active:scale-95'
                  }`}
                >
                  {isCreated ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Task Created in Action Center</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Convert to Task</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
