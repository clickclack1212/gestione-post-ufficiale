import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Toast } from './components/Toast';
import { LandingPage } from './components/LandingPage';
import { XauusdApp } from './components/XauusdApp';
import { GeneraSection } from './sections/GeneraSection';
import { ProgrammazioneSection } from './sections/ProgrammazioneSection';
import { SettimanaSection } from './sections/SettimanaSection';
import { CalendarioSection } from './sections/CalendarioSection';
import { OttimizzaSection } from './sections/OttimizzaSection';
import { TraduciSection } from './sections/TraduciSection';
import { ChatSection } from './sections/ChatSection';
import { SettingsSection } from './sections/SettingsSection';
import { GestioneSection } from './sections/GestioneSection';

export function App() {
  const { screen, activeTab } = useApp();

  if (screen === 'landing') {
    return (
      <>
        <LandingPage />
        <Toast />
      </>
    );
  }

  if (screen === 'xauusd') {
    return <XauusdApp />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-grotesk">
      <Header />

      <main className="px-4 py-6 max-w-5xl mx-auto">
        {activeTab === 'generate'  && <GeneraSection />}
        {activeTab === 'prog'      && <ProgrammazioneSection />}
        {activeTab === 'weekly'    && <SettimanaSection />}
        {activeTab === 'calendar'  && <CalendarioSection />}
        {activeTab === 'optimize'  && <OttimizzaSection />}
        {activeTab === 'translate' && <TraduciSection />}
        {activeTab === 'chat'      && <ChatSection />}
        {activeTab === 'settings'  && <SettingsSection />}
        {activeTab === 'gestione'  && <GestioneSection />}
      </main>

      <Toast />
    </div>
  );
}
