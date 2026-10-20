import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { LoginPage } from './pages/LoginPage';
import { DashboardOverview } from './pages/DashboardOverview';
import { SalesAnalytics } from './pages/SalesAnalytics';
import { BuyerCRM } from './pages/BuyerCRM';
import { SalesPipeline } from './pages/SalesPipeline';
import { ExportOrders } from './pages/ExportOrders';
import { ProductCatalog } from './pages/ProductCatalog';
import { FinancialOverview } from './pages/FinancialOverview';
import { PerformanceScorecard } from './pages/PerformanceScorecard';
import { NotificationsCenter } from './pages/NotificationsCenter';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

const TAB_TITLES: Record<string, string> = {
  overview: 'Executive Dashboard Overview',
  analytics: 'Sales Analytics & Funnel Conversion',
  crm: 'International Buyer CRM',
  pipeline: 'Export Sales Pipeline (Kanban)',
  orders: 'Export Orders & Ocean Freight Tracking',
  products: 'Commodity Catalog & Export Pricing Engine',
  financials: 'Financial Overview & Cash Flow Management',
  scorecard: 'KPI Performance Scorecard',
  notifications: 'Activity & Follow-Up Intelligence Center',
  reports: 'Executive Reports & CSV Data Export',
  settings: 'Pengaturan & Manajemen Sistem',
};

const DashboardContent: React.FC = () => {
  const { isAuthenticated } = useApp();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // If user is not authenticated, display enterprise Login / Register screen
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          activeTabTitle={TAB_TITLES[activeTab] || 'Dashboard'}
          onNavigateTab={setActiveTab}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <DashboardOverview onNavigateTab={setActiveTab} />
              )}
              {activeTab === 'analytics' && <SalesAnalytics />}
              {activeTab === 'crm' && <BuyerCRM />}
              {activeTab === 'pipeline' && <SalesPipeline />}
              {activeTab === 'orders' && <ExportOrders />}
              {activeTab === 'products' && <ProductCatalog />}
              {activeTab === 'financials' && <FinancialOverview />}
              {activeTab === 'scorecard' && <PerformanceScorecard />}
              {activeTab === 'notifications' && (
                <NotificationsCenter onNavigateTab={setActiveTab} />
              )}
              {activeTab === 'reports' && <ReportsPage />}
              {activeTab === 'settings' && <SettingsPage />}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}

export default App;
