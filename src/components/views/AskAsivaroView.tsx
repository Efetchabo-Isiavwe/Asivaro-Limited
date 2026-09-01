import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Plus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Briefcase,
  DollarSign,
  Truck,
  ShieldAlert,
  Zap,
  RotateCcw,
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useBusinessData } from '../../context/BusinessDataContext';
import { useAuth } from '../../context/AuthContext';
import { AgentRole, ChatMessage, TaskPriority } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export const AskAsivaroView: React.FC = () => {
  const { currentOrg } = useAuth();
  const {
    metrics,
    customers,
    invoices,
    expenses,
    products,
    tasks,
    addTask
  } = useBusinessData();

  const [activeAgent, setActiveAgent] = useState<AgentRole>('analyst');
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedTasks, setAddedTasks] = useState<Record<string, boolean>>({});

  const initialGreeting: ChatMessage = {
    id: 'msg_welcome',
    role: 'assistant',
    agent: 'analyst',
    content: `Hello! I am **ASIVAROOPS AI**, your dedicated AI Business Operating System.

I have full real-time access to **${currentOrg?.name || 'Acme Distribution Nigeria'}**'s ledger, including:
- **₦${metrics.overdueReceivables.toLocaleString()}** in overdue receivables across ${customers.length} customer accounts.
- **₦${metrics.totalExpenses.toLocaleString()}** in August operating expenses (including recent diesel power spikes).
- **${products.length}** catalog products and current inventory replenishment levels.

How can I help you analyze, troubleshoot, or optimize your business operations today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const exampleQuestions = [
    'Why did expenses increase?',
    'Which customers owe us money?',
    'What products are performing best?',
    'What should I prioritize today?',
    'Summarize this month\'s performance.',
    'Identify unusual transactions.',
    'Find business risks.',
    'Identify growth opportunities.'
  ];

  const agentDescriptions: Record<AgentRole, { label: string; icon: any; color: string; desc: string }> = {
    analyst: {
      label: 'Analyst Agent',
      icon: Sparkles,
      color: 'bg-emerald-600',
      desc: 'Sales mix, inventory velocity, anomalies & growth trends',
    },
    finance: {
      label: 'Finance Agent',
      icon: DollarSign,
      color: 'bg-blue-600',
      desc: 'Cash-flow runway, overdue receivables & OpEx containment',
    },
    operations: {
      label: 'Operations Agent',
      icon: Truck,
      color: 'bg-amber-600',
      desc: 'Logistics, diesel generators, stockouts & supply chain',
    },
    executive: {
      label: 'Executive Agent',
      icon: Briefcase,
      color: 'bg-purple-600',
      desc: 'Strategic capital allocation & boardroom decision support',
    },
    document: {
      label: 'Document Agent',
      icon: HelpCircle,
      color: 'bg-neutral-700',
      desc: 'Contract risk extraction, waybills & invoice reconciliation',
    },
    action: {
      label: 'Action Agent',
      icon: Zap,
      color: 'bg-rose-600',
      desc: 'Operational task assignments, SOPs & accountability',
    },
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery.trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      // Build rich context payload
      const contextPayload = {
        organizationName: currentOrg?.name,
        currency: currentOrg?.currency || 'NGN',
        currencySymbol: currentOrg?.currencySymbol || '₦',
        industry: currentOrg?.industry,
        location: currentOrg?.address || 'Lagos, Nigeria',
        customersCount: customers.length,
        invoicesCount: invoices.length,
        overdueReceivables: metrics.overdueReceivables,
        totalExpenses: metrics.totalExpenses,
        runwayMonths: metrics.runwayMonths,
        customersSummary: customers.map((c) => ({
          name: c.name,
          balance: c.outstandingBalance,
          health: c.paymentHealth,
          city: c.city,
        })),
        invoicesSummary: invoices.slice(0, 10).map((i) => ({
          inv: i.invoiceNumber,
          customer: i.customerName,
          total: i.totalAmount,
          due: i.dueDate,
          status: i.status,
        })),
        expensesSummary: expenses.slice(0, 8).map((e) => ({
          title: e.title,
          vendor: e.vendor,
          amount: e.amount,
          cat: e.category,
          anomalous: e.isAnomalous,
        })),
        lowStockProducts: products.filter((p) => p.stockQuantity <= p.reorderLevel).map((p) => ({
          name: p.name,
          stock: p.stockQuantity,
          reorder: p.reorderLevel,
        })),
      };

      const res = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          agentRole: activeAgent,
          contextData: contextPayload,
          conversationHistory: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error('Failed to reach AI endpoint');
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        agent: activeAgent,
        content: data.answer || 'Analysis complete.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionableInsights: data.actionableInsights || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        agent: activeAgent,
        content: `I encountered an issue connecting to the server: ${err.message || 'Please check connection'}. Please try asking again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertToAction = async (actionItem: { title: string; priority: TaskPriority; action: string; targetAssignee?: string; suggestedDueDate?: string }, msgId: string, idx: number) => {
    const taskKey = `${msgId}_${idx}`;
    await addTask({
      title: actionItem.title,
      description: actionItem.action,
      priority: actionItem.priority || 'HIGH',
      dueDate: actionItem.suggestedDueDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      assignee: actionItem.targetAssignee || 'Operations Team',
      status: 'TODO',
      sourceSection: 'CHAT',
    });

    setAddedTasks((prev) => ({ ...prev, [taskKey]: true }));
  };

  const clearChat = () => {
    setMessages([initialGreeting]);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
      {/* Top Agent Switcher Toolbar */}
      <div className="p-4 border-b border-neutral-200 bg-neutral-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          {(['analyst', 'finance', 'operations', 'executive', 'action'] as AgentRole[]).map((agentKey) => {
            const ag = agentDescriptions[agentKey];
            const Icon = ag.icon;
            const isSelected = activeAgent === agentKey;
            return (
              <button
                key={agentKey}
                id={`agent-tab-${agentKey}`}
                onClick={() => setActiveAgent(agentKey)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? `${ag.color} text-white shadow-sm font-bold`
                    : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
                }`}
                title={ag.desc}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{ag.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-neutral-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Chat</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-neutral-900 text-white'
                    : 'bg-gradient-to-tr from-emerald-600 to-emerald-400 text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div
                className={`rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                  isUser
                    ? 'bg-neutral-900 text-white rounded-tr-none'
                    : 'bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-tl-none shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] opacity-70 mb-1">
                  <span className="font-bold uppercase tracking-wider">
                    {isUser ? 'You' : `Asivaro ${msg.agent ? agentDescriptions[msg.agent]?.label : 'AI'}`}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Body with formatting */}
                <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                  {msg.content.replace(/```json[\s\S]*?```/g, '')}
                </div>

                {/* Actionable recommendations card if present */}
                {msg.actionableInsights && msg.actionableInsights.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-neutral-200/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                      <Zap className="w-4 h-4 text-emerald-600" />
                      <span>Recommended Operational Actions ({msg.actionableInsights.length})</span>
                    </div>

                    <div className="space-y-2">
                      {msg.actionableInsights.map((actionItem, idx) => {
                        const taskKey = `${msg.id}_${idx}`;
                        const isAdded = addedTasks[taskKey];
                        return (
                          <div
                            key={idx}
                            className="bg-white p-3 rounded-xl border border-neutral-200 flex items-start justify-between gap-3 shadow-2xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <StatusBadge status={actionItem.priority || 'HIGH'} />
                                <span className="font-bold text-xs text-neutral-900">
                                  {actionItem.title}
                                </span>
                              </div>
                              <p className="text-[11px] text-neutral-600 leading-normal">
                                {actionItem.action}
                              </p>
                              {actionItem.targetAssignee && (
                                <p className="text-[10px] text-neutral-400">
                                  Suggested Assignee: <strong>{actionItem.targetAssignee}</strong>
                                </p>
                              )}
                            </div>

                            <button
                              id={`btn-add-action-task-${idx}`}
                              onClick={() => handleConvertToAction(actionItem, msg.id, idx)}
                              disabled={isAdded}
                              className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                isAdded
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Task Created</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add Task</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl rounded-tl-none p-4 text-xs text-neutral-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>Asivaro {agentDescriptions[activeAgent].label} is analyzing business data...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Question Pills */}
      <div className="px-4 py-2 bg-neutral-50/50 border-t border-neutral-200/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-[11px] font-bold text-neutral-400 shrink-0 uppercase tracking-wider">
          Suggested:
        </span>
        {exampleQuestions.map((q) => (
          <button
            key={q}
            onClick={() => handleSendMessage(q)}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-neutral-700 hover:text-emerald-700 border border-neutral-200 hover:border-emerald-200 text-xs font-medium whitespace-nowrap transition-all disabled:opacity-50 shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t border-neutral-200 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            id="input-ask-asivaro"
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={`Ask ${agentDescriptions[activeAgent].label} anything (e.g. Why did expenses increase? Which debtors owe money?)...`}
            className="flex-1 px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-neutral-900 placeholder:text-neutral-400 transition-all"
            disabled={isLoading}
          />

          <button
            id="btn-send-asivaro"
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="p-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl font-bold transition-all disabled:opacity-40 disabled:scale-100 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
