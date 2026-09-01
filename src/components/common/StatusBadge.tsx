import React from 'react';
import { PaymentHealth, InvoiceStatus, TaskPriority, TaskStatus, DocumentStatus, InsightSeverity } from '../../types';

interface StatusBadgeProps {
  status: PaymentHealth | InvoiceStatus | TaskPriority | TaskStatus | DocumentStatus | InsightSeverity | string;
  type?: 'health' | 'invoice' | 'priority' | 'task' | 'document' | 'severity';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type, className = '' }) => {
  const getBadgeStyle = () => {
    switch (status) {
      // Payment Health / Invoices
      case 'Good':
      case 'PAID':
      case 'COMPLETED':
      case 'VERIFIED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Slow':
      case 'PENDING':
      case 'IN_PROGRESS':
      case 'EXTRACTED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'At Risk':
      case 'PARTIAL':
      case 'REVIEW':
      case 'PROCESSING':
      case 'WARNING':
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Overdue':
      case 'OVERDUE':
      case 'FAILED':
      case 'CRITICAL':
      case 'URGENT':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'OPPORTUNITY':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'DRAFT':
      case 'TODO':
      case 'LOW':
      case 'INFO':
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80" />
      {status.replace(/_/g, ' ')}
    </span>
  );
};
