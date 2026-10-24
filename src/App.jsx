import React from 'react'
import Navbar from './components/Navbar'
import EmergencyBanner from './components/EmergencyBanner'
import HomePage from './pages/HomePage'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="app-container">
      <Navbar />
      <EmergencyBanner />
      <HomePage />
      <Footer />
    </div>
  )
}
