export type UserRole = 'Owner' | 'Admin' | 'Manager' | 'Analyst' | 'Staff';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  currentOrgId?: string;
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  tagline?: string;
  currency: string;
  currencySymbol: string;
  country: string;
  industry: string;
  taxId?: string;
  address?: string;
  phone?: string;
  email?: string;
  ownerId: string;
  createdAt: string;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
  joinedAt: string;
}

export type PaymentHealth = 'Good' | 'Slow' | 'At Risk' | 'Overdue';

export interface Customer {
  id: string;
  organizationId: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  totalPurchases: number;
  outstandingBalance: number;
  paymentTerms: string;
  creditLimit: number;
  paymentHealth: PaymentHealth;
  lastOrderDate: string;
  notes?: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  organizationId: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  totalPurchases: number;
  balanceDue: number;
  rating: number;
}

export interface Product {
  id: string;
  organizationId: string;
  sku: string;
  name: string;
  category: string;
  unitCost: number;
  unitPrice: number;
  stockQuantity: number;
  reorderLevel: number;
  unit: string;
  marginPercentage: number;
}

export type TransactionType = 'INCOME' | 'EXPENSE' | 'RECEIVABLE_PAYMENT' | 'PAYABLE_PAYMENT';
export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FLAGGED';

export interface Transaction {
  id: string;
  organizationId: string;
  type: TransactionType;
  description: string;
  amount: number;
  currency: string;
  category: string;
  date: string;
  referenceNumber: string;
  paymentMethod: string;
  relatedCustomerId?: string;
  relatedCustomerName?: string;
  relatedInvoiceId?: string;
  status: TransactionStatus;
}

export type ExpenseCategory = 
  | 'Inventory'
  | 'Logistics'
  | 'Logistics & Freight'
  | 'Payroll'
  | 'Payroll & Wages'
  | 'Utilities'
  | 'Diesel & Power'
  | 'Fuel & Power'
  | 'Marketing'
  | 'Maintenance'
  | 'Taxes & Levies'
  | 'Rent'
  | 'Rent & Warehouse'
  | 'Professional Fees'
  | 'Supplies'
  | 'Operations'
  | 'Other';

export interface Expense {
  id: string;
  organizationId: string;
  title: string;
  vendor: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  date: string;
  paymentMethod: string;
  receiptUrl?: string;
  receiptFileName?: string;
  isTaxDeductible: boolean;
  isAnomalous?: boolean;
  anomalyReason?: string;
  loggedBy: string;
  createdAt: string;
}

export type InvoiceStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL' | 'DRAFT';

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  organizationId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  issueDate: string;
  dueDate: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  status: InvoiceStatus;
  paymentTerms: string;
  notes?: string;
  createdAt: string;
}

export type DocumentType = 'INVOICE' | 'RECEIPT' | 'CONTRACT' | 'BANK_STATEMENT' | 'WAYBILL' | 'TAX_DOCUMENT' | 'OTHER';
export type DocumentStatus = 'PROCESSING' | 'EXTRACTED' | 'VERIFIED' | 'FAILED';

export interface DocumentExtractedData {
  documentType: DocumentType;
  date?: string;
  vendor?: string;
  customer?: string;
  amount?: number;
  currency?: string;
  invoiceNumber?: string;
  lineItems?: Array<{ description: string; quantity?: number; amount?: number }>;
  dueDate?: string;
  importantClauses?: string[];
  risks?: string[];
  taxDetails?: string;
  summary?: string;
}

export interface BusinessDocument {
  id: string;
  organizationId: string;
  title: string;
  originalFileName: string;
  fileType: 'pdf' | 'csv' | 'xlsx' | 'docx' | 'image';
  fileSize: number;
  uploadDate: string;
  status: DocumentStatus;
  extractedData?: DocumentExtractedData;
  rawTextPreview?: string;
  createdBy: string;
}

export type TaskPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';

export interface Task {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  assignee: string;
  status: TaskStatus;
  sourceInsight?: string;
  sourceSection?: 'URGENT' | 'RISKS' | 'OPPORTUNITIES' | 'OBSERVATIONS' | 'CHAT' | 'DOCUMENT' | 'MANUAL';
  createdAt: string;
  completedAt?: string;
}

export type InsightSeverity = 'CRITICAL' | 'WARNING' | 'OPPORTUNITY' | 'INFO';
export type InsightCategory = 'Financial' | 'Operational' | 'Customer Risk' | 'Growth Opportunity' | 'Compliance & Tax' | 'Inventory' | 'Receivables' | 'CashFlow' | 'Procurement' | 'Sales' | 'Compliance' | 'Other';
export type InsightSection = 'URGENT' | 'RISKS' | 'OPPORTUNITIES' | 'OBSERVATIONS';

export interface Insight {
  id: string;
  organizationId: string;
  title: string;
  category: InsightCategory;
  severity: InsightSeverity;
  section: InsightSection;
  explanation?: string;
  evidence: string;
  impact: string;
  recommendation: string;
  suggestedActions: string[];
  resolved: boolean;
  generatedAt: string;
  detectedAt?: string;
}

export type AgentRole = 'analyst' | 'finance' | 'operations' | 'executive' | 'document' | 'action';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agent?: AgentRole;
  structuredData?: any;
  actionableInsights?: Array<{
    title: string;
    priority: TaskPriority;
    action: string;
  }>;
}

export interface AIConversation {
  id: string;
  organizationId: string;
  agentType: AgentRole;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export type ReportType = 'WEEKLY_BUSINESS' | 'MONTHLY_MANAGEMENT' | 'FINANCIAL_SUMMARY' | 'OPERATIONS_SUMMARY' | 'RISK_COMPLIANCE';

export interface ExecutiveReport {
  id: string;
  organizationId: string;
  reportType: ReportType;
  title: string;
  period: string;
  generatedAt: string;
  executiveSummary: string;
  keyMetrics: {
    revenue: number;
    expenses: number;
    netProfit: number;
    netMarginPercentage: number;
    overdueReceivables: number;
    runwayMonths: number;
    cashBalance: number;
  };
  sections: Array<{
    heading: string;
    content: string;
    bulletPoints?: string[];
  }>;
  strategicPriorities: string[];
  risksAndMitigations: Array<{
    risk: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    mitigation: string;
  }>;
  generatedBy: string;
}
