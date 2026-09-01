import React, { useState } from 'react';
import {
  Menu,
  Sparkles,
  RefreshCw,
  LogOut,
  User as UserIcon,
  Shield,
  CheckCircle2,
  ChevronDown,
  Layers,
  Database,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBusinessData } from '../../context/BusinessDataContext';
import { UserRole } from '../../types';
import { NavigationTab } from './Sidebar';

interface HeaderProps {
  activeTab: NavigationTab;
  onOpenSidebar: () => void;
  onNavigate: (tab: NavigationTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenSidebar,
  onNavigate,
}) => {
  const {
    currentUser,
    firebaseUser,
    currentOrg,
    userRole,
    isDemoMode,
    signInWithGoogle,
    logout,
    switchRole,
    userOrganizations,
    switchOrganization
  } = useAuth();

  const { runAiAudit, isAiAuditing, metrics, resetToDemoData } = useBusinessData();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showOrgMenu, setShowOrgMenu] = useState(false);
  const [showAuditToast, setShowAuditToast] = useState(false);

  const getPageTitle = (tab: NavigationTab) => {
    switch (tab) {
      case 'dashboard':
        return { title: 'Executive Operations Dashboard', subtitle: 'Real-time financial vitals & AI priorities' };
      case 'ask-asivaro':
        return { title: 'Ask Asivaro AI Copilot', subtitle: 'Conversational African business & financial analyst' };
      case 'documents':
        return { title: 'Document Intelligence Hub', subtitle: 'AI-assisted OCR extraction & financial parsing' };
      case 'customers':
        return { title: 'Customer & Accounts Receivable', subtitle: 'Customer aging, payment health & credit recovery' };
      case 'invoices':
        return { title: 'Invoicing & Receivables', subtitle: 'Billing lifecycle, VAT compliance & collections' };
      case 'expenses':
        return { title: 'Expense Tracker & Outflows', subtitle: 'Cost center tracking, diesel & anomaly detection' };
      case 'tasks':
        return { title: 'Action Center & Tasks', subtitle: 'Operational execution from AI recommendations' };
      case 'insights':
        return { title: 'AI Business Intelligence & Audits', subtitle: 'Urgent flags, risk radar & commercial opportunities' };
      case 'reports':
        return { title: 'Executive Management Reports', subtitle: 'Boardroom-ready weekly & monthly strategic reviews' };
      case 'settings':
        return { title: 'Organization & Platform Settings', subtitle: 'Workspace members, roles, currency & configurations' };
      default:
        return { title: 'ASIVAROOPS AI', subtitle: 'Business Operating System' };
    }
  };

  const handleRunAudit = async () => {
    await runAiAudit();
    setShowAuditToast(true);
    setTimeout(() => setShowAuditToast(false), 4000);
  };

  const roles: UserRole[] = ['Owner', 'Admin', 'Manager', 'Analyst', 'Staff'];

  const { title, subtitle } = getPageTitle(activeTab);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      {/* Left title & mobile trigger */}
      <div className="flex items-center gap-3">
        <button
          id="btn-toggle-sidebar"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base lg:text-lg font-bold text-neutral-900 leading-none">{title}</h1>
          <p className="text-[11px] text-neutral-500 mt-1 hidden sm:block">{subtitle}</p>
        </div>
      </div>

      {/* Right control group */}
      <div className="flex items-center gap-2.5">
        {/* Quick AI Audit Trigger */}
        <button
          id="btn-run-ai-audit"
          onClick={handleRunAudit}
          disabled={isAiAuditing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 active:scale-95 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
          title="Run live AI business audit across customers, expenses, and invoices"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAiAuditing ? 'animate-spin text-emerald-600' : 'text-emerald-600'}`} />
          <span className="hidden md:inline">{isAiAuditing ? 'Auditing Business...' : 'Run AI Audit'}</span>
          <span className="md:hidden">{isAiAuditing ? 'Auditing...' : 'AI Audit'}</span>
        </button>

        {/* Demo Mode or Google Sign-In Status */}
        {isDemoMode ? (
          <div className="relative">
            <button
              id="btn-role-switcher"
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors font-medium"
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Role:</span>
              <strong className="font-bold">{userRole}</strong>
              <ChevronDown className="w-3 h-3 text-amber-600" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-neutral-100 text-[10px] uppercase font-bold text-neutral-400">
                  Switch Active Role (RBAC)
                </div>
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-neutral-50 ${
                      userRole === r ? 'font-bold text-emerald-600 bg-emerald-50/50' : 'text-neutral-700'
                    }`}
                  >
                    <span>{r}</span>
                    {userRole === r && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
                <div className="p-2 border-t border-neutral-100">
                  <button
                    onClick={() => {
                      signInWithGoogle();
                      setShowRoleMenu(false);
                    }}
                    className="w-full py-1.5 px-2 bg-neutral-900 text-white rounded-lg text-center font-semibold hover:bg-neutral-800"
                  >
                    Sign In with Google
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-100 border border-neutral-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-neutral-800 max-w-[120px] truncate">
                {currentUser?.displayName || currentUser?.email}
              </span>
              <span className="text-[10px] text-neutral-500 uppercase font-bold px-1.5 py-0.2 bg-neutral-200 rounded">
                {userRole}
              </span>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Google Login button if in demo mode */}
        {isDemoMode && (
          <button
            id="btn-google-signin"
            onClick={signInWithGoogle}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 text-white hover:bg-neutral-800 active:scale-95 transition-all shadow-xs"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Connect Google</span>
          </button>
        )}
      </div>

      {/* Audit Toast Confirmation */}
      {showAuditToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs border border-neutral-800 animate-in slide-in-from-bottom-3 duration-300">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-white">AI Business Audit Completed</p>
            <p className="text-neutral-400 text-[11px]">Insights and risk vectors successfully refreshed with Gemini 2.5.</p>
          </div>
        </div>
      )}
    </header>
  );
};
