import { template as morningRide } from './morning-ride/template';
import { template as youthDay } from './youth-day/template';
import { template as independenceDay } from './independence-day/template';
import { template as sportsDay } from './sports-day/template';
import { template as peaceDay } from './peace-day/template';
import { template as heartDay } from './heart-day/template';
import { TemplateConfig } from '../types';

export const TEMPLATES: TemplateConfig[] = [
  morningRide,
  youthDay,
  independenceDay,
  sportsDay,
  peaceDay,
  heartDay,
];

export function getTemplateForEvent(eventName: string): TemplateConfig | null {
  const norm = eventName.toLowerCase().trim();
  if (norm === 'youth-day') {
    return youthDay;
  }
  if (norm === 'independence-day') {
    return independenceDay;
  }
  if (norm === 'sports-day' || norm === 'sports_day') {
    return sportsDay;
  }
  if (norm === 'peace-day' || norm === 'peace_day') {
    return peaceDay;
  }
  if (norm === 'heart-day' || norm === 'heart_day') {
    return heartDay;
  }
  if (norm) {
    return morningRide;
  }
  return null;
}


