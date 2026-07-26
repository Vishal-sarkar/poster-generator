/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TemplateConfig } from '../types';

interface BadgeProps {
  type: 'lightning' | 'tech' | 'seal' | 'modern';
  primaryColor: string;
  accentColor: string;
}

export const TemplateBadge: React.FC<BadgeProps> = ({ type, primaryColor, accentColor }) => {
  if (type === 'lightning') {
    // Pedals Power lightning crest
    return (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 hover:scale-105">
        {/* Diamond Outer Border */}
        <path d="M60 10 L110 60 L60 110 L10 60 Z" fill="none" stroke={primaryColor} strokeWidth="3" />
        <path d="M60 15 L105 60 L60 105 L15 60 Z" fill="none" stroke={accentColor} strokeWidth="1.5" />
        
        {/* Double Lightning bolts / Electric icon */}
        <path d="M42 55 L68 25 L60 55 L78 55 L52 85 L60 55 Z" fill={primaryColor} stroke={accentColor} strokeWidth="1" />
        
        {/* S-Shape Pedals Power geometric text-box */}
        <rect x="25" y="76" width="70" height="14" fill={primaryColor} rx="2" />
        <text x="60" y="86" fill="#FFFFFF" fontSize="7" fontWeight="bold" fontFamily="monospace" textAnchor="middle" letterSpacing="1">
          PEDALS POWER
        </text>
      </svg>
    );
  }

  if (type === 'tech') {
    // Cyber tech grid shield
    return (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 hover:scale-105">
        {/* Hexagonal Tech Frame */}
        <polygon points="60,10 105,35 105,85 60,110 15,85 15,35" fill="none" stroke={primaryColor} strokeWidth="3" />
        <polygon points="60,16 99,39 99,81 60,104 21,81 21,39" fill="none" stroke={accentColor} strokeWidth="1.5" />
        
        {/* Center Target/Grid Design */}
        <circle cx="60" cy="60" r="22" stroke={primaryColor} strokeWidth="1" strokeDasharray="3 3" />
        <circle cx="60" cy="60" r="14" fill={accentColor} />
        
        {/* Inner Tech Chevron */}
        <path d="M52 50 L60 58 L68 50" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M52 60 L60 68 L68 60" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Tech Label */}
        <text x="60" y="100" fill={primaryColor} fontSize="6" fontWeight="900" fontFamily="monospace" textAnchor="middle" letterSpacing="2">
          PERFORMANCE
        </text>
      </svg>
    );
  }

  if (type === 'seal') {
    // Classical academic gold seal
    return (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 hover:scale-105">
        {/* Starburst Ornate Seal Background */}
        <circle cx="60" cy="60" r="46" fill={accentColor} />
        <circle cx="60" cy="60" r="42" fill={primaryColor} />
        <circle cx="60" cy="60" r="38" fill="none" stroke={accentColor} strokeWidth="2" strokeDasharray="4 2" />
        
        {/* Laurel Wreath */}
        <path d="M40,65 C38,55 42,42 60,42" fill="none" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M80,65 C82,55 78,42 60,42" fill="none" stroke={accentColor} strokeWidth="1.5" strokeLinecap="round" />
        
        {/* Mini Laurel Leaves */}
        <path d="M42 50 C40 48 45 46 45 50" fill={accentColor} />
        <path d="M47 44 C45 42 50 40 50 44" fill={accentColor} />
        <path d="M78 50 C80 48 75 46 75 50" fill={accentColor} />
        <path d="M73 44 C75 42 70 40 70 44" fill={accentColor} />

        {/* Central Star */}
        <polygon points="60,48 63,55 70,55 65,60 67,67 60,63 53,67 55,60 50,55 57,55" fill={accentColor} />
        
        <text x="60" y="78" fill={accentColor} fontSize="7" fontWeight="bold" fontFamily="serif" textAnchor="middle" letterSpacing="1">
          OFFICIAL
        </text>
        <text x="60" y="86" fill={accentColor} fontSize="6" fontFamily="serif" textAnchor="middle" letterSpacing="0.5">
          SEAL
        </text>
      </svg>
    );
  }

  // Modern abstract chevron badge
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-transform duration-300 hover:scale-105">
      {/* Bold Minimalist Shield */}
      <rect x="20" y="20" width="80" height="80" fill={primaryColor} stroke={accentColor} strokeWidth="4" />
      
      {/* Asymmetric Neon Bar */}
      <rect x="25" y="25" width="20" height="70" fill={accentColor} />
      
      {/* Heavy Cross/Check Chevron */}
      <path d="M55 50 L68 63 L90 35" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="square" />
      
      <text x="65" y="85" fill="#FFFFFF" fontSize="8" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="1">
        VERIFIED
      </text>
    </svg>
  );
};

