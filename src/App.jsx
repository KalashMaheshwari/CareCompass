import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Navbar from './components/Navbar'
import EmergencyBanner from './components/EmergencyBanner'
import Footer from './components/Footer'

// All Functional Pages
import HomePage from './pages/HomePage'
import { DescribePage } from './pages/DescribePage'
import { FollowUpPage } from './pages/FollowUpPage'
import { ResultPage } from './pages/ResultPage'
import { CaregiversPage } from './pages/CaregiversPage'
import { BookingPage } from './pages/BookingPage'
import { CheckInPage } from './pages/CheckInPage'
import { EmergencyPage } from './pages/EmergencyPage'
import { PatientsPage } from './pages/PatientsPage'
import { PatientEditPage } from './pages/PatientEditPage'
import { HistoryPage } from './pages/HistoryPage'
import { DashboardPage } from './pages/DashboardPage'
import { CallSimPage } from './pages/CallSimPage'
import { LoginPage } from './pages/LoginPage'
import { PrivacyPage } from './pages/PrivacyPage'

function AppContent() {
  const { currentRoute, routeParams } = useApp()

  const renderPage = () => {
    if (currentRoute === '/emergency') return <EmergencyPage />
    if (currentRoute === '/describe') {
      return (
        <DescribePage
          startListening={routeParams?.startListening}
          presetText={routeParams?.presetText}
        />
      )
    }
    if (currentRoute === '/followup') return <FollowUpPage />
    if (currentRoute === '/result') return <ResultPage />
    if (currentRoute === '/caregivers') return <CaregiversPage />
    if (currentRoute.startsWith('/booking/')) {
      const id = currentRoute.replace('/booking/', '')
      return <BookingPage matchId={id} />
    }
    if (currentRoute === '/booking') return <BookingPage />
    if (currentRoute.startsWith('/checkin/')) {
      const id = currentRoute.replace('/checkin/', '')
      return <CheckInPage bookingId={id} />
    }
    if (currentRoute === '/checkin') return <CheckInPage />
    if (currentRoute === '/patients') return <PatientsPage />
    if (currentRoute === '/patients/new') return <PatientEditPage memberId="new" />
    if (currentRoute.startsWith('/patients/')) {
      const id = currentRoute.replace('/patients/', '')
      return <PatientEditPage memberId={id} />
    }
    if (currentRoute === '/dashboard') return <DashboardPage />
    if (currentRoute === '/call-sim') return <CallSimPage />
    if (currentRoute === '/history') return <HistoryPage />
    if (currentRoute === '/login') return <LoginPage />
    if (currentRoute === '/privacy') return <PrivacyPage />
    return <HomePage />
  }

  return (
    <div className="app-container">
      <Navbar />
      <EmergencyBanner />
      {renderPage()}
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
