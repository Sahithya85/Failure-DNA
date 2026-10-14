import React, { useState } from 'react';
import { FailureDNAProvider } from './context/FailureDNAContext';
import { ActiveTab, MistakeRecord } from './types';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { LogMistakeView } from './components/logger/LogMistakeView';
import { MistakesListView } from './components/history/MistakesListView';
import { FailureDNAView } from './components/dna/FailureDNAView';
import { InvestigatorView } from './components/investigate/InvestigatorView';
import { PreventionTasksView } from './components/prevention/PreventionTasksView';
import { FailureTimelineView } from './components/timeline/FailureTimelineView';
import { SettingsView } from './components/settings/SettingsView';

function FailureDNAApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedMistakeModal, setSelectedMistakeModal] = useState<MistakeRecord | null>(null);

  const handleSelectMistake = (mistake: MistakeRecord) => {
    setSelectedMistakeModal(mistake);
    setActiveTab('my-mistakes');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="lg:pl-72 flex flex-col min-h-screen">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setMobileOpen={setMobileOpen}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              setActiveTab={setActiveTab}
              onSelectMistake={handleSelectMistake}
            />
          )}

          {activeTab === 'log-mistake' && (
            <LogMistakeView
              setActiveTab={setActiveTab}
              onSelectMistake={handleSelectMistake}
            />
          )}

          {activeTab === 'my-mistakes' && (
            <MistakesListView
              onSelectMistake={handleSelectMistake}
              selectedMistakeModal={selectedMistakeModal}
              setSelectedMistakeModal={setSelectedMistakeModal}
            />
          )}

          {activeTab === 'failure-dna' && (
            <FailureDNAView
              onSelectMistake={handleSelectMistake}
              onNavigateToTasks={() => setActiveTab('prevention-tasks')}
            />
          )}

          {activeTab === 'investigator' && (
            <InvestigatorView onSelectMistake={handleSelectMistake} />
          )}

          {activeTab === 'prevention-tasks' && <PreventionTasksView />}

          {activeTab === 'timeline' && (
            <FailureTimelineView onSelectMistake={handleSelectMistake} />
          )}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <FailureDNAProvider>
      <FailureDNAApp />
    </FailureDNAProvider>
  );
}