interface BackgroundProps {
  template: TemplateConfig;
}

export const TemplateBackground: React.FC<BackgroundProps> = ({ template }) => {
  const { id, primaryColor, accentColor, bgColor } = template;

  if (id === 'navy-gold') {
    // Beautiful Navy & Gold Elegant Geometric Border (matching user photo)
    return (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1414 970" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ zIndex: 0 }}>
        {/* Canvas Background */}
        <rect width="1414" height="970" fill={bgColor} />

        {/* Flat Gold Inner Border */}
        <rect x="40" y="40" width="1334" height="890" fill="none" stroke={accentColor} strokeWidth="4" />
        <rect x="52" y="52" width="1310" height="866" fill="none" stroke={accentColor} strokeWidth="1.5" />
        
        {/* --- Top Left Geometric Corner Design --- */}
        {/* Navy Primary Swoosh Block */}
        <path d="M 0 0 L 450 0 L 220 120 L 60 480 L 0 540 Z" fill={primaryColor} />
        {/* Accent Gold Polygon Line */}
        <path d="M 450 0 L 475 0 L 245 125 L 80 490 L 60 480 Z" fill={accentColor} />
        {/* Secondary Medium Navy Polygon to match image richness */}
        <path d="M 0 0 L 280 0 L 150 70 L 40 300 L 0 340 Z" fill="#1E3D59" opacity="0.8" />
        {/* Highlight Gold Line */}
        <path d="M 280 0 L 295 0 L 165 73 L 50 305 L 40 300 Z" fill={accentColor} />

        {/* --- Bottom Right Geometric Corner Design --- */}
        {/* Navy Primary Swoosh Block */}
        <path d="M 1414 970 L 964 970 L 1194 850 L 1354 490 L 1414 430 Z" fill={primaryColor} />
        {/* Accent Gold Polygon Line */}
        <path d="M 964 970 L 939 970 L 1169 845 L 1334 480 L 1354 490 Z" fill={accentColor} />
        {/* Secondary Medium Navy Block */}
        <path d="M 1414 970 L 1134 970 L 1264 900 L 1374 670 L 1414 630 Z" fill="#1E3D59" opacity="0.8" />
        {/* Highlight Gold Line */}
        <path d="M 1134 970 L 1119 970 L 1249 897 L 1364 665 L 1374 670 Z" fill={accentColor} />
      </svg>
    );
  }

  if (id === 'cyber-teal') {
    // Cyber tech design with precise lines, crosshairs and grid pattern
    return (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1414 970" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ zIndex: 0 }}>
        {/* Canvas Background */}
        <rect width="1414" height="970" fill={bgColor} />
        
        {/* Tech Grid Pattern overlay */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E2E8F0" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="1414" height="970" fill="url(#grid)" opacity="0.6" />

        {/* Double Sharp High-Tech Border */}
        <rect x="40" y="40" width="1334" height="890" fill="none" stroke={primaryColor} strokeWidth="3" />
        <rect x="48" y="48" width="1318" height="874" fill="none" stroke={accentColor} strokeWidth="1" strokeDasharray="10 5" />

        {/* Four Corner Crosshair/L-brackets */}
        {/* Top Left */}
        <path d="M 30 70 L 30 30 L 70 30" fill="none" stroke={primaryColor} strokeWidth="4" />
        <circle cx="30" cy="30" r="4" fill={accentColor} />
        {/* Top Right */}
        <path d="M 1384 70 L 1384 30 L 1344 30" fill="none" stroke={primaryColor} strokeWidth="4" />
        <circle cx="1384" cy="30" r="4" fill={accentColor} />
        {/* Bottom Left */}
        <path d="M 30 900 L 30 940 L 70 940" fill="none" stroke={primaryColor} strokeWidth="4" />
        <circle cx="30" cy="940" r="4" fill={accentColor} />
        {/* Bottom Right */}
        <path d="M 1384 900 L 1384 940 L 1344 940" fill="none" stroke={primaryColor} strokeWidth="4" />
        <circle cx="1384" cy="940" r="4" fill={accentColor} />

        {/* Abstract Tech Side Accents */}
        <rect x="40" y="445" width="12" height="80" fill={accentColor} />
        <rect x="1362" y="445" width="12" height="80" fill={accentColor} />
        <line x1="80" y1="40" x2="160" y2="40" stroke={accentColor} strokeWidth="8" />
        <line x1="1254" y1="930" x2="1334" y2="930" stroke={accentColor} strokeWidth="8" />
      </svg>
    );
  }

  if (id === 'vintage-burgundy') {
    // Ornate traditional classic border with cream background
    return (
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1414 970" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ zIndex: 0 }}>
        {/* Ivory Background */}
        <rect width="1414" height="970" fill={bgColor} />

        {/* Vintage Triple Ornate Borders */}
        <rect x="35" y="35" width="1344" height="900" fill="none" stroke={primaryColor} strokeWidth="6" />
        <rect x="47" y="47" width="1320" height="876" fill="none" stroke={accentColor} strokeWidth="1.5" />
        <rect x="53" y="53" width="1308" height="864" fill="none" stroke={primaryColor} strokeWidth="1" />

        {/* Beautiful Ornate Flourish Corners */}
        {/* Top Left */}
        <g transform="translate(60, 60)">
          <path d="M 0 40 C 0 10 10 0 40 0" fill="none" stroke={primaryColor} strokeWidth="3" />
          <path d="M 10 50 C 10 20 20 10 50 10" fill="none" stroke={accentColor} strokeWidth="1.5" />
          <circle cx="0" cy="0" r="8" fill={primaryColor} />
          <circle cx="15" cy="15" r="4" fill={accentColor} />
        </g>
        {/* Top Right */}
        <g transform="translate(1354, 60) scale(-1, 1)">
          <path d="M 0 40 C 0 10 10 0 40 0" fill="none" stroke={primaryColor} strokeWidth="3" />
          <path d="M 10 50 C 10 20 20 10 50 10" fill="none" stroke={accentColor} strokeWidth="1.5" />
          <circle cx="0" cy="0" r="8" fill={primaryColor} />
          <circle cx="15" cy="15" r="4" fill={accentColor} />
        </g>
        {/* Bottom Left */}
        <g transform="translate(60, 910) scale(1, -1)">
          <path d="M 0 40 C 0 10 10 0 40 0" fill="none" stroke={primaryColor} strokeWidth="3" />
          <path d="M 10 50 C 10 20 20 10 50 10" fill="none" stroke={accentColor} strokeWidth="1.5" />
          <circle cx="0" cy="0" r="8" fill={primaryColor} />
          <circle cx="15" cy="15" r="4" fill={accentColor} />
        </g>
        {/* Bottom Right */}
        <g transform="translate(1354, 910) scale(-1, -1)">
          <path d="M 0 40 C 0 10 10 0 40 0" fill="none" stroke={primaryColor} strokeWidth="3" />
          <path d="M 10 50 C 10 20 20 10 50 10" fill="none" stroke={accentColor} strokeWidth="1.5" />
          <circle cx="0" cy="0" r="8" fill={primaryColor} />
          <circle cx="15" cy="15" r="4" fill={accentColor} />
        </g>

        {/* Elegant Centered Vignette Accent Lines */}
        <line x1="400" y1="53" x2="1014" y2="53" stroke={accentColor} strokeWidth="3" />
        <line x1="400" y1="917" x2="1014" y2="917" stroke={accentColor} strokeWidth="3" />
      </svg>
    );
  }

  // Modernist Electric Yellow Template
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1414 970" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ zIndex: 0 }}>
      {/* Canvas Background */}
      <rect width="1414" height="970" fill={bgColor} />

      {/* Bold Block Borders */}
      <rect x="25" y="25" width="1364" height="920" fill="none" stroke={primaryColor} strokeWidth="10" />
      
      {/* Asymmetric Yellow Corner Accents */}
      {/* Top Left Yellow Box */}
      <rect x="35" y="35" width="100" height="100" fill={accentColor} />
      <rect x="35" y="35" width="40" height="40" fill={primaryColor} />
      
      {/* Bottom Right Yellow Box */}
      <rect x="1279" y="835" width="100" height="100" fill={accentColor} />
      <rect x="1339" y="895" width="40" height="40" fill={primaryColor} />

      {/* Side stripe accents */}
      <rect x="35" y="435" width="15" height="100" fill={primaryColor} />
      <rect x="1364" y="435" width="15" height="100" fill={accentColor} />
    </svg>
  );
};
