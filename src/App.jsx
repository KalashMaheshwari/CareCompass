import React from 'react';
import { useApp } from './context/AppContext';
import { DemoBanner } from './components/DemoBanner';
import { GlobalHeader } from './components/GlobalHeader';
import { BottomNav } from './components/BottomNav';
import { WifiOff } from 'lucide-react';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientEditPage } from './pages/PatientEditPage';
import { DescribePage } from './pages/DescribePage';
import { FollowUpPage } from './pages/FollowUpPage';
import { ResultPage } from './pages/ResultPage';
import { CaregiversPage } from './pages/CaregiversPage';
import { BookingPage } from './pages/BookingPage';
import { CheckInPage } from './pages/CheckInPage';
import { HistoryPage } from './pages/HistoryPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { DashboardPage } from './pages/DashboardPage';
import { CallSimPage } from './pages/CallSimPage';
import { PrivacyPage } from './pages/PrivacyPage';

export function App() {
  const { currentRoute, routeParams, isOffline, t } = useApp();

  const renderCurrentPage = () => {
    // Route matching
    if (currentRoute === '/emergency') {
      return <EmergencyPage />;
    }

    if (currentRoute === '/' || currentRoute === '') {
      return <LandingPage />;
    }

    if (currentRoute === '/login') {
      return <LoginPage />;
    }

    if (currentRoute === '/patients') {
      return <PatientsPage />;
    }

    if (currentRoute === '/patients/new') {
      return <PatientEditPage memberId="new" />;
    }

    if (currentRoute.startsWith('/patients/')) {
      const id = currentRoute.replace('/patients/', '');
      return <PatientEditPage memberId={id} />;
    }

    if (currentRoute === '/describe') {
      return (
        <DescribePage
          startListening={routeParams.startListening}
          presetText={routeParams.presetText}
        />
      );
    }

    if (currentRoute === '/followup') {
      return <FollowUpPage />;
    }

    if (currentRoute === '/result') {
      return <ResultPage />;
    }

    if (currentRoute === '/caregivers') {
      return <CaregiversPage />;
    }

    if (currentRoute.startsWith('/booking/')) {
      const id = currentRoute.replace('/booking/', '');
      return <BookingPage bookingId={id} />;
    }

    if (currentRoute.startsWith('/checkin/')) {
      const id = currentRoute.replace('/checkin/', '');
      return <CheckInPage bookingId={id} />;
    }

    if (currentRoute === '/history') {
      return <HistoryPage />;
    }

    if (currentRoute === '/dashboard') {
      return <DashboardPage />;
    }

    if (currentRoute === '/call-sim') {
      return <CallSimPage />;
    }

    if (currentRoute === '/privacy') {
      return <PrivacyPage />;
    }

    // Default fallback
    return <LandingPage />;
  };

  const isEmergency = currentRoute === '/emergency';

  return (
    <div className="app-wrapper">
      {/* 1. Persistent Demo Banner */}
      {!isEmergency && <DemoBanner />}

      {/* 2. Offline Indicator (Section 3.2 & 5.5) */}
      {isOffline && (
        <div className="offline-banner" role="alert">
          <WifiOff size={16} />
          <span>You are offline. Emergency 112 routing still works.</span>
        </div>
      )}

      {/* 3. Global Header */}
      {!isEmergency && <GlobalHeader />}

      {/* 4. Main Page View */}
      <main className="main-content" style={{ padding: isEmergency ? 0 : undefined }}>
        {renderCurrentPage()}
      </main>

      {/* 5. Bottom Navigation */}
      {!isEmergency && <BottomNav />}
    </div>
  );
}
