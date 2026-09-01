import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Copy,
  Clock,
  Shield,
  Edit2,
  Trash2,
  DollarSign
} from 'lucide-react';
import { useBusinessData } from '../../context/BusinessDataContext';
import { useAuth } from '../../context/AuthContext';
import { Customer, PaymentHealth } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Currency } from '../common/Currency';
import { Modal } from '../common/Modal';

export const CustomersView: React.FC = () => {
  const { currentOrg } = useAuth();
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useBusinessData();

  const [searchTerm, setSearchTerm] = useState('');
  const [healthFilter, setHealthFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // AI Reminder generator state
  const [reminderCustomer, setReminderCustomer] = useState<Customer | null>(null);
  const [reminderData, setReminderData] = useState<{
    emailSubject?: string;
    formalEmail?: string;
    whatsappMessage?: string;
    earlySettlementOffer?: string;
  } | null>(null);
  const [isGeneratingReminder, setIsGeneratingReminder] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: 'Lagos',
    totalPurchases: 0,
    outstandingBalance: 0,
    paymentTerms: 'Net 30',
    creditLimit: 5000000,
    paymentHealth: 'Good' as PaymentHealth,
    notes: '',
  });

  const symbol = currentOrg?.currencySymbol || '₦';

  const filteredCustomers = customers.filter((cust) => {
    const matchesSearch =
      cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesHealth = healthFilter === 'ALL' || cust.paymentHealth === healthFilter;
    return matchesSearch && matchesHealth;
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      city: 'Lagos',
      totalPurchases: 0,
      outstandingBalance: 0,
      paymentTerms: 'Net 30',
      creditLimit: 5000000,
      paymentHealth: 'Good',
      notes: '',
    });
    setEditingCustomer(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cust: Customer) => {
    setFormData({
      name: cust.name,
      contactPerson: cust.contactPerson,
      email: cust.email,
      phone: cust.phone,
      address: cust.address,
      city: cust.city,
      totalPurchases: cust.totalPurchases,
      outstandingBalance: cust.outstandingBalance,
      paymentTerms: cust.paymentTerms,
      creditLimit: cust.creditLimit,
      paymentHealth: cust.paymentHealth,
      notes: cust.notes || '',
    });
    setEditingCustomer(cust);
    setIsAddModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingCustomer) {
      await updateCustomer(editingCustomer.id, {
        ...formData,
      });
    } else {
      await addCustomer({
        ...formData,
        lastOrderDate: new Date().toISOString().split('T')[0],
      });
    }

    setIsAddModalOpen(false);
  };

  const handleGenerateReminder = async (cust: Customer) => {
    setReminderCustomer(cust);
    setReminderData(null);
    setIsGeneratingReminder(true);

    try {
      const res = await fetch('/api/ai/payment-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: cust.name,
          contactPerson: cust.contactPerson,
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
          amountDue: cust.outstandingBalance,
          daysOverdue: cust.paymentHealth === 'Overdue' ? 28 : 14,
          currencySymbol: symbol,
          tone: cust.paymentHealth === 'Overdue' ? 'executive_escalation' : 'firm_overdue',
        }),
      });

      if (!res.ok) throw new Error('Reminder generation failed');
      const data = await res.json();
      setReminderData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingReminder(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search customer, contact person or city..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-900"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['ALL', 'Good', 'Slow', 'At Risk', 'Overdue'].map((h) => (
              <button
                key={h}
                onClick={() => setHealthFilter(h)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  healthFilter === h
                    ? 'bg-neutral-900 text-white font-bold'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        <button
          id="btn-add-customer"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Customer List / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => (
          <div
            key={cust.id}
            className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-neutral-900 leading-snug">{cust.name}</h4>
                  <p className="text-xs text-neutral-500 mt-0.5">{cust.contactPerson}</p>
                </div>
                <StatusBadge status={cust.paymentHealth} />
              </div>

              {/* Balances */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400">
                    Outstanding Debt
                  </span>
                  <p
                    className={`text-sm font-extrabold mt-0.5 ${
                      cust.outstandingBalance > 0 ? 'text-rose-600' : 'text-emerald-600'
                    }`}
                  >
                    <Currency amount={cust.outstandingBalance} symbol={symbol} />
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Credit Limit</span>
                  <p className="text-sm font-bold text-neutral-800 mt-0.5">
                    <Currency amount={cust.creditLimit} symbol={symbol} />
                  </p>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-1.5 text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{cust.city} • {cust.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{cust.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{cust.email}</span>
                </div>
              </div>

              {cust.notes && (
                <p className="text-[11px] text-neutral-500 italic bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                  "{cust.notes}"
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
              {cust.outstandingBalance > 0 ? (
                <button
                  id={`btn-ai-reminder-${cust.id}`}
                  onClick={() => handleGenerateReminder(cust)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                  <span>AI Debt Notice</span>
                </button>
              ) : (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> No Balance Due
                </span>
              )}

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEdit(cust)}
                  className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                  title="Edit Customer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteCustomer(cust.id)}
                  className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Customer Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={editingCustomer ? 'Edit Customer Account' : 'Register New Customer'}
          subtitle="Maintain credit terms, payment health & billing records"
          maxWidth="lg"
        >
          <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Company / Store Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Danladi Supermarkets Ltd"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Contact Person</label>
                <input
                  type="text"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  placeholder="e.g. Alhaji Danladi Usman"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+234 803 123 4567"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="purchases@customer.com"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">City / State</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Abuja, FCT or Lagos"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Street Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Garki Commercial District"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Outstanding Balance (₦)</label>
                <input
                  type="number"
                  value={formData.outstandingBalance}
                  onChange={(e) => setFormData({ ...formData, outstandingBalance: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Credit Limit (₦)</label>
                <input
                  type="number"
                  value={formData.creditLimit}
                  onChange={(e) => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Payment Health</label>
                <select
                  value={formData.paymentHealth}
                  onChange={(e) => setFormData({ ...formData, paymentHealth: e.target.value as PaymentHealth })}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900 font-semibold"
                >
                  <option value="Good">Good (Punctual)</option>
                  <option value="Slow">Slow (30-45 days)</option>
                  <option value="At Risk">At Risk (Delayed)</option>
                  <option value="Overdue">Overdue (Critical)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Operational Notes / Credit History</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Credit terms, settlement habits, preferred payment channels..."
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
              />
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
                {editingCustomer ? 'Update Customer' : 'Save Customer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* AI Debt Reminder Generator Modal */}
      {reminderCustomer && (
        <Modal
          isOpen={!!reminderCustomer}
          onClose={() => setReminderCustomer(null)}
          title={`AI Payment Notice: ${reminderCustomer.name}`}
          subtitle={`Outstanding: ₦${reminderCustomer.outstandingBalance.toLocaleString()} (${reminderCustomer.paymentHealth})`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {isGeneratingReminder ? (
              <div className="py-12 text-center text-xs text-neutral-600 bg-neutral-50 rounded-xl border border-neutral-200">
                <Sparkles className="w-6 h-6 animate-spin text-emerald-600 mx-auto mb-2" />
                <p className="font-bold text-neutral-900">Crafting culturally attuned debt recovery notice...</p>
                <p className="text-[11px] text-neutral-400 mt-1">
                  Drafting formal email, WhatsApp message & 2% early-settlement incentive with Gemini.
                </p>
              </div>
            ) : reminderData ? (
              <div className="space-y-4">
                {/* Early settlement incentive banner */}
                {reminderData.earlySettlementOffer && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 block mb-0.5">
                      Suggested Early Settlement Incentive:
                    </span>
                    <p className="text-xs font-semibold">{reminderData.earlySettlementOffer}</p>
                  </div>
                )}

                {/* WhatsApp Message Card */}
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      Direct WhatsApp Message
                    </span>
                    <button
                      onClick={() => handleCopy(reminderData.whatsappMessage || '', 'whatsapp')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-md font-semibold text-[11px]"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedKey === 'whatsapp' ? 'Copied!' : 'Copy WhatsApp'}</span>
                    </button>
                  </div>
                  <pre className="whitespace-pre-wrap font-sans text-xs bg-white p-3 rounded-lg border border-neutral-200 text-neutral-800 leading-relaxed">
                    {reminderData.whatsappMessage}
                  </pre>
                </div>

                {/* Formal Email Card */}
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      Formal Business Email
                    </span>
                    <button
                      onClick={() => handleCopy(`${reminderData.emailSubject}\n\n${reminderData.formalEmail}`, 'email')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-md font-semibold text-[11px]"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedKey === 'email' ? 'Copied!' : 'Copy Email'}</span>
                    </button>
                  </div>
                  {reminderData.emailSubject && (
                    <p className="text-[11px] text-neutral-700 font-bold bg-white px-3 py-1.5 rounded-md border border-neutral-200 truncate">
                      Subject: {reminderData.emailSubject}
                    </p>
                  )}
                  <pre className="whitespace-pre-wrap font-sans text-xs bg-white p-3 rounded-lg border border-neutral-200 text-neutral-800 leading-relaxed max-h-56 overflow-y-auto">
                    {reminderData.formalEmail}
                  </pre>
                </div>
              </div>
            ) : null}

            <div className="pt-3 border-t border-neutral-200 flex justify-end">
              <button
                onClick={() => setReminderCustomer(null)}
                className="px-4 py-2 bg-neutral-900 text-white font-bold rounded-lg text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
