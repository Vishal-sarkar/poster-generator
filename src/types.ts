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

import { TEMPLATES as EVENT_TEMPLATES } from './events';
export const TEMPLATES = EVENT_TEMPLATES;
