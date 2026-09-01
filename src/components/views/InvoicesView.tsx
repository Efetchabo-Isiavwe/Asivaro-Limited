import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Trash2,
  DollarSign,
  Printer,
  Calendar,
  Building,
  User,
  ArrowRight
} from 'lucide-react';
import { useBusinessData } from '../../context/BusinessDataContext';
import { useAuth } from '../../context/AuthContext';
import { Invoice, InvoiceLineItem, InvoiceStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Currency } from '../common/Currency';
import { Modal } from '../common/Modal';

export const InvoicesView: React.FC = () => {
  const { currentOrg } = useAuth();
  const { invoices, customers, addInvoice, markInvoicePaid } = useBusinessData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // New Invoice Form state
  const [customerId, setCustomerId] = useState(customers[0]?.id || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [paymentTerms, setPaymentTerms] = useState('Net 30');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<Array<{ description: string; quantity: number; unitPrice: number }>>([
    { description: 'Golden Penny Flour 50kg', quantity: 20, unitPrice: 58500 },
  ]);

  const symbol = currentOrg?.currencySymbol || '₦';

  // Subtotals
  const subtotal = lineItems.reduce((acc, li) => acc + (li.quantity * li.unitPrice), 0);
  const vatAmount = Math.round(subtotal * 0.075);
  const totalAmount = subtotal + vatAmount;

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: string, value: any) => {
    const next = [...lineItems];
    next[index] = { ...next[index], [field]: value };
    setLineItems(next);
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === customerId) || customers[0];

    const formattedLineItems: InvoiceLineItem[] = lineItems.map((li, idx) => ({
      id: `li_${Date.now()}_${idx}`,
      description: li.description || 'Product Item',
      quantity: Number(li.quantity) || 1,
      unitPrice: Number(li.unitPrice) || 0,
      total: (Number(li.quantity) || 1) * (Number(li.unitPrice) || 0),
    }));

    await addInvoice({
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      customerId: cust.id,
      customerName: cust.name,
      customerEmail: cust.email,
      customerPhone: cust.phone,
      issueDate,
      dueDate,
      lineItems: formattedLineItems,
      subtotal,
      vatRate: 7.5,
      vatAmount,
      totalAmount,
      amountPaid: 0,
      balanceDue: totalAmount,
      status: 'PENDING',
      paymentTerms,
      notes,
    });

    setIsCreateModalOpen(false);
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search invoice number or customer name..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-900"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['ALL', 'PENDING', 'OVERDUE', 'PAID', 'PARTIAL'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === st
                    ? 'bg-neutral-900 text-white font-bold'
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <button
          id="btn-create-invoice"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Invoice</span>
        </button>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Invoice #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Dates</th>
                <th className="p-4 text-right">Total Amount</th>
                <th className="p-4 text-right">Balance Due</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-neutral-50/60 transition-colors">
                  <td className="p-4 font-mono font-bold text-neutral-900">
                    {inv.invoiceNumber}
                  </td>

                  <td className="p-4">
                    <div className="font-bold text-neutral-900">{inv.customerName}</div>
                    <div className="text-[11px] text-neutral-400">{inv.paymentTerms}</div>
                  </td>

                  <td className="p-4 text-neutral-600">
                    <div>Issue: {inv.issueDate}</div>
                    <div className="text-[11px] text-neutral-400">Due: {inv.dueDate}</div>
                  </td>

                  <td className="p-4 text-right font-extrabold text-neutral-900">
                    <Currency amount={inv.totalAmount} symbol={symbol} />
                  </td>

                  <td className="p-4 text-right font-extrabold">
                    <span className={inv.balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                      <Currency amount={inv.balanceDue} symbol={symbol} />
                    </span>
                  </td>

                  <td className="p-4">
                    <StatusBadge status={inv.status} />
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
                        title="View Invoice Document"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {inv.balanceDue > 0 && (
                        <button
                          id={`btn-mark-paid-${inv.id}`}
                          onClick={() => markInvoicePaid(inv.id)}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-colors"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail / Print Preview Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Tax Invoice: ${selectedInvoice.invoiceNumber}`}
          subtitle={`Billing statement for ${selectedInvoice.customerName}`}
          maxWidth="2xl"
        >
          <div className="p-6 bg-white rounded-xl border border-neutral-200 space-y-6 text-xs text-neutral-800">
            {/* Header branding */}
            <div className="flex items-start justify-between border-b border-neutral-200 pb-5">
              <div>
                <h3 className="font-extrabold text-lg text-neutral-900">{currentOrg?.name}</h3>
                <p className="text-neutral-500 text-[11px] mt-0.5">{currentOrg?.address}</p>
                <p className="text-neutral-500 text-[11px]">TIN: {currentOrg?.taxId}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  TAX INVOICE
                </span>
                <h4 className="font-mono font-bold text-base text-neutral-900 mt-1">
                  {selectedInvoice.invoiceNumber}
                </h4>
                <p className="text-neutral-500 text-[11px]">Date: {selectedInvoice.issueDate}</p>
                <p className="text-neutral-500 text-[11px]">Due: {selectedInvoice.dueDate}</p>
              </div>
            </div>

            {/* Bill To */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  BILLED TO:
                </span>
                <p className="font-bold text-neutral-900 text-sm">{selectedInvoice.customerName}</p>
                <p className="text-neutral-600 text-xs">{selectedInvoice.customerEmail}</p>
                <p className="text-neutral-600 text-xs">{selectedInvoice.customerPhone}</p>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                  PAYMENT TERMS:
                </span>
                <p className="font-semibold text-neutral-800">{selectedInvoice.paymentTerms}</p>
                <StatusBadge status={selectedInvoice.status} className="mt-1" />
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 border-b border-neutral-200 font-semibold text-neutral-600">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Qty</th>
                    <th className="p-3 text-right">Unit Price</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {selectedInvoice.lineItems.map((li, idx) => (
                    <tr key={idx}>
                      <td className="p-3 font-medium text-neutral-900">{li.description}</td>
                      <td className="p-3 text-right text-neutral-600">{li.quantity}</td>
                      <td className="p-3 text-right text-neutral-600">
                        <Currency amount={li.unitPrice} symbol={symbol} />
                      </td>
                      <td className="p-3 text-right font-bold text-neutral-900">
                        <Currency amount={li.total} symbol={symbol} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Calculation */}
            <div className="flex justify-end">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal:</span>
                  <span><Currency amount={selectedInvoice.subtotal} symbol={symbol} /></span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>VAT (7.5%):</span>
                  <span><Currency amount={selectedInvoice.vatAmount} symbol={symbol} /></span>
                </div>
                <div className="flex justify-between font-bold text-neutral-900 text-sm pt-2 border-t border-neutral-200">
                  <span>Total Amount:</span>
                  <span><Currency amount={selectedInvoice.totalAmount} symbol={symbol} /></span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700">
                  <span>Amount Paid:</span>
                  <span><Currency amount={selectedInvoice.amountPaid} symbol={symbol} /></span>
                </div>
                <div className="flex justify-between font-extrabold text-rose-600 pt-1 border-t border-neutral-100">
                  <span>Balance Due:</span>
                  <span><Currency amount={selectedInvoice.balanceDue} symbol={symbol} /></span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedInvoice.notes && (
              <p className="text-[11px] text-neutral-500 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
                <strong>Notes:</strong> {selectedInvoice.notes}
              </p>
            )}

            <div className="pt-4 border-t border-neutral-200 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Invoice Modal */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Customer Invoice"
          subtitle="Generate tax-compliant commercial invoice with line item breakdown"
          maxWidth="2xl"
        >
          <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Customer *</label>
                <select
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold text-neutral-900"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Payment Terms</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
                >
                  <option value="Net 15">Net 15 Days</option>
                  <option value="Net 30">Net 30 Days</option>
                  <option value="Net 60">Net 60 Days</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-neutral-700 block mb-1">Issue Date</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
                />
              </div>

              <div>
                <label className="font-bold text-neutral-700 block mb-1">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
                />
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-neutral-800 uppercase tracking-wider text-[11px]">
                  Invoice Line Items
                </label>
                <button
                  type="button"
                  onClick={handleAddLineItem}
                  className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </button>
              </div>

              {lineItems.map((li, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Product or service description"
                    value={li.description}
                    onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                    className="flex-3 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={li.quantity}
                    onChange={(e) => handleLineItemChange(idx, 'quantity', Number(e.target.value))}
                    className="flex-1 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
                  />
                  <input
                    type="number"
                    placeholder="Unit Price (₦)"
                    value={li.unitPrice}
                    onChange={(e) => handleLineItemChange(idx, 'unitPrice', Number(e.target.value))}
                    className="flex-2 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
                  />
                  {lineItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(idx)}
                      className="p-2 text-neutral-400 hover:text-rose-600 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Calculations preview */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1.5 text-xs text-neutral-700">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold"><Currency amount={subtotal} symbol={symbol} /></span>
              </div>
              <div className="flex justify-between">
                <span>VAT (7.5%):</span>
                <span className="font-semibold"><Currency amount={vatAmount} symbol={symbol} /></span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-neutral-900 pt-1 border-t border-neutral-200">
                <span>Total Invoice Value:</span>
                <span><Currency amount={totalAmount} symbol={symbol} /></span>
              </div>
            </div>

            <div>
              <label className="font-bold text-neutral-700 block mb-1">Notes / Instructions</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment instructions, bank account details..."
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-emerald-500 text-neutral-900"
              />
            </div>

            <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 text-neutral-600 hover:bg-neutral-100 rounded-lg font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-xs"
              >
                Create Invoice
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
