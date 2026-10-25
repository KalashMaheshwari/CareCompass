import React from 'react';
import { Home, Users, Plus, ShieldCheck, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNav = () => {
  const { currentRoute, navigate, t } = useApp();

  // Completely hidden on emergency screen
  if (currentRoute === '/emergency') return null;

  const isAssessmentActive = ['/describe', '/followup', '/result'].some(
    r => currentRoute === r || (r !== '/' && currentRoute.startsWith(r))
  );

  const isHomeActive = currentRoute === '/' || currentRoute === '';
  const isCaregiversActive = currentRoute.startsWith('/caregivers') || currentRoute.startsWith('/booking');
  const isSafetyActive = currentRoute.startsWith('/dashboard') || currentRoute.startsWith('/checkin');
  const isProfileActive = currentRoute.startsWith('/settings') || currentRoute.startsWith('/patients') || currentRoute.startsWith('/privacy');

  return (
    <div className="mobile-dock-wrapper">
      <nav className="mobile-bottom-dock" aria-label="Mobile Bottom Navigation">
        {/* 1. Home */}
        <button
          type="button"
          className={`mobile-dock-btn ${isHomeActive ? 'active' : ''}`}
          onClick={() => navigate('/')}
          aria-label={t('nav_home') || 'Home'}
          title={t('nav_home') || 'Home'}
        >
          <div className="mobile-dock-icon">
            <Home size={19} strokeWidth={2.2} />
          </div>
          {isHomeActive && (
            <span className="mobile-dock-label">
              {t('nav_home') || 'Home'}
            </span>
          )}
        </button>

        {/* 2. Caregivers */}
        <button
          type="button"
          className={`mobile-dock-btn ${isCaregiversActive ? 'active' : ''}`}
          onClick={() => navigate('/caregivers')}
          aria-label={t('nav_find_caregivers') || 'Caregivers'}
          title={t('nav_find_caregivers') || 'Caregivers'}
        >
          <div className="mobile-dock-icon">
            <Users size={19} strokeWidth={2.2} />
          </div>
          {isCaregiversActive && (
            <span className="mobile-dock-label">
              {t('nav_find_caregivers') || 'Caregivers'}
            </span>
          )}
        </button>

        {/* 3. Hero Big Plus Button — Leads to Assessment (/describe) */}
        <button
          type="button"
          className={`mobile-dock-plus-btn ${isAssessmentActive ? 'active' : ''}`}
          onClick={() => navigate('/describe')}
          aria-label={t('nav_symptoms') || 'Start Assessment'}
          title="Start Assessment"
        >
          <div className="mobile-dock-plus-inner">
            <Plus size={24} strokeWidth={2.8} />
          </div>
        </button>

        {/* 4. Clinical Safety */}
        <button
          type="button"
          className={`mobile-dock-btn ${isSafetyActive ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
          aria-label={t('nav_safety') || 'Safety'}
          title={t('nav_safety') || 'Safety'}
        >
          <div className="mobile-dock-icon">
            <ShieldCheck size={19} strokeWidth={2.2} />
          </div>
          {isSafetyActive && (
            <span className="mobile-dock-label">
              {t('nav_safety') || 'Safety'}
            </span>
          )}
        </button>

        {/* 5. Profile */}
        <button
          type="button"
          className={`mobile-dock-btn ${isProfileActive ? 'active' : ''}`}
          onClick={() => navigate('/settings')}
          aria-label={t('nav_settings') || 'Profile'}
          title={t('nav_settings') || 'Profile'}
        >
          <div className="mobile-dock-icon">
            <User size={19} strokeWidth={2.2} />
          </div>
          {isProfileActive && (
            <span className="mobile-dock-label">
              {t('nav_settings') || 'Profile'}
            </span>
          )}
        </button>
      </nav>
    </div>
  );
};
