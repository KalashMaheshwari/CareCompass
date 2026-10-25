import React from 'react';

/**
 * CareCompassLogo
 * High-precision medical cross & compass emblem
 * Uses solid vector facets for crisp depth without gradients
 */
export const CareCompassLogo = ({ size = 36, className = '' }) => {
  return (
    <div 
      className={`carecompass-logo-wrapper ${className}`}
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative'
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', width: '100%', height: '100%' }}
      >
        {/* Solid Squircle Container in Brand Solid #3f64ae */}
        <rect width="48" height="48" rx="14" fill="#3f64ae" />
        <rect x="1" y="1" width="46" height="46" rx="13" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1.5" />

        {/* Outer Precision Reticle Ring */}
        <circle cx="24" cy="24" r="17" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="3 3" />

        {/* 4 Cardinal Navigation Ticks */}
        <line x1="24" y1="4.5" x2="24" y2="8.5" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="24" y1="39.5" x2="24" y2="43.5" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="4.5" y1="24" x2="8.5" y2="24" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="39.5" y1="24" x2="43.5" y2="24" stroke="#ffffff" strokeOpacity="0.75" strokeWidth="1.5" strokeLinecap="round" />

        {/* Faceted Compass & Medical Cross (Solid Geometrics) */}
        {/* North Arrow - Dual Facet */}
        <path d="M24 9L27.5 20.5L24 24V9Z" fill="#ffffff" />
        <path d="M24 9L20.5 20.5L24 24V9Z" fill="#dbe6f6" />

        {/* South Arrow - Dual Facet */}
        <path d="M24 39L20.5 27.5L24 24V39Z" fill="#ffffff" />
        <path d="M24 39L27.5 27.5L24 24V39Z" fill="#dbe6f6" />

        {/* East Arrow - Dual Facet */}
        <path d="M39 24L27.5 20.5L24 24H39Z" fill="#ffffff" />
        <path d="M39 24L27.5 27.5L24 24H39Z" fill="#dbe6f6" />

        {/* West Arrow - Dual Facet */}
        <path d="M9 24L20.5 27.5L24 24H9Z" fill="#ffffff" />
        <path d="M9 24L20.5 20.5L24 24H9Z" fill="#dbe6f6" />

        {/* Central Clinical Core Aperture */}
        <circle cx="24" cy="24" r="5" fill="#3f64ae" />
        <circle cx="24" cy="24" r="3.2" fill="#ffffff" />
        <circle cx="24" cy="24" r="1.6" fill="#3f64ae" />
      </svg>
    </div>
  );
};

export default CareCompassLogo;
