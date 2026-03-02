import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Toast } from './components/Toast';
import { ApiModal } from './components/ApiModal';
import { GeneraSection } from './sections/GeneraSection';
import { ProgrammazioneSection } from './sections/ProgrammazioneSection';
import { CalendarioSection } from './sections/CalendarioSection';
import { OttimizzaSection } from './sections/OttimizzaSection';
import { TraduciSection } from './sections/TraduciSection';
import { SettingsSection } from './sections/SettingsSection';

export function App() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-grotesk">
      <Header />

      <main className="px-4 py-6 max-w-5xl mx-auto">
        {activeTab === 'generate'  && <GeneraSection />}
        {activeTab === 'prog'      && <ProgrammazioneSection />}
        {activeTab === 'calendar'  && <CalendarioSection />}
        {activeTab === 'optimize'  && <OttimizzaSection />}
        {activeTab === 'translate' && <TraduciSection />}
        {activeTab === 'settings'  && <SettingsSection />}
      </main>

      <Toast />
      <ApiModal />
    </div>
  );
}
