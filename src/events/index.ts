import { template as morningRide } from './morning-ride/template';
import { template as youthDay } from './youth-day/template';
import { TemplateConfig } from '../types';

export const TEMPLATES: TemplateConfig[] = [
  morningRide,
  youthDay,
];

export function getTemplateForEvent(eventName: string): TemplateConfig | null {
  const norm = eventName.toLowerCase().trim();
  if (norm === 'youth-day') {
    return youthDay;
  }
  if (norm) {
    return morningRide;
  }
  return null;
}
