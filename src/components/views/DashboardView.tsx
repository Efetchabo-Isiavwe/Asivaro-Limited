import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Receipt,
  CreditCard,
  CheckSquare,
  ShieldAlert,
  Lightbulb,
  Plus,
  ArrowUpRight,
  Flame,
  FileText,
  Calendar
} from 'lucide-react';
import { useBusinessData } from '../../context/BusinessDataContext';
import { useAuth } from '../../context/AuthContext';
import { MetricCard } from '../common/MetricCard';
import { Currency } from '../common/Currency';
import { StatusBadge } from '../common/StatusBadge';
import { Insight, InsightSection } from '../../types';
import { NavigationTab } from '../common/Sidebar';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface DashboardViewProps {
  onNavigate: (tab: NavigationTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { currentOrg } = useAuth();
  const {
    metrics,
    insights,
    invoices,
    expenses,
    transactions,
    tasks,
    convertInsightToTask,
    runAiAudit,
    isAiAuditing
  } = useBusinessData();

  const [activeHeroTab, setActiveHeroTab] = useState<InsightSection>('URGENT');
  const [createdTaskIds, setCreatedTaskIds] = useState<Record<string, boolean>>({});

  const symbol = currentOrg?.currencySymbol || '₦';

  // Filter insights for hero card
  const urgentInsights = insights.filter((i) => i.section === 'URGENT');
  const riskInsights = insights.filter((i) => i.section === 'RISKS');
  const opportunityInsights = insights.filter((i) => i.section === 'OPPORTUNITIES');

  const currentSectionInsights =
    activeHeroTab === 'URGENT'
      ? urgentInsights
      : activeHeroTab === 'RISKS'
      ? riskInsights
      : opportunityInsights;

  const handleCreateTask = async (insight: Insight) => {
    await convertInsightToTask(insight);
    setCreatedTaskIds((prev) => ({ ...prev, [insight.id]: true }));
    setTimeout(() => {
      setCreatedTaskIds((prev) => ({ ...prev, [insight.id]: false }));
    }, 3000);
  };

  // Realistic historical trend data
  const chartData = [
    { month: 'Apr', revenue: 24500000, expenses: 18200000, collections: 22000000 },
    { month: 'May', revenue: 28200000, expenses: 20100000, collections: 26500000 },
    { month: 'Jun', revenue: 31000000, expenses: 22400000, collections: 28000000 },
    { month: 'Jul', revenue: 29800000, expenses: 21500000, collections: 27100000 },
    { month: 'Aug', revenue: 33100000, expenses: 25100000, collections: 23050000 },
    { month: 'Sep (Est)', revenue: 36000000, expenses: 24000000, collections: 31500000 },
  ];

  const receivablesAgingData = [
    { range: 'Current (0-15d)', amount: 13300000, count: 2, fill: '#10b981' },
    { range: 'Grace (16-30d)', amount: 4100000, count: 1, fill: '#3b82f6' },
    { range: 'Overdue (31-60d)', amount: 6850000, count: 1, fill: '#f59e0b' },
    { range: 'Critical (>60d)', amount: 3200000, count: 1, fill: '#ef4444' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Hero Card: "What needs my attention today?" */}
      <div className="bg-neutral-950 text-white rounded-2xl p-6 lg:p-7 shadow-xl border border-neutral-800 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg lg:text-xl font-extrabold tracking-tight text-white">
                  What needs my attention today?
                </h2>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  AI Real-Time
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                Gemini synthesized priority alerts across your African SME operations & working capital.
              </p>
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex items-center bg-neutral-900/90 p-1 rounded-xl border border-neutral-800 shrink-0">
            <button
              id="hero-tab-urgent"
              onClick={() => setActiveHeroTab('URGENT')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeHeroTab === 'URGENT'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>URGENT</span>
              <span className="ml-0.5 px-1.5 py-0.2 bg-black/30 rounded-full text-[10px]">
                {urgentInsights.length}
              </span>
            </button>

            <button
              id="hero-tab-risks"
              onClick={() => setActiveHeroTab('RISKS')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeHeroTab === 'RISKS'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>RISKS</span>
              <span className="ml-0.5 px-1.5 py-0.2 bg-black/30 rounded-full text-[10px]">
                {riskInsights.length}
              </span>
            </button>

            <button
              id="hero-tab-opps"
              onClick={() => setActiveHeroTab('OPPORTUNITIES')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeHeroTab === 'OPPORTUNITIES'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>OPPORTUNITIES</span>
              <span className="ml-0.5 px-1.5 py-0.2 bg-black/30 rounded-full text-[10px]">
                {opportunityInsights.length}
              </span>
            </button>
          </div>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {currentSectionInsights.length > 0 ? (
            currentSectionInsights.map((item) => {
              const isTaskCreated = createdTaskIds[item.id];
              return (
                <div
                  key={item.id}
                  className="bg-neutral-900/90 rounded-xl p-5 border border-neutral-800 hover:border-neutral-700 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <StatusBadge status={item.severity} />
                      <span className="text-[11px] text-neutral-400 font-medium">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-neutral-100 leading-snug">
                      {item.title}
                    </h3>

                    {item.explanation && (
                      <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                        {item.explanation}
                      </p>
                    )}

                    <div className="p-2.5 rounded-lg bg-neutral-950/80 border border-neutral-800/80 space-y-1 text-xs">
                      <div className="flex items-baseline gap-1.5">
                        <strong className="text-neutral-400 text-[10px] uppercase font-bold shrink-0">Evidence:</strong>
                        <span className="text-neutral-300 text-[11px] truncate">{item.evidence}</span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <strong className="text-emerald-400 text-[10px] uppercase font-bold shrink-0">Action:</strong>
                        <span className="text-emerald-300 text-[11px] font-medium">{item.recommendation}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                    <button
                      id={`btn-create-task-${item.id}`}
                      onClick={() => handleCreateTask(item)}
                      disabled={isTaskCreated}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isTaskCreated
                          ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                      }`}
                    >
                      {isTaskCreated ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Task Created!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Create Task</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onNavigate('insights')}
                      className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-8 text-center bg-neutral-900/40 rounded-xl border border-neutral-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-neutral-200">All clear in this category</p>
              <p className="text-xs text-neutral-400 mt-1">Run an AI audit to perform fresh deep scanning.</p>
            </div>
          )}
        </div>
      </div>

      {/* 2. Key Operational Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          id="kpi-revenue"
          title="Revenue (August Inflow)"
          value={metrics.totalRevenue}
          isCurrency={true}
          currencySymbol={symbol}
          change={12.4}
          icon={DollarSign}
          iconColor="text-emerald-700"
          iconBg="bg-emerald-50"
          badge="Healthy"
          badgeColor="emerald"
          onClick={() => onNavigate('invoices')}
        />

        <MetricCard
          id="kpi-expenses"
          title="Operating Expenses (OpEx)"
          value={metrics.totalExpenses}
          isCurrency={true}
          currencySymbol={symbol}
          change={18.2}
          icon={CreditCard}
          iconColor="text-rose-700"
          iconBg="bg-rose-50"
          badge="Diesel Spike"
          badgeColor="rose"
          onClick={() => onNavigate('expenses')}
        />

        <MetricCard
          id="kpi-outstanding"
          title="Overdue Receivables"
          value={metrics.overdueReceivables}
          isCurrency={true}
          currencySymbol={symbol}
          subtitle={`Total unpaid: ${symbol}${metrics.outstandingInvoices.toLocaleString()}`}
          icon={Receipt}
          iconColor="text-amber-700"
          iconBg="bg-amber-50"
          badge="Urgent Recovery"
          badgeColor="amber"
          onClick={() => onNavigate('customers')}
        />

        <MetricCard
          id="kpi-runway"
          title="Cash-Flow Runway"
          value={`${metrics.runwayMonths} Months`}
          subtitle={`Liquid reserves: ${symbol}${metrics.cashBalance.toLocaleString()}`}
          icon={Clock}
          iconColor="text-blue-700"
          iconBg="bg-blue-50"
          badge={metrics.runwayMonths < 3 ? 'Warning' : 'Stable'}
          badgeColor={metrics.runwayMonths < 3 ? 'rose' : 'blue'}
          onClick={() => onNavigate('ask-asivaro')}
        />
      </div>

      {/* 3. Interactive Analytics & Aging Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Revenue vs Expenses Cashflow */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 lg:p-6 border border-neutral-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-100 gap-2">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Operating Cash Flow & Margins</h3>
              <p className="text-xs text-neutral-500">6-Month revenue collections vs operational expenditure</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-medium text-neutral-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" /> Revenue
              </span>
              <span className="flex items-center gap-1.5 font-medium text-neutral-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Expenses
              </span>
            </div>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₦${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(val: any) => [`₦${Number(val).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px', border: 'none' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" name="Revenue" />
                <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Overdue Receivables Aging */}
        <div className="bg-white rounded-2xl p-5 lg:p-6 border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Receivables Aging</h3>
                <p className="text-xs text-neutral-500">Uncollected customer invoices</p>
              </div>
              <button
                onClick={() => onNavigate('customers')}
                className="text-xs text-emerald-600 font-semibold hover:underline"
              >
                View all
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {receivablesAgingData.map((tier) => (
                <div key={tier.range} className="p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-neutral-700">{tier.range}</span>
                    <span className="font-bold text-neutral-900">
                      <Currency amount={tier.amount} symbol={symbol} />
                    </span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(tier.amount / 24450000) * 100}%`,
                        backgroundColor: tier.fill,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-neutral-500 mt-1">
                    <span>{tier.count} accounts</span>
                    <span>{Math.round((tier.amount / 24450000) * 100)}% of credit</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200/60 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Immediate AI Directive:</strong>
              <p className="mt-0.5 text-amber-800 text-[11px]">
                Collect ₦6.85M from Danladi Supermarkets before Sept 10 to protect lease liquidity.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Quick Action Banners & Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Open Operational Tasks */}
        <div className="bg-white rounded-2xl p-5 lg:p-6 border border-neutral-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <h3 className="text-base font-bold text-neutral-900">Active Operational Tasks</h3>
            </div>
            <button
              onClick={() => onNavigate('tasks')}
              className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
            >
              <span>Action Center</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="mt-3 space-y-2.5">
            {tasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                onClick={() => onNavigate('tasks')}
                className="p-3 rounded-xl bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-100 transition-colors flex items-center justify-between cursor-pointer"
              >
                <div className="space-y-0.5 pr-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={task.priority} />
                    <span className="text-xs font-semibold text-neutral-900 line-clamp-1">
                      {task.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 flex items-center gap-2">
                    <span>Assignee: <strong>{task.assignee}</strong></span>
                    <span>•</span>
                    <span>Due: {task.dueDate}</span>
                  </p>
                </div>
                <StatusBadge status={task.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Ask Asivaro Quick Launcher */}
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 text-white rounded-2xl p-5 lg:p-6 border border-neutral-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">Ask Asivaro</h3>
              </div>
              <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                AI Business Analyst
              </span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed mb-4">
              Query your live sales, overdue debtors, fuel overheads, or product performance in natural language.
            </p>

            <div className="space-y-2">
              {[
                'Why did expenses increase this month?',
                'Which customers owe us money and are overdue?',
                'What products are performing best?',
                'Summarize this month\'s management performance'
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => onNavigate('ask-asivaro')}
                  className="w-full text-left px-3 py-2 rounded-lg bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 text-xs font-medium border border-neutral-700/60 transition-all flex items-center justify-between group"
                >
                  <span className="truncate">{q}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-emerald-400 shrink-0 ml-1" />
                </button>
              ))}
            </div>
          </div>

          <button
            id="btn-open-ask-asivaro"
            onClick={() => onNavigate('ask-asivaro')}
            className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>Open Conversational Analyst</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
