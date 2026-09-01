import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Trash2,
  PieChart as PieChartIcon,
  TrendingUp,
  Tag,
  DollarSign,
  FileText
} from 'lucide-react';
import { useBusinessData } from '../../context/BusinessDataContext';
import { useAuth } from '../../context/AuthContext';
import { Expense, ExpenseCategory } from '../../types';
import { Currency } from '../common/Currency';
import { Modal } from '../common/Modal';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';

export const ExpensesView: React.FC = () => {
  const { currentOrg } = useAuth();
  const { expenses, addExpense, deleteExpense, metrics } = useBusinessData();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Fuel & Power' as ExpenseCategory,
    amount: 0,
    vendor: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
    isAnomalous: false,
    anomalyReason: '',
    notes: '',
  });

  const symbol = currentOrg?.currencySymbol || '₦';

  const categories: ExpenseCategory[] = [
    'Fuel & Power',
    'Payroll & Wages',
    'Rent & Warehouse',
    'Logistics & Freight',
    'Maintenance',
    'Marketing',
    'Professional Fees',
    'Supplies',
    'Other',
  ];

  // Category totals for chart
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const chartColors = [
    '#ef4444',
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#14b8a6',
    '#64748b',
  ];

  const pieData = Object.entries(categoryTotals).map(([name, value], i) => ({
    name,
    value,
    color: chartColors[i % chartColors.length],
  }));

  const handleAddExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || formData.amount <= 0) return;

    await addExpense({
      ...formData,
      receiptUrl: undefined,
    });

    setIsAddModalOpen(false);
  };

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === 'ALL' || exp.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Expense Overview & Anomaly Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Total OpEx & Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400">
                  Total August Operating Outflows
                </span>
                <h3 className="text-2xl font-black text-neutral-900 mt-0.5">
                  <Currency amount={metrics.totalExpenses} symbol={symbol} />
                </h3>
              </div>

              <div className="text-right">
                <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  +18.2% vs Jul
                </span>
              </div>
            </div>

            {/* Category breakdown bar visual */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {pieData.slice(0, 4).map((item) => (
                <div key={item.name} className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-neutral-600 font-medium text-[11px] truncate">{item.name}</span>
                  </div>
                  <p className="font-extrabold text-neutral-900">
                    <Currency amount={item.value} symbol={symbol} />
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Tracking 8 active cost centers across Nigerian operations</span>
            <button
              onClick={() => setCategoryFilter('Fuel & Power')}
              className="text-rose-600 font-bold hover:underline"
            >
              Filter Fuel Overheads
            </button>
          </div>
        </div>

        {/* Right: AI Anomaly Detector Card */}
        <div className="bg-neutral-950 text-white rounded-2xl p-6 border border-neutral-800 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">AI Cost Anomaly</h4>
                <span className="text-[10px] text-rose-400 font-bold uppercase">Spike Detected</span>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Diesel procurement rose <strong className="text-rose-400">52%</strong> this month (₦4.8M) due to grid downtime and pump price adjustments in Ikeja Industrial estate.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
            <span className="text-neutral-400 text-[11px]">Recommended: Negotiate bulk AGO supply contract</span>
            <span className="text-rose-400 font-bold">Priority Flag</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search expenses by vendor or description..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-900"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs font-semibold text-neutral-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button
          id="btn-add-expense"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Record Expense</span>
        </button>
      </div>

      {/* Expense List Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Expense Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Vendor</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4">Channel</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {exp.isAnomalous && (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" title={exp.anomalyReason} />
                      )}
                      <div>
                        <span className="font-bold text-neutral-900 block">{exp.title}</span>
                        {exp.anomalyReason && (
                          <span className="text-[10px] text-rose-600 font-medium block">
                            {exp.anomalyReason}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                      {exp.category}
                    </span>
                  </td>

                  <td className="p-4 font-medium text-neutral-700">{exp.vendor}</td>
                  <td className="p-4 text-neutral-500">{exp.date}</td>

                  <td className="p-4 text-right font-black text-neutral-900">
                    <Currency amount={exp.amount} symbol={symbol} />
                  </td>

                  <td className="p-4 text-neutral-500 text-[11px]">{exp.paymentMethod}</td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Record Operating Expense"
          subtitle="Log company outflow, vendor details & cost category"
          maxWidth="md"
        >
          <form onSubmit={handleAddExpenseSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-neutral-700 block mb-1">Expense Description *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. 5,000L AGO Diesel Generator Supply"
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Amount (₦) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900 font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Vendor / Payee</label>
                <input
                  type="text"
                  required
                  value={formData.vendor}
                  onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                  placeholder="e.g. TotalEnergies Nigeria"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
              >
                <option value="Bank Transfer">Bank Transfer (NIBSS/NIP)</option>
                <option value="Corporate Debit Card">Corporate Debit Card</option>
                <option value="Cash / Petty Cash">Cash / Petty Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-xs"
              >
                Record Expense
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
