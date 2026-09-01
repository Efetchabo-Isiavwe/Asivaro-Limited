import React from 'react';
import {
  LayoutDashboard,
  MessageSquareCode,
  FileText,
  Users,
  Receipt,
  CreditCard,
  CheckSquare,
  Sparkles,
  BarChart3,
  Settings,
  Building2,
  ChevronDown,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBusinessData } from '../../context/BusinessDataContext';

export type NavigationTab =
  | 'dashboard'
  | 'ask-asivaro'
  | 'documents'
  | 'customers'
  | 'invoices'
  | 'expenses'
  | 'tasks'
  | 'insights'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
}) => {
  const { currentOrg, userRole, isDemoMode, userOrganizations, switchOrganization } = useAuth();
  const { metrics } = useBusinessData();

  const navItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ask-asivaro', label: 'Ask Asivaro', icon: MessageSquareCode, badge: 'AI Copilot', badgeColor: 'bg-emerald-100 text-emerald-800' },
    { id: 'documents', label: 'Documents', icon: FileText, badge: 'OCR', badgeColor: 'bg-blue-100 text-blue-800' },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'expenses', label: 'Expenses', icon: CreditCard },
    {
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      badge: metrics.openTasksCount > 0 ? metrics.openTasksCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 font-semibold'
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: Sparkles,
      badge: metrics.urgentCount + metrics.risksCount > 0 ? `${metrics.urgentCount + metrics.risksCount}` : undefined,
      badgeColor: 'bg-rose-100 text-rose-800 font-semibold'
    },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/60 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        id="main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-neutral-950 text-neutral-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-5 py-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-950">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">ASIVARO</span>
                <span className="text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                  OPS AI
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 tracking-tight">African Business OS</p>
            </div>
          </div>
        </div>

        {/* Active Organization Switcher / Pill */}
        <div className="px-4 py-3 border-b border-neutral-800/80 bg-neutral-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300 shrink-0">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-neutral-200 truncate">
                  {currentOrg?.name || 'Acme Distribution'}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-neutral-400">
                  <span>{currentOrg?.currency || 'NGN'}</span>
                  <span>•</span>
                  <span>{currentOrg?.country || 'Nigeria'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-emerald-400 border border-neutral-700">
                {userRole}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950 font-bold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-emerald-700 text-white' : item.badgeColor || 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* AI Engine Status footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950/80">
          <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-neutral-200">Gemini 2.5 Active</span>
              </div>
              <span className="text-[10px] text-neutral-400">Server-Side</span>
            </div>
            <p className="text-[10px] text-neutral-400 leading-tight">
              Enterprise SME decision engine protecting real-time cash flow.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
