/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CertificateData, TEMPLATES, TemplateConfig } from '../types';
import { getTemplateForEvent } from '../events';
import { Award, Timer, Navigation, Calendar, Edit3, ShieldAlert, BadgeCheck, ChevronDown } from 'lucide-react';

interface CertificateFormProps {
  data: CertificateData;
  onChange: (key: keyof CertificateData, value: string) => void;
  isValid: boolean;
  onGenerate: () => void;
  errors: { [key: string]: string };
  loadDemo: (type: 'morning' | 'century') => void;
  mobileStep?: number;
}

export const CertificateForm: React.FC<CertificateFormProps> = ({
  data,
  onChange,
  isValid,
  onGenerate,
  errors,
  loadDemo,
  mobileStep = 1,
}) => {
  const parseDuration = (dur: string) => {
    const parts = dur.trim().split(':');
    let h = 0;
    let m = 0;
    let s = 0;
    
    if (parts.length === 3) {
      h = parseInt(parts[0], 10) || 0;
      m = parseInt(parts[1], 10) || 0;
      s = parseInt(parts[2], 10) || 0;
    } else if (parts.length === 2) {
      m = parseInt(parts[0], 10) || 0;
      s = parseInt(parts[1], 10) || 0;
    } else if (parts.length === 1) {
      s = parseInt(parts[0], 10) || 0;
    }
    
    return { hours: h, minutes: m, seconds: s };
  };

  const formatDurationStr = (h: number, m: number, s: number) => {
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
  };

  const { hours, minutes, seconds } = parseDuration(data.duration);

  const handleTimeChange = (type: 'h' | 'm' | 's', val: number) => {
    const current = parseDuration(data.duration);
    if (type === 'h') current.hours = val;
    if (type === 'm') current.minutes = val;
    if (type === 's') current.seconds = val;
    
    const formatted = formatDurationStr(current.hours, current.minutes, current.seconds);
    onChange('duration', formatted);
  };

  const [openDropdown, setOpenDropdown] = React.useState<'hours' | 'minutes' | 'seconds' | null>(null);

  const renderTimePickerDropdown = (
    currentValue: number,
    type: 'h' | 'm' | 's',
    maxVal: number
  ) => {
    const dropdownType = type === 'h' ? 'hours' : type === 'm' ? 'minutes' : 'seconds';
    const isOpen = openDropdown === dropdownType;
    const displayVal = String(currentValue).padStart(2, '0');
    
    return (
      <div className="flex-1 relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : dropdownType)}
          className="w-full h-11 px-3 text-xs sm:text-sm font-semibold bg-white border-2 border-[#E2E8F0] rounded-sm focus:outline-none focus:border-[#1A2B4C] flex items-center justify-between cursor-pointer select-none"
        >
          <span>{displayVal}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <>
            {/* Backdrop to dismiss on external clicks */}
            <div 
              className="fixed inset-0 z-40 bg-transparent" 
              onClick={() => setOpenDropdown(null)} 
            />
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-[#1A2B4C] rounded-sm max-h-40 overflow-y-auto z-50 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
              {Array.from({ length: maxVal }, (_, i) => {
                const isSelected = currentValue === i;
                const optLabel = String(i).padStart(2, '0');
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      handleTimeChange(type, i);
                      setOpenDropdown(null);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs font-semibold transition-colors flex items-center justify-between ${
                      isSelected 
                        ? 'bg-[#1A2B4C] text-white' 
                        : 'text-[#1A2B4C] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <span>{optLabel}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-4" id="certificate-form-container">
      {/* Demo Preset Buttons - high contrast flat style */}
      {/* <div className={`bg-[#F8FAFC] p-4 border-2 border-[#E2E8F0] rounded-sm flex-col sm:flex-row sm:items-center justify-between gap-2 ${mobileStep === 2 ? 'hidden md:flex' : 'flex'}`} id="demo-controls">
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            id="btn-demo-morning"
            onClick={() => loadDemo('morning')}
            className="px-3 py-1.5 text-xs font-bold bg-white border-2 border-[#1A2B4C] text-[#1A2B4C] rounded-sm hover:bg-[#1A2B4C] hover:text-white transition-all cursor-pointer uppercase tracking-wider"
          >
            Morning Ride (Navy)
          </button>
          <button
            type="button"
            id="btn-demo-century"
            onClick={() => loadDemo('century')}
            className="px-3 py-1.5 text-xs font-bold bg-white border-2 border-[#C5A059] text-[#C5A059] rounded-sm hover:bg-[#C5A059] hover:text-white transition-all cursor-pointer uppercase tracking-wider"
          >
            Alpine Century (Teal)
          </button>
        </div>
      </div> */}

      {/* Section 1: Template Selection (Carousel) - Hidden if event template is loaded via URL */}
      {(() => {
        const path = typeof window !== 'undefined' ? window.location.pathname : '';
        const pathSegments = path.split('/').filter(Boolean);
        const eventName = pathSegments.length > 1 ? pathSegments[1] : '';
        const hasEventTemplate = eventName && getTemplateForEvent(eventName) !== null;

        if (hasEventTemplate) return null;

        return (
          <div className={`space-y-2 ${mobileStep === 1 ? 'hidden md:block' : 'block'}`} id="template-picker-section">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-[#64748B]" />
              Select Certificate Template
            </label>
            
            {/* Horizontal scrollable row of custom miniatures */}
            <div className="flex gap-3 overflow-x-auto pb-2 scroll-smooth" id="template-carousel">
              {TEMPLATES.map((tpl) => {
                const isSelected = data.selectedTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    id={`template-btn-${tpl.id}`}
                    onClick={() => onChange('selectedTemplateId', tpl.id)}
                    className={`flex-shrink-0 w-32 p-2.5 border-2 rounded-sm text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
                      isSelected
                        ? 'border-[#1A2B4C] bg-[#1A2B4C]/5 ring-2 ring-[#1A2B4C]/10'
                        : 'border-[#E2E8F0] bg-white hover:border-[#64748B]'
                    }`}
                  >
                    {/* Miniature preview of template layout */}
                    <div className="w-full h-8 rounded-sm relative overflow-hidden border border-[#E2E8F0]" style={{ backgroundColor: tpl.bgColor }}>
                      {/* Miniature Top left decorative cut */}
                      {tpl.id === 'navy-gold' && (
                        <>
                          <div className="absolute top-0 left-0 w-8 h-4 bg-[#0A2540] clip-path-polygon" />
                          <div className="absolute bottom-0 right-0 w-8 h-4 bg-[#0A2540]" />
                        </>
                      )}
                      {tpl.id === 'cyber-teal' && (
                        <div className="absolute inset-0 border border-[#38BDF8] border-dashed opacity-50" />
                      )}
                      {tpl.id === 'vintage-burgundy' && (
                        <div className="absolute inset-0.5 border border-[#581C23]" />
                      )}
                      {tpl.id === 'modernist-yellow' && (
                        <div className="absolute top-0 left-0 w-3 h-3 bg-[#EAB308]" />
                      )}
                      {/* Miniature text placeholder */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[5px] font-bold tracking-wider uppercase opacity-45">CERT</span>
                      </div>
                    </div>

                    <div className="mt-1">
                      <p className="text-[10px] font-bold text-[#1A2B4C] line-clamp-1 leading-tight">{tpl.name}</p>
                      <div className="flex gap-1 mt-1">
                        <span className="w-2.5 h-2.5 rounded-full inline-block border border-[#E2E8F0]" style={{ backgroundColor: tpl.primaryColor }} />
                        <span className="w-2.5 h-2.5 rounded-full inline-block border border-[#E2E8F0]" style={{ backgroundColor: tpl.accentColor }} />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Section 2: Core Inputs */}
      <div className={`grid grid-cols-1 gap-4 bg-white p-4 border-2 border-[#E2E8F0] rounded-sm ${mobileStep === 2 ? 'hidden md:grid' : 'grid'}`} id="form-core-inputs">
        {/* Recipient Name */}
        <div>
          <label htmlFor="input-name" className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
            Recipient Name *
          </label>
          <div className="relative">
            <input
              type="text"
              id="input-name"
              maxLength={40}
              value={data.name}
              onChange={(e) => onChange('name', e.target.value.toUpperCase())} // Upper case as preferred for certificates
              placeholder="E.G. ALEX THOMPSON"
              className={`w-full h-11 px-4 text-sm font-semibold bg-white border-2 rounded-sm focus:outline-none transition-colors ${
                errors.name ? 'border-red-500 focus:border-red-600' : 'border-[#E2E8F0] focus:border-[#1A2B4C]'
              }`}
            />
          </div>
          {errors.name ? (
            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-3 h-3" /> {errors.name}
            </p>
          ) : (
            <p className="text-[10px] text-[#94A3B8] mt-1 uppercase tracking-wider">Will automatically scale down if too long.</p>
          )}
        </div>

        {/* Duration */}
        <div>
          <label htmlFor="input-duration" className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1">
            <Timer className="w-3 h-3 text-[#64748B]" /> Duration *
          </label>
          <div className="flex items-center gap-1" id="duration-picker-grid">
            {/* Hours */}
            {renderTimePickerDropdown(hours, 'h', 100)}

            <span className="text-[#1A2B4C] font-black text-xs sm:text-sm">:</span>

            {/* Minutes */}
            {renderTimePickerDropdown(minutes, 'm', 60)}

            <span className="text-[#1A2B4C] font-black text-xs sm:text-sm">:</span>

            {/* Seconds */}
            {renderTimePickerDropdown(seconds, 's', 60)}
          </div>
          {errors.duration ? (
            <p className="text-[10px] text-red-500 mt-1 leading-tight flex items-center gap-1 font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-3 h-3 flex-shrink-0" /> {errors.duration}
            </p>
          ) : (
            <div className="flex justify-between text-[9px] text-[#94A3B8] mt-1 uppercase tracking-wider font-mono">
              <span>Hours</span>
              <span>Mins</span>
              <span>Secs</span>
            </div>
          )}
        </div>

        {/* Distance */}
        <div className="mt-2">
          <label htmlFor="input-distance" className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-[#64748B]" /> Distance *
          </label>
          <div className="flex">
            <input
              type="text"
              id="input-distance"
              value={data.distance}
              onChange={(e) => {
                let val = e.target.value;
                // Allow only digits and up to one decimal point
                val = val.replace(/[^0-9.]/g, '');
                // Prevent multiple decimals
                const parts = val.split('.');
                if (parts.length > 2) {
                  val = parts[0] + '.' + parts.slice(1).join('');
                }
                onChange('distance', val);
              }}
              placeholder="45.00"
              className={`flex-1 min-w-0 h-11 px-4 text-sm font-semibold bg-white border-l-2 border-y-2 rounded-l-sm focus:outline-none transition-colors ${
                errors.distance ? 'border-red-500 focus:border-red-600' : 'border-[#E2E8F0] focus:border-[#1A2B4C]'
              }`}
            />
            <span
              id="select-unit"
              className="px-4 h-11 flex items-center justify-center text-xs font-black uppercase bg-[#F8FAFC] border-2 border-[#E2E8F0] rounded-r-sm border-l-0 text-[#1A2B4C] select-none"
            >
              KM
            </span>
          </div>
            {errors.distance ? (
              <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-semibold uppercase tracking-wider">
                <ShieldAlert className="w-3 h-3" /> {errors.distance}
              </p>
            ) : (
              <p className="text-[10px] text-[#94A3B8] mt-1 uppercase tracking-wider">Positive number</p>
            )}
          </div>
        </div>

      {/* Section 3: Ride Details & Custom Date (Optional) */}
      {/* <div className={`bg-white p-4 border-2 border-[#E2E8F0] rounded-sm space-y-3.5 ${mobileStep === 2 ? 'hidden md:block' : 'block'}`} id="form-optional-inputs">
        <h4 className="text-[11px] font-black text-[#1A2B4C] uppercase tracking-wider border-b pb-1.5 border-[#E2E8F0]">Ride Details (Optional)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="input-ride-name" className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1">
              <Award className="w-3 h-3 text-[#64748B]" /> Ride / Event Name
            </label>
            <input
              type="text"
              id="input-ride-name"
              value={data.rideName}
              onChange={(e) => onChange('rideName', e.target.value)}
              placeholder="The Grand Alpine Tour — Oct 2023"
              className="w-full h-11 px-4 text-sm font-semibold bg-white border-2 border-[#E2E8F0] rounded-sm focus:outline-none focus:border-[#1A2B4C] transition-colors"
            />
          </div>
          <div>
            <label htmlFor="input-ride-date" className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#64748B]" /> Completion Date
            </label>
            <input
              type="text"
              id="input-ride-date"
              value={data.rideDate}
              onChange={(e) => onChange('rideDate', e.target.value)}
              placeholder="e.g. 13th July 2026"
              className="w-full h-11 px-4 text-sm font-semibold bg-white border-2 border-[#E2E8F0] rounded-sm focus:outline-none focus:border-[#1A2B4C] transition-colors"
            />
          </div>
        </div>
      </div> */}

      {/* Section 4: Signature Design (Dynamic Customization) */}
      {/* <div className={`bg-white p-4 border-2 border-[#E2E8F0] rounded-sm space-y-3.5 ${mobileStep === 1 ? 'hidden md:block' : 'block'}`} id="form-signature-inputs">
        <h4 className="text-[11px] font-black text-[#1A2B4C] uppercase tracking-wider border-b pb-1.5 border-[#E2E8F0] flex items-center gap-1">
          <Edit3 className="w-3.5 h-3.5 text-[#1A2B4C]" />
          Signature Settings
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label htmlFor="input-sig-text" className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
              Signature Script
            </label>
            <input
              type="text"
              id="input-sig-text"
              value={data.signatureText}
              onChange={(e) => onChange('signatureText', e.target.value)}
              placeholder="Unique Jain"
              className="w-full h-11 px-4 text-sm font-semibold bg-white border-2 border-[#E2E8F0] rounded-sm focus:outline-none focus:border-[#1A2B4C] transition-colors"
            />
          </div>
          <div>
            <label htmlFor="input-sig-name" className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
              Printed Name
            </label>
            <input
              type="text"
              id="input-sig-name"
              value={data.signatureName}
              onChange={(e) => onChange('signatureName', e.target.value)}
              placeholder="UNIQUE JAIN"
              className="w-full h-11 px-4 text-sm font-semibold bg-white border-2 border-[#E2E8F0] rounded-sm focus:outline-none focus:border-[#1A2B4C] transition-colors"
            />
          </div>
          <div>
            <label htmlFor="input-sig-role" className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
              Title / Role
            </label>
            <input
              type="text"
              id="input-sig-role"
              value={data.signatureRole}
              onChange={(e) => onChange('signatureRole', e.target.value)}
              placeholder="Founder & CEO"
              className="w-full h-11 px-4 text-sm font-semibold bg-white border-2 border-[#E2E8F0] rounded-sm focus:outline-none focus:border-[#1A2B4C] transition-colors"
            />
          </div>
        </div>
      </div> */}

      {/* Static desktop-only help note */}
      {/* <div className="hidden md:flex items-start gap-2.5 p-4 bg-[#F8FAFC] border-2 border-[#E2E8F0] text-[#64748B] rounded-sm text-xs" id="desktop-note">
        <BadgeCheck className="w-4 h-4 text-[#1A2B4C] flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-[#1A2B4C] uppercase tracking-wider text-[11px]">Sleek Design Engine Active</p>
          <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">Required fields must be valid to unlock. See the dynamic high-contrast preview updating in real time.</p>
        </div>
      </div> */}
    </div>
  );
};
