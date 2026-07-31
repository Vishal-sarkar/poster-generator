import { template as morningRide } from './morning-ride/template';
import { template as alpineCentury } from './alpine-century/template';
import { template as royalBurgundy } from './royal-burgundy/template';
import { template as modernistYellow } from './modernist-yellow/template';
import { TemplateConfig } from '../types';

export const TEMPLATES: TemplateConfig[] = [
  morningRide,
  alpineCentury,
  royalBurgundy,
  modernistYellow,
];

export function getTemplateForEvent(eventName: string): TemplateConfig | null {
  const norm = eventName.toLowerCase().trim();
  if (norm === 'morning-ride' || norm === 'navy-gold') return morningRide;
  if (norm === 'alpine-century' || norm === 'cyber-teal') return alpineCentury;
  if (norm === 'royal-burgundy' || norm === 'vintage-burgundy') return royalBurgundy;
  if (norm === 'modernist-yellow') return modernistYellow;
  return null;
}
