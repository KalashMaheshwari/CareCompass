import React from 'react';
import { Home, Users, Clock, BarChart3, MessageSquare, PhoneCall } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNav = () => {
  const { currentRoute, navigate } = useApp();

  if (currentRoute === '/emergency') return null;

  const items = [
    { path: '/', label: 'Triage', icon: <Home size={18} /> },
    { path: '/patients', label: 'Family', icon: <Users size={18} /> },
    { path: '/history', label: 'Visits', icon: <Clock size={18} /> },
    { path: '/dashboard', label: 'Safety', icon: <BarChart3 size={18} /> },
    { path: '/call-sim', label: 'IVR', icon: <MessageSquare size={18} /> }
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {items.map((item) => {
        const isActive = currentRoute === item.path || (item.path !== '/' && currentRoute.startsWith(item.path));
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
