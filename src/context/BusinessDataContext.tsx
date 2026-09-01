import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import {
  Customer,
  Supplier,
  Product,
  Transaction,
  Expense,
  Invoice,
  BusinessDocument,
  Task,
  Insight,
  ExecutiveReport,
  OrganizationMember,
  TaskPriority,
  TaskStatus,
  ReportType
} from '../types';
import {
  demoCustomers,
  demoSuppliers,
  demoProducts,
  demoInvoices,
  demoExpenses,
  demoTransactions,
  demoDocuments,
  demoInsights,
  demoTasks,
  demoReports,
  demoMembers,
  DEMO_ORG_ID
} from '../lib/demoData';

interface BusinessDataContextType {
  customers: Customer[];
  suppliers: Supplier[];
  products: Product[];
  invoices: Invoice[];
  expenses: Expense[];
  transactions: Transaction[];
  documents: BusinessDocument[];
  tasks: Task[];
  insights: Insight[];
  reports: ExecutiveReport[];
  members: OrganizationMember[];
  isLoading: boolean;
  isAiAuditing: boolean;
  metrics: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    netMargin: number;
    outstandingInvoices: number;
    overdueReceivables: number;
    paidInvoices: number;
    runwayMonths: number;
    cashBalance: number;
    openTasksCount: number;
    urgentCount: number;
    risksCount: number;
    opportunitiesCount: number;
  };
  // Actions
  addCustomer: (cust: Omit<Customer, 'id' | 'organizationId' | 'createdAt'>) => Promise<Customer>;
  updateCustomer: (id: string, cust: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  addInvoice: (inv: Omit<Invoice, 'id' | 'organizationId' | 'createdAt'>) => Promise<Invoice>;
  updateInvoice: (id: string, inv: Partial<Invoice>) => Promise<void>;
  markInvoicePaid: (id: string, amount?: number) => Promise<void>;
  addExpense: (exp: Omit<Expense, 'id' | 'organizationId' | 'createdAt'>) => Promise<Expense>;
  deleteExpense: (id: string) => Promise<void>;
  addProduct: (prod: Omit<Product, 'id' | 'organizationId'>) => Promise<Product>;
  updateProduct: (id: string, prod: Partial<Product>) => Promise<void>;
  addDocument: (docItem: Omit<BusinessDocument, 'id' | 'organizationId' | 'uploadDate'>) => Promise<BusinessDocument>;
  processDocumentWithAI: (docId: string, fileData: { fileName: string; textContent?: string; base64Data?: string; mimeType?: string }) => Promise<BusinessDocument | null>;
  convertDocumentToExpense: (docItem: BusinessDocument) => Promise<Expense>;
  convertDocumentToInvoice: (docItem: BusinessDocument) => Promise<Invoice>;
  addTask: (task: Omit<Task, 'id' | 'organizationId' | 'createdAt'>) => Promise<Task>;
  updateTaskStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  convertInsightToTask: (insight: Insight, priority?: TaskPriority) => Promise<Task>;
  runAiAudit: () => Promise<Insight[]>;
  generateReport: (reportType: ReportType) => Promise<ExecutiveReport | null>;
  resetToDemoData: () => Promise<void>;
}

const BusinessDataContext = createContext<BusinessDataContextType | undefined>(undefined);

