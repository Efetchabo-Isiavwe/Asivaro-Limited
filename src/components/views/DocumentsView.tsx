import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  FileSpreadsheet,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  Eye,
  Plus,
  Receipt,
  CreditCard,
  CheckSquare,
  Search,
  Filter,
  Layers,
  FileQuestion
} from 'lucide-react';
import { useBusinessData } from '../../context/BusinessDataContext';
import { useAuth } from '../../context/AuthContext';
import { BusinessDocument, DocumentType } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Modal } from '../common/Modal';
import { Currency } from '../common/Currency';

export const DocumentsView: React.FC = () => {
  const { currentOrg, currentUser } = useAuth();
  const {
    documents,
    addDocument,
    processDocumentWithAI,
    convertDocumentToExpense,
    convertDocumentToInvoice,
    addTask
  } = useBusinessData();

  const [isDragging, setIsDragging] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<BusinessDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const symbol = currentOrg?.currencySymbol || '₦';

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      let fileType: BusinessDocument['fileType'] = 'pdf';
      if (['csv'].includes(ext)) fileType = 'csv';
      else if (['xlsx', 'xls'].includes(ext)) fileType = 'xlsx';
      else if (['docx', 'doc'].includes(ext)) fileType = 'docx';
      else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) fileType = 'image';

      // Read file data
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        const isBase64 = result?.startsWith('data:');

        const newDoc = await addDocument({
          title: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
          originalFileName: file.name,
          fileType,
          fileSize: file.size,
          status: 'PROCESSING',
          createdBy: currentUser?.displayName || 'Asivaro Operator',
        });

        // Trigger AI extraction
        await processDocumentWithAI(newDoc.id, {
          fileName: file.name,
          mimeType: file.type,
          base64Data: isBase64 ? result : undefined,
          textContent: !isBase64 ? result : `Uploaded ${file.name} for Nigerian SME operations`,
        });
      };

      if (fileType === 'image' || fileType === 'pdf') {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }

    setIsUploading(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleConvertToExpense = async (docItem: BusinessDocument) => {
    await convertDocumentToExpense(docItem);
    setActionSuccessMsg(`Successfully logged as an expense of ₦${(docItem.extractedData?.amount || 0).toLocaleString()}!`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleConvertToInvoice = async (docItem: BusinessDocument) => {
    await convertDocumentToInvoice(docItem);
    setActionSuccessMsg(`Successfully created new Invoice from ${docItem.title}!`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.originalFileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.extractedData?.vendor && doc.extractedData.vendor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.extractedData?.customer && doc.extractedData.customer.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType =
      typeFilter === 'ALL' || doc.extractedData?.documentType === typeFilter;

    return matchesSearch && matchesType;
  });

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'xlsx':
      case 'csv':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <FileCode className="w-5 h-5 text-neutral-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Upload Dropzone */}
      <div
        id="dropzone-document-upload"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`bg-white rounded-2xl p-8 border-2 border-dashed transition-all cursor-pointer text-center relative overflow-hidden ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/50 scale-[1.01]'
            : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50/50 shadow-xs'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => handleFileUpload(e.target.files)}
          multiple
          accept=".pdf,.csv,.xlsx,.xls,.docx,.doc,image/*"
          className="hidden"
        />

        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-xs">
          <Upload className="w-7 h-7" />
        </div>

        <h3 className="text-base font-bold text-neutral-900">
          Upload Invoices, Contracts, Waybills or Bank Statements
        </h3>
        <p className="text-xs text-neutral-500 mt-1 max-w-md mx-auto">
          Drag & drop files or click to browse. Supports PDF, CSV, XLSX, DOCX, and JPG/PNG.
        </p>

        <div className="flex items-center justify-center gap-3 mt-4 text-[11px] text-neutral-600 font-medium">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Automatic OCR & Gemini Parsing
          </span>
          <span>•</span>
          <span>Instant Invoice / Expense Conversion</span>
          <span>•</span>
          <span>Risk & Clause Extraction</span>
        </div>

        {isUploading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex items-center justify-center gap-2 text-xs font-bold text-emerald-700">
            <Sparkles className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Processing uploaded documents with Gemini...</span>
          </div>
        )}
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, vendor, customer or invoice #..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-900"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'INVOICE', 'WAYBILL', 'CONTRACT', 'RECEIPT', 'TAX_DOCUMENT'].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                typeFilter === type
                  ? 'bg-neutral-900 text-white font-bold'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              {type.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => {
          const ext = doc.extractedData;
          return (
            <div
              key={doc.id}
              className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                      {getFileIcon(doc.fileType)}
                    </div>
                    <div className="truncate">
                      <h4 className="font-bold text-xs text-neutral-900 truncate" title={doc.title}>
                        {doc.title}
                      </h4>
                      <p className="text-[10px] text-neutral-400 truncate">{doc.originalFileName}</p>
                    </div>
                  </div>

                  <StatusBadge status={doc.status} />
                </div>

                {ext ? (
                  <div className="space-y-2 p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-neutral-400">
                        {ext.documentType}
                      </span>
                      {ext.amount !== undefined && (
                        <span className="font-extrabold text-neutral-900">
                          <Currency amount={ext.amount} symbol={ext.currency === 'NGN' ? '₦' : ext.currency || symbol} />
                        </span>
                      )}
                    </div>

                    {ext.vendor && (
                      <div className="text-[11px] text-neutral-600 truncate">
                        <strong className="text-neutral-500 font-semibold">Vendor:</strong> {ext.vendor}
                      </div>
                    )}

                    {ext.customer && (
                      <div className="text-[11px] text-neutral-600 truncate">
                        <strong className="text-neutral-500 font-semibold">Customer:</strong> {ext.customer}
                      </div>
                    )}

                    {ext.summary && (
                      <p className="text-[11px] text-neutral-500 line-clamp-2 italic pt-1 border-t border-neutral-200/60">
                        "{ext.summary}"
                      </p>
                    )}

                    {ext.risks && ext.risks.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200/60">
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">{ext.risks[0]}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-neutral-400 bg-neutral-50 rounded-xl border border-neutral-100">
                    <Sparkles className="w-4 h-4 animate-spin text-emerald-600 mx-auto mb-1" />
                    <span>Extracting structured data...</span>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
                <button
                  id={`btn-view-doc-${doc.id}`}
                  onClick={() => setSelectedDoc(doc)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-neutral-900 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {ext?.documentType === 'INVOICE' && (
                    <button
                      id={`btn-convert-expense-${doc.id}`}
                      onClick={() => handleConvertToExpense(doc)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all"
                      title="Record as company expense"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Log Expense</span>
                    </button>
                  )}

                  {ext?.documentType === 'WAYBILL' && (
                    <button
                      id={`btn-convert-invoice-${doc.id}`}
                      onClick={() => handleConvertToInvoice(doc)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-all"
                      title="Create formal customer invoice"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Create Invoice</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Document Detail Modal */}
      {selectedDoc && (
        <Modal
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDoc(null)}
          title={selectedDoc.title}
          subtitle={`Uploaded on ${new Date(selectedDoc.uploadDate).toLocaleDateString()}`}
          maxWidth="2xl"
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-900 text-white">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                  Extracted Document Type
                </span>
                <h4 className="text-base font-extrabold text-white">
                  {selectedDoc.extractedData?.documentType || 'Document'}
                </h4>
              </div>

              {selectedDoc.extractedData?.amount !== undefined && (
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">
                    Total Amount
                  </span>
                  <div className="text-lg font-black text-emerald-400">
                    <Currency amount={selectedDoc.extractedData.amount} symbol={symbol} />
                  </div>
                </div>
              )}
            </div>

            {/* Extracted Fields Table */}
            {selectedDoc.extractedData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Vendor / Supplier</span>
                  <p className="font-bold text-neutral-900 mt-0.5">{selectedDoc.extractedData.vendor || 'N/A'}</p>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Customer / Buyer</span>
                  <p className="font-bold text-neutral-900 mt-0.5">{selectedDoc.extractedData.customer || 'N/A'}</p>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Invoice / Ref Code</span>
                  <p className="font-mono font-bold text-neutral-900 mt-0.5">
                    {selectedDoc.extractedData.invoiceNumber || 'N/A'}
                  </p>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Due Date / Settlement</span>
                  <p className="font-bold text-neutral-900 mt-0.5">{selectedDoc.extractedData.dueDate || 'Immediate'}</p>
                </div>
              </div>
            )}

            {/* Line items if any */}
            {selectedDoc.extractedData?.lineItems && selectedDoc.extractedData.lineItems.length > 0 && (
              <div>
                <h5 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">
                  Extracted Line Items
                </h5>
                <div className="border border-neutral-200 rounded-xl overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold">
                      <tr>
                        <th className="p-3">Item Description</th>
                        <th className="p-3 text-right">Quantity</th>
                        <th className="p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {selectedDoc.extractedData.lineItems.map((li, i) => (
                        <tr key={i} className="hover:bg-neutral-50/50">
                          <td className="p-3 text-neutral-800">{li.description}</td>
                          <td className="p-3 text-right text-neutral-600">{li.quantity || '-'}</td>
                          <td className="p-3 text-right font-bold text-neutral-900">
                            {li.amount ? <Currency amount={li.amount} symbol={symbol} /> : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Important Clauses & Risks */}
            {selectedDoc.extractedData?.importantClauses && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Important Clauses & Terms
                </h5>
                <ul className="space-y-1.5 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  {selectedDoc.extractedData.importantClauses.map((c, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedDoc.extractedData?.risks && selectedDoc.extractedData.risks.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Identified Operational & Financial Risks
                </h5>
                <ul className="space-y-1.5 text-xs text-rose-800 bg-rose-50 p-3 rounded-xl border border-rose-200">
                  {selectedDoc.extractedData.risks.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-neutral-200 flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => handleConvertToExpense(selectedDoc)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Log as Expense</span>
              </button>

              <button
                onClick={() => handleConvertToInvoice(selectedDoc)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Create Invoice</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
