import React from 'react';
import { Activity, Users, Clock, ShieldCheck, PhoneCall, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNav = () => {
  const { currentRoute, navigate, t } = useApp();

  if (currentRoute === '/emergency') return null;

  const items = [
    { 
      path: '/describe', 
      label: t('nav_symptoms') || 'Symptoms', 
      icon: <Activity size={18} />,
      matches: ['/', '/describe', '/followup', '/result']
    },
    { 
      path: '/caregivers', 
      label: t('nav_find_caregivers') || 'Caregivers', 
      icon: <Users size={18} />,
      matches: ['/caregivers', '/booking']
    },
    { 
      path: '/checkin', 
      label: t('nav_monitor') || 'Monitor', 
      icon: <Clock size={18} />,
      matches: ['/checkin', '/history']
    },
    { 
      path: '/dashboard', 
      label: t('nav_safety') || 'Safety', 
      icon: <ShieldCheck size={18} />,
      matches: ['/dashboard']
    },
    { 
      path: '/call-sim', 
      label: t('nav_channels') || 'Phone', 
      icon: <PhoneCall size={18} />,
      matches: ['/call-sim']
    },
    { 
      path: '/settings', 
      label: t('nav_settings') || 'Settings', 
      icon: <Settings size={18} />,
      matches: ['/settings', '/patients']
    }
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {items.map((item) => {
        const isActive = item.matches
          ? item.matches.some(r => currentRoute === r || (r !== '/' && currentRoute.startsWith(r)))
          : (currentRoute === item.path || (item.path !== '/' && currentRoute.startsWith(item.path)));
        
        return (
          <button
            key={item.path}
            type="button"
            className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
