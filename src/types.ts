/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CertificateData {
  name: string;
  duration: string;
  distance: string;
  distanceUnit: string;
  rideName: string;
  rideDate: string;
  selectedTemplateId: string;
  signatureName: string;
  signatureRole: string;
  signatureText: string; // The text used to draw the signature script font
}

export interface TemplateConfig {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  fontName: string; // font family for the recipient name
  fontTitle: string; // font family for the certificate title
  fontLabel: string; // font family for labels and headers
  badgeType: 'lightning' | 'tech' | 'seal' | 'modern';
  bgColor: string;
  borderColor: string;
}

export const TEMPLATES: TemplateConfig[] = [
  {
    id: 'navy-gold',
    name: 'Classic Navy & Gold',
    primaryColor: '#0A2540', // Deep Navy
    accentColor: '#C5A880',  // Muted Gold
    textColor: '#0A2540',
    fontName: 'font-serif-cert',
    fontTitle: 'font-serif-cert',
    fontLabel: 'font-sans',
    badgeType: 'lightning',
    bgColor: '#FFFFFF',
    borderColor: '#C5A880',
  },
  {
    id: 'cyber-teal',
    name: 'Cybertech Teal',
    primaryColor: '#0F172A', // Slate
    accentColor: '#06B6D4',  // Electric Teal
    textColor: '#1E293B',
    fontName: 'font-display-cert',
    fontTitle: 'font-display-cert',
    fontLabel: 'font-mono-cert',
    badgeType: 'tech',
    bgColor: '#F8FAFC',
    borderColor: '#38BDF8',
  },
  {
    id: 'vintage-burgundy',
    name: 'Royal Burgundy',
    primaryColor: '#581C23', // Burgundy
    accentColor: '#B45309',  // Bronze
    textColor: '#451A03',
    fontName: 'font-serif-cert',
    fontTitle: 'font-serif-cert',
    fontLabel: 'font-sans',
    badgeType: 'seal',
    bgColor: '#FFFDF9',      // Ivory/Cream
    borderColor: '#D97706',
  },
  {
    id: 'modernist-yellow',
    name: 'Modernist Yellow',
    primaryColor: '#1E293B', // Charcoal
    accentColor: '#EAB308',  // Vibrant Yellow-Gold
    textColor: '#0F172A',
    fontName: 'font-heavy-cert',
    fontTitle: 'font-heavy-cert',
    fontLabel: 'font-display-cert',
    badgeType: 'modern',
    bgColor: '#FAFAFA',
    borderColor: '#1E293B',
  }
];