export const BusinessDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentOrg, isDemoMode, currentUser } = useAuth();
  const orgId = currentOrg?.id || DEMO_ORG_ID;

  const [customers, setCustomers] = useState<Customer[]>(demoCustomers);
  const [suppliers, setSuppliers] = useState<Supplier[]>(demoSuppliers);
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [invoices, setInvoices] = useState<Invoice[]>(demoInvoices);
  const [expenses, setExpenses] = useState<Expense[]>(demoExpenses);
  const [transactions, setTransactions] = useState<Transaction[]>(demoTransactions);
  const [documents, setDocuments] = useState<BusinessDocument[]>(demoDocuments);
  const [tasks, setTasks] = useState<Task[]>(demoTasks);
  const [insights, setInsights] = useState<Insight[]>(demoInsights);
  const [reports, setReports] = useState<ExecutiveReport[]>(demoReports);
  const [members, setMembers] = useState<OrganizationMember[]>(demoMembers);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAiAuditing, setIsAiAuditing] = useState<boolean>(false);

  // Load org data from Firestore when orgId changes
  useEffect(() => {
    if (!orgId) return;

    // If active is Demo Org, initialize with rich demo state
    if (orgId === DEMO_ORG_ID || isDemoMode) {
      setCustomers(demoCustomers);
      setSuppliers(demoSuppliers);
      setProducts(demoProducts);
      setInvoices(demoInvoices);
      setExpenses(demoExpenses);
      setTransactions(demoTransactions);
      setDocuments(demoDocuments);
      setTasks(demoTasks);
      setInsights(demoInsights);
      setReports(demoReports);
      setMembers(demoMembers);
      return;
    }

    const loadOrgData = async () => {
      setIsLoading(true);
      try {
        const fetchCol = async <T,>(colName: string): Promise<T[]> => {
          const q = query(collection(db, colName), where('organizationId', '==', orgId));
          const snap = await getDocs(q);
          return snap.docs.map((d) => d.data() as T);
        };

        const [
          custs,
          supps,
          prods,
          invs,
          exps,
          txs,
          docsList,
          tsks,
          ins,
          reps,
          mems
        ] = await Promise.all([
          fetchCol<Customer>('customers'),
          fetchCol<Supplier>('suppliers'),
          fetchCol<Product>('products'),
          fetchCol<Invoice>('invoices'),
          fetchCol<Expense>('expenses'),
          fetchCol<Transaction>('transactions'),
          fetchCol<BusinessDocument>('documents'),
          fetchCol<Task>('tasks'),
          fetchCol<Insight>('insights'),
          fetchCol<ExecutiveReport>('reports'),
          fetchCol<OrganizationMember>('organizationMembers'),
        ]);

        // If newly created workspace is empty, seed initial baseline so it's not totally blank
        if (custs.length === 0 && invs.length === 0) {
          setCustomers(demoCustomers.map((c) => ({ ...c, organizationId: orgId })));
          setSuppliers(demoSuppliers.map((s) => ({ ...s, organizationId: orgId })));
          setProducts(demoProducts.map((p) => ({ ...p, organizationId: orgId })));
          setInvoices(demoInvoices.map((i) => ({ ...i, organizationId: orgId })));
          setExpenses(demoExpenses.map((e) => ({ ...e, organizationId: orgId })));
          setTransactions(demoTransactions.map((t) => ({ ...t, organizationId: orgId })));
          setDocuments(demoDocuments.map((d) => ({ ...d, organizationId: orgId })));
          setTasks(demoTasks.map((t) => ({ ...t, organizationId: orgId })));
          setInsights(demoInsights.map((i) => ({ ...i, organizationId: orgId })));
          setReports(demoReports.map((r) => ({ ...r, organizationId: orgId })));
          setMembers(demoMembers.map((m) => ({ ...m, organizationId: orgId })));
        } else {
          setCustomers(custs);
          setSuppliers(supps);
          setProducts(prods);
          setInvoices(invs);
          setExpenses(exps);
          setTransactions(txs);
          setDocuments(docsList);
          setTasks(tsks);
          setInsights(ins);
          setReports(reps);
          setMembers(mems.length > 0 ? mems : demoMembers);
        }
      } catch (err) {
        console.warn('Firestore load failed, maintaining memory state:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrgData();
  }, [orgId, isDemoMode]);

  // Aggregate high-precision metrics
  const metrics = useMemo(() => {
    const totalRevenue = invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0) +
      transactions.filter(t => t.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);

    const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    const outstandingInvoices = invoices
      .filter((inv) => inv.status === 'PENDING' || inv.status === 'OVERDUE' || inv.status === 'PARTIAL')
      .reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);

    const overdueReceivables = invoices
      .filter((inv) => inv.status === 'OVERDUE')
      .reduce((acc, inv) => acc + (inv.balanceDue || 0), 0);

    const paidInvoices = invoices
      .filter((inv) => inv.status === 'PAID')
      .reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);

    const cashBalance = 19450000 + (totalRevenue - totalExpenses);
    const monthlyBurn = totalExpenses > 0 ? totalExpenses : 8000000;
    const runwayMonths = Math.max(0.5, Number((cashBalance / monthlyBurn).toFixed(1)));

    const openTasksCount = tasks.filter((t) => t.status !== 'COMPLETED').length;
    const urgentCount = insights.filter((i) => i.section === 'URGENT' && !i.resolved).length;
    const risksCount = insights.filter((i) => i.section === 'RISKS' && !i.resolved).length;
    const opportunitiesCount = insights.filter((i) => i.section === 'OPPORTUNITIES' && !i.resolved).length;

    return {
      totalRevenue,
      totalExpenses,
      netProfit,
      netMargin,
      outstandingInvoices,
      overdueReceivables,
      paidInvoices,
      runwayMonths,
      cashBalance,
      openTasksCount,
      urgentCount,
      risksCount,
      opportunitiesCount,
    };
  }, [invoices, expenses, transactions, tasks, insights]);

  // Firestore helper to persist safely
  const persistToFirestore = async (col: string, id: string, data: any) => {
    if (!isDemoMode) {
      try {
        await setDoc(doc(db, col, id), data);
      } catch (e) {
        console.warn(`Failed to persist to Firestore (${col}):`, e);
      }
    }
  };

  // 1. Customer CRUD
  const addCustomer = async (cust: Omit<Customer, 'id' | 'organizationId' | 'createdAt'>): Promise<Customer> => {
    const id = `cust_${Date.now()}`;
    const newCust: Customer = {
      ...cust,
      id,
      organizationId: orgId,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    await persistToFirestore('customers', id, newCust);
    return newCust;
  };

  const updateCustomer = async (id: string, patch: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    if (!isDemoMode) {
      try {
        await setDoc(doc(db, 'customers', id), patch, { merge: true });
      } catch (e) {
        console.warn('Customer update error:', e);
      }
    }
  };

  const deleteCustomer = async (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (!isDemoMode) {
      try {
        await deleteDoc(doc(db, 'customers', id));
      } catch (e) {
        console.warn('Customer delete error:', e);
      }
    }
  };

  // 2. Invoice CRUD
  const addInvoice = async (inv: Omit<Invoice, 'id' | 'organizationId' | 'createdAt'>): Promise<Invoice> => {
    const id = `inv_${Date.now()}`;
    const newInv: Invoice = {
      ...inv,
      id,
      organizationId: orgId,
      createdAt: new Date().toISOString(),
    };
    setInvoices((prev) => [newInv, ...prev]);
    await persistToFirestore('invoices', id, newInv);
    return newInv;
  };

  const updateInvoice = async (id: string, patch: Partial<Invoice>) => {
    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...patch } : inv)));
    if (!isDemoMode) {
      try {
        await setDoc(doc(db, 'invoices', id), patch, { merge: true });
      } catch (e) {
        console.warn('Invoice update error:', e);
      }
    }
  };

  const markInvoicePaid = async (id: string, amountPaidCustom?: number) => {
    const target = invoices.find((i) => i.id === id);
    if (!target) return;

    const fullAmount = target.totalAmount;
    const paid = amountPaidCustom !== undefined ? amountPaidCustom : fullAmount;
    const balance = Math.max(0, fullAmount - paid);
    const status: Invoice['status'] = balance === 0 ? 'PAID' : 'PARTIAL';

    const patch: Partial<Invoice> = {
      amountPaid: paid,
      balanceDue: balance,
      status,
    };

    setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...patch } : inv)));

    // Create a transaction record
    const txId = `tx_${Date.now()}`;
    const tx: Transaction = {
      id: txId,
      organizationId: orgId,
      type: 'RECEIVABLE_PAYMENT',
      description: `Payment received for ${target.invoiceNumber} (${target.customerName})`,
      amount: paid,
      currency: currentOrg?.currency || 'NGN',
      category: 'Sales Inflow',
      date: new Date().toISOString().split('T')[0],
      referenceNumber: `REC-${Date.now().toString().slice(-6)}`,
      paymentMethod: 'Bank Transfer',
      relatedCustomerId: target.customerId,
      relatedCustomerName: target.customerName,
      relatedInvoiceId: target.id,
      status: 'COMPLETED',
    };
    setTransactions((prev) => [tx, ...prev]);

    await persistToFirestore('invoices', id, patch);
    await persistToFirestore('transactions', txId, tx);
  };

  // 3. Expense CRUD
  const addExpense = async (exp: Omit<Expense, 'id' | 'organizationId' | 'createdAt'>): Promise<Expense> => {
    const id = `exp_${Date.now()}`;
    const newExp: Expense = {
      ...exp,
      id,
      organizationId: orgId,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExp, ...prev]);

    // Create an automatic transaction record
    const txId = `tx_${Date.now()}`;
    const tx: Transaction = {
      id: txId,
      organizationId: orgId,
      type: 'EXPENSE',
      description: newExp.title,
      amount: newExp.amount,
      currency: newExp.currency,
      category: newExp.category,
      date: newExp.date,
      referenceNumber: `EXP-${Date.now().toString().slice(-6)}`,
      paymentMethod: newExp.paymentMethod,
      status: 'COMPLETED',
    };
    setTransactions((prev) => [tx, ...prev]);

    await persistToFirestore('expenses', id, newExp);
    await persistToFirestore('transactions', txId, tx);
    return newExp;
  };

  const deleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    if (!isDemoMode) {
      try {
        await deleteDoc(doc(db, 'expenses', id));
      } catch (e) {
        console.warn('Expense delete error:', e);
      }
    }
  };

  // 4. Product CRUD
  const addProduct = async (prod: Omit<Product, 'id' | 'organizationId'>): Promise<Product> => {
    const id = `prod_${Date.now()}`;
    const newProd: Product = {
      ...prod,
      id,
      organizationId: orgId,
    };
    setProducts((prev) => [newProd, ...prev]);
    await persistToFirestore('products', id, newProd);
    return newProd;
  };

  const updateProduct = async (id: string, patch: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    if (!isDemoMode) {
      try {
        await setDoc(doc(db, 'products', id), patch, { merge: true });
      } catch (e) {
        console.warn('Product update error:', e);
      }
    }
  };

  // 5. Document Processing
  const addDocument = async (docItem: Omit<BusinessDocument, 'id' | 'organizationId' | 'uploadDate'>): Promise<BusinessDocument> => {
    const id = `doc_${Date.now()}`;
    const newDoc: BusinessDocument = {
      ...docItem,
      id,
      organizationId: orgId,
      uploadDate: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    await persistToFirestore('documents', id, newDoc);
    return newDoc;
  };

  const processDocumentWithAI = async (
    docId: string,
    fileData: { fileName: string; textContent?: string; base64Data?: string; mimeType?: string }
  ): Promise<BusinessDocument | null> => {
    try {
      // Mark as PROCESSING
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, status: 'PROCESSING' } : d))
      );

      const res = await fetch('/api/ai/document/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fileData),
      });

      if (!res.ok) throw new Error('AI extraction failed');
      const data = await res.json();

      let updatedDoc: BusinessDocument | null = null;
      setDocuments((prev) =>
        prev.map((d) => {
          if (d.id === docId) {
            updatedDoc = {
              ...d,
              status: 'EXTRACTED',
              extractedData: data.extractedData,
            };
            return updatedDoc;
          }
          return d;
        })
      );

      if (updatedDoc) {
        await persistToFirestore('documents', docId, updatedDoc);
      }
      return updatedDoc;
    } catch (e) {
      console.error('Document processing error:', e);
      setDocuments((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, status: 'FAILED' } : d))
      );
      return null;
    }
  };

  const convertDocumentToExpense = async (docItem: BusinessDocument): Promise<Expense> => {
    const ext = docItem.extractedData;
    const exp = await addExpense({
      title: docItem.title || ext?.summary || `Expense from ${docItem.originalFileName}`,
      vendor: ext?.vendor || 'Vendor',
      category: 'Operations',
      amount: ext?.amount || 0,
      currency: ext?.currency || currentOrg?.currency || 'NGN',
      date: ext?.date || new Date().toISOString().split('T')[0],
      paymentMethod: 'Bank Transfer',
      receiptFileName: docItem.originalFileName,
      isTaxDeductible: true,
      loggedBy: currentUser?.displayName || 'Asivaro Operator',
    });

    // Mark doc as VERIFIED
    setDocuments((prev) =>
      prev.map((d) => (d.id === docItem.id ? { ...d, status: 'VERIFIED' } : d))
    );
    return exp;
  };

  const convertDocumentToInvoice = async (docItem: BusinessDocument): Promise<Invoice> => {
    const ext = docItem.extractedData;
    const amount = ext?.amount || 0;
    const subtotal = Math.round(amount / 1.075);
    const vatAmount = amount - subtotal;

    const inv = await addInvoice({
      invoiceNumber: ext?.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
      customerId: 'cust_01',
      customerName: ext?.customer || 'Direct Customer',
      customerEmail: '',
      customerPhone: '',
      issueDate: ext?.date || new Date().toISOString().split('T')[0],
      dueDate: ext?.dueDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      lineItems: (ext?.lineItems && ext.lineItems.length > 0)
        ? ext.lineItems.map((li, idx) => ({
            id: `li_${idx}`,
            description: li.description,
            quantity: li.quantity || 1,
            unitPrice: li.amount || amount,
            total: li.amount || amount,
          }))
        : [
            {
              id: 'li_0',
              description: docItem.title,
              quantity: 1,
              unitPrice: amount,
              total: amount,
            },
          ],
      subtotal,
      vatRate: 7.5,
      vatAmount,
      totalAmount: amount,
      amountPaid: 0,
      balanceDue: amount,
      status: 'PENDING',
      paymentTerms: 'Net 30',
      notes: `Generated from Document: ${docItem.originalFileName}`,
    });

    setDocuments((prev) =>
      prev.map((d) => (d.id === docItem.id ? { ...d, status: 'VERIFIED' } : d))
    );
    return inv;
  };

  // 6. Tasks (Action Center)
  const addTask = async (task: Omit<Task, 'id' | 'organizationId' | 'createdAt'>): Promise<Task> => {
    const id = `task_${Date.now()}`;
    const newTask: Task = {
      ...task,
      id,
      organizationId: orgId,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    await persistToFirestore('tasks', id, newTask);
    return newTask;
  };

  const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
    const completedAt = status === 'COMPLETED' ? new Date().toISOString() : undefined;
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status, completedAt } : t))
    );
    if (!isDemoMode) {
      try {
        await setDoc(doc(db, 'tasks', taskId), { status, completedAt }, { merge: true });
      } catch (e) {
        console.warn('Task update error:', e);
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (!isDemoMode) {
      try {
        await deleteDoc(doc(db, 'tasks', taskId));
      } catch (e) {
        console.warn('Task delete error:', e);
      }
    }
  };

  const convertInsightToTask = async (insight: Insight, priority: TaskPriority = 'HIGH'): Promise<Task> => {
    const taskPriority: TaskPriority =
      insight.severity === 'CRITICAL' ? 'URGENT' : insight.severity === 'WARNING' ? 'HIGH' : 'MEDIUM';

    const newTask = await addTask({
      title: insight.recommendation || insight.title,
      description: `${insight.explanation || insight.title}\n\nEvidence: ${insight.evidence}\nImpact: ${insight.impact}`,
      priority: priority || taskPriority,
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      assignee: currentUser?.displayName || 'Operations Lead',
      status: 'TODO',
      sourceInsight: insight.id,
      sourceSection: insight.section,
    });

    // Mark insight as acknowledged/in progress
    setInsights((prev) =>
      prev.map((i) => (i.id === insight.id ? { ...i, resolved: true } : i))
    );
    return newTask;
  };

  // 7. Real-Time AI Business Audit
  const runAiAudit = async (): Promise<Insight[]> => {
    setIsAiAuditing(true);
    try {
      const payload = {
        organizationName: currentOrg?.name,
        currencySymbol: currentOrg?.currencySymbol || '₦',
        data: {
          metrics,
          customers: customers.map((c) => ({
            name: c.name,
            outstanding: c.outstandingBalance,
            health: c.paymentHealth,
            city: c.city,
          })),
          invoices: invoices.slice(0, 10).map((i) => ({
            number: i.invoiceNumber,
            customer: i.customerName,
            total: i.totalAmount,
            balance: i.balanceDue,
            status: i.status,
            dueDate: i.dueDate,
          })),
          expenses: expenses.slice(0, 10).map((e) => ({
            title: e.title,
            vendor: e.vendor,
            amount: e.amount,
            category: e.category,
            anomalous: e.isAnomalous,
          })),
          lowStockProducts: products.filter((p) => p.stockQuantity <= p.reorderLevel),
        },
      };

      const res = await fetch('/api/ai/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('AI Audit failed');
      const data = await res.json();

      if (Array.isArray(data.insights)) {
        const newInsights: Insight[] = data.insights.map((item: any, idx: number) => ({
          id: `ins_${Date.now()}_${idx}`,
          organizationId: orgId,
          title: item.title,
          category: item.category || 'Financial',
          severity: item.severity || 'WARNING',
          section: item.section || 'RISKS',
          explanation: item.explanation,
          evidence: item.evidence,
          impact: item.impact,
          recommendation: item.recommendation,
          suggestedActions: item.suggestedActions || [],
          resolved: false,
          generatedAt: new Date().toISOString(),
        }));

        setInsights(newInsights);
        return newInsights;
      }
      return insights;
    } catch (e) {
      console.error('AI Audit Error:', e);
      return insights;
    } finally {
      setIsAiAuditing(false);
    }
  };

  // 8. Executive Report Generator
  const generateReport = async (reportType: ReportType): Promise<ExecutiveReport | null> => {
    try {
      const payload = {
        reportType,
        organizationName: currentOrg?.name,
        currencySymbol: currentOrg?.currencySymbol || '₦',
        data: {
          metrics,
          topCustomers: customers.slice(0, 5),
          invoicesSummary: invoices.slice(0, 8),
          expensesSummary: expenses.slice(0, 8),
          inventoryStatus: products.map((p) => ({
            name: p.name,
            stock: p.stockQuantity,
            reorderLevel: p.reorderLevel,
          })),
          recentInsights: insights.slice(0, 4),
        },
      };

      const res = await fetch('/api/ai/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Report generation failed');
      const rep = await res.json();

      const newReport: ExecutiveReport = {
        id: `rep_${Date.now()}`,
        organizationId: orgId,
        reportType,
        title: rep.title || `${reportType.replace(/_/g, ' ')}`,
        period: rep.period || 'Current Cycle',
        generatedAt: new Date().toISOString(),
        executiveSummary: rep.executiveSummary,
        keyMetrics: rep.keyMetrics || {
          revenue: metrics.totalRevenue,
          expenses: metrics.totalExpenses,
          netProfit: metrics.netProfit,
          netMarginPercentage: metrics.netMargin,
          overdueReceivables: metrics.overdueReceivables,
          runwayMonths: metrics.runwayMonths,
          cashBalance: metrics.cashBalance,
        },
        sections: rep.sections || [],
        strategicPriorities: rep.strategicPriorities || [],
        risksAndMitigations: rep.risksAndMitigations || [],
        generatedBy: `Asivaro ${currentUser?.displayName || 'Executive'} Agent`,
      };

      setReports((prev) => [newReport, ...prev]);
      await persistToFirestore('reports', newReport.id, newReport);
      return newReport;
    } catch (e) {
      console.error('Report Generation Error:', e);
      return null;
    }
  };

  // 9. Reset to Nigerian SME Demo Data
  const resetToDemoData = async () => {
    setCustomers(demoCustomers);
    setSuppliers(demoSuppliers);
    setProducts(demoProducts);
    setInvoices(demoInvoices);
    setExpenses(demoExpenses);
    setTransactions(demoTransactions);
    setDocuments(demoDocuments);
    setTasks(demoTasks);
    setInsights(demoInsights);
    setReports(demoReports);
    setMembers(demoMembers);
  };

  return (
    <BusinessDataContext.Provider
      value={{
        customers,
        suppliers,
        products,
        invoices,
        expenses,
        transactions,
        documents,
        tasks,
        insights,
        reports,
        members,
        isLoading,
        isAiAuditing,
        metrics,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addInvoice,
        updateInvoice,
        markInvoicePaid,
        addExpense,
        deleteExpense,
        addProduct,
        updateProduct,
        addDocument,
        processDocumentWithAI,
        convertDocumentToExpense,
        convertDocumentToInvoice,
        addTask,
        updateTaskStatus,
        deleteTask,
        convertInsightToTask,
        runAiAudit,
        generateReport,
        resetToDemoData,
      }}
    >
      {children}
    </BusinessDataContext.Provider>
  );
};

export const useBusinessData = () => {
  const context = useContext(BusinessDataContext);
  if (!context) {
    throw new Error('useBusinessData must be used within a BusinessDataProvider');
  }
  return context;
};
