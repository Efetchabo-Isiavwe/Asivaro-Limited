import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { BusinessDataProvider } from './context/BusinessDataContext';
import { Sidebar, NavigationTab } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { DashboardView } from './components/views/DashboardView';
import { AskAsivaroView } from './components/views/AskAsivaroView';
import { DocumentsView } from './components/views/DocumentsView';
import { CustomersView } from './components/views/CustomersView';
import { InvoicesView } from './components/views/InvoicesView';
import { ExpensesView } from './components/views/ExpensesView';
import { TasksView } from './components/views/TasksView';
import { InsightsView } from './components/views/InsightsView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';

function AppContent() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
      case 'ask-asivaro':
        return <AskAsivaroView />;
      case 'documents':
        return <DocumentsView />;
      case 'customers':
        return <CustomersView />;
      case 'invoices':
        return <InvoicesView />;
      case 'expenses':
        return <ExpensesView />;
      case 'tasks':
        return <TasksView />;
      case 'insights':
        return <InsightsView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100/70 font-sans text-neutral-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Sticky Header */}
        <Header
          activeTab={activeTab}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onNavigate={(tab) => setActiveTab(tab)}
        />

        {/* View Canvas */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BusinessDataProvider>
        <AppContent />
      </BusinessDataProvider>
    </AuthProvider>
  );
}
