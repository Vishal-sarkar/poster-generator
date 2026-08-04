/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CertificateData, TEMPLATES, TemplateConfig } from '../types';
import { getTemplateForEvent } from '../events';
import { Award, Timer, Navigation, Calendar, Edit3, ShieldAlert, BadgeCheck, ChevronDown, Phone, Mail } from 'lucide-react';

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
    if (!dur || dur === '00:00:00') {
      return { hours: null, minutes: null, seconds: null };
    }
    const parts = dur.trim().split(':');
    let h = null;
    let m = null;
    let s = null;
    
    if (parts.length === 3) {
      h = parts[0] !== '' ? parseInt(parts[0], 10) : null;
      m = parts[1] !== '' ? parseInt(parts[1], 10) : null;
      s = parts[2] !== '' ? parseInt(parts[2], 10) : null;
    } else if (parts.length === 2) {
      m = parts[0] !== '' ? parseInt(parts[0], 10) : null;
      s = parts[1] !== '' ? parseInt(parts[1], 10) : null;
      h = null;
    } else if (parts.length === 1) {
      s = parts[0] !== '' ? parseInt(parts[0], 10) : null;
      h = null;
      m = null;
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
    const h = current.hours ?? 0;
    const m = current.minutes ?? 0;
    const s = current.seconds ?? 0;
    
    const newH = type === 'h' ? val : h;
    const newM = type === 'm' ? val : m;
    const newS = type === 's' ? val : s;
    
    const formatted = formatDurationStr(newH, newM, newS);
    onChange('duration', formatted);
  };

  const [openDropdown, setOpenDropdown] = React.useState<'hours' | 'minutes' | 'seconds' | 'target' | null>(null);

  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const isWalkRunning = path.includes('/walk-runing');
  const targetOptions = isWalkRunning
    ? ['3 KM', '5 KM', '10 KM', '21 KM']
    : ['10 KM', '25 KM', '50 KM', '100 KM'];

  const currentTarget = data.distance && data.distanceUnit
    ? `${parseFloat(data.distance)} ${data.distanceUnit}`
    : 'SELECT TARGET';

  const isTargetOpen = openDropdown === 'target';

  const renderTimePickerDropdown = (
    currentValue: number | null,
    type: 'h' | 'm' | 's',
    maxVal: number
  ) => {
    const dropdownType = type === 'h' ? 'hours' : type === 'm' ? 'minutes' : 'seconds';
    const isOpen = openDropdown === dropdownType;
    const isPlaceholder = currentValue === null;
    const displayVal = isPlaceholder
      ? (type === 'h' ? 'HH' : type === 'm' ? 'MM' : 'SS')
      : String(currentValue).padStart(2, '0');
    
    return (
      <div className="flex-1 relative">
        <button
          type="button"
          onClick={() => setOpenDropdown(isOpen ? null : dropdownType)}
          className={`w-full h-11 px-3 text-sm bg-white border-2 border-[#E2E8F0] rounded-sm focus:outline-none focus:border-[#1A2B4C] flex items-center justify-between cursor-pointer select-none transition-colors ${
            isPlaceholder ? 'text-slate-400 font-normal' : 'text-[#1A2B4C] font-semibold'
          }`}
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


      {/* Section 2: Core Inputs */}
      <div className={`grid grid-cols-1 gap-4 bg-white  rounded-sm ${mobileStep === 2 ? 'hidden md:grid' : 'grid'}`} id="form-core-inputs">
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
              placeholder="ENTER YOUR NAME"
              className={`w-full h-11 px-4 text-sm font-semibold bg-white border-2 rounded-sm focus:outline-none transition-colors ${
                errors.name ? 'border-red-500 focus:border-red-600' : 'border-[#E2E8F0] focus:border-[#1A2B4C]'
              }`}
            />
          </div>
          {errors.name && (
            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-3 h-3" /> {errors.name}
            </p>
          )}
        </div>

        {/* Registered phone number */}
        <div>
          <label htmlFor="input-phone" className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1">
            <Phone className="w-3.5 h-3.5 text-[#64748B]" /> Registered Phone Number *
          </label>
          <div className="relative">
            <input
              type="tel"
              id="input-phone"
              maxLength={10}
              value={data.phoneNumber || ''}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                onChange('phoneNumber', val);
              }}
              placeholder="ENTER YOUR NUMBER"
              className={`w-full h-11 px-4 text-sm font-semibold bg-white border-2 rounded-sm focus:outline-none transition-colors ${
                errors.phoneNumber ? 'border-red-500 focus:border-red-600' : 'border-[#E2E8F0] focus:border-[#1A2B4C]'
              }`}
            />
          </div>
          {errors.phoneNumber && (
            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-3 h-3" /> {errors.phoneNumber}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="input-email" className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-[#64748B]" /> Email Address *
          </label>
          <div className="relative">
            <input
              type="email"
              id="input-email"
              value={data.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
              placeholder="ENTER YOUR EMAIL"
              className={`w-full h-11 px-4 text-sm font-semibold bg-white border-2 rounded-sm focus:outline-none transition-colors ${
                errors.email ? 'border-red-500 focus:border-red-600' : 'border-[#E2E8F0] focus:border-[#1A2B4C]'
              }`}
            />
          </div>
          {errors.email && (
            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-3 h-3" /> {errors.email}
            </p>
          )}
        </div>

        {/* Activity Date */}
        <div>
          <label htmlFor="input-ride-date" className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#64748B]" /> Activity Date *
          </label>
          <div className="relative">
            <input
              type={data.rideDate ? "date" : "text"}
              id="input-ride-date"
              value={data.rideDate}
              placeholder="DD-MM-YYYY"
              onFocus={(e) => {
                e.target.type = 'date';
              }}
              onBlur={(e) => {
                if (!e.target.value) {
                  e.target.type = 'text';
                }
              }}
              onChange={(e) => onChange('rideDate', e.target.value)}
              className={`w-full h-11 px-4 text-sm bg-white border-2 rounded-sm focus:outline-none transition-colors uppercase ${
                data.rideDate ? 'text-[#1A2B4C] font-semibold' : 'text-slate-400 font-normal'
              } ${
                errors.rideDate ? 'border-red-500 focus:border-red-600' : 'border-[#E2E8F0] focus:border-[#1A2B4C]'
              }`}
            />
          </div>
          {errors.rideDate && (
            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-3 h-3" /> {errors.rideDate}
            </p>
          )}
        </div>

        {/* Target Dropdown */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-[#64748B]" /> Target Distance *
          </label>
          <div className="relative w-full">
            <button
              type="button"
              onClick={() => setOpenDropdown(isTargetOpen ? null : 'target')}
              className={`w-full h-11 px-4 text-sm font-semibold bg-white border-2 rounded-sm focus:outline-none flex items-center justify-between cursor-pointer select-none transition-colors ${
                errors.distance ? 'border-red-500' : 'border-[#E2E8F0] focus:border-[#1A2B4C]'
              }`}
            >
              <span className={currentTarget === 'SELECT TARGET' ? 'text-slate-400 font-normal' : 'text-[#1A2B4C]'}>
                {currentTarget}
              </span>
              <ChevronDown className={`w-4 h-4 text-[#64748B] transition-transform duration-200 ${isTargetOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isTargetOpen && (
              <>
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setOpenDropdown(null)} />
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-[#1A2B4C] rounded-sm max-h-56 overflow-y-auto z-50 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                  {targetOptions.map((opt) => {
                    const isSelected = currentTarget === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          onChange('distance', opt);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-xs font-bold transition-colors flex items-center justify-between uppercase ${
                          isSelected 
                            ? 'bg-[#1A2B4C] text-white' 
                            : 'text-[#1A2B4C] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          {errors.distance && (
            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-3 h-3" /> {errors.distance}
            </p>
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

            <span className="text-[#1A2B4C] font-semibold text-sm">:</span>

            {/* Minutes */}
            {renderTimePickerDropdown(minutes, 'm', 60)}

            <span className="text-[#1A2B4C] font-semibold text-sm">:</span>

            {/* Seconds */}
            {renderTimePickerDropdown(seconds, 's', 60)}
          </div>
          {errors.duration && (
            <p className="text-[10px] text-red-500 mt-1 leading-tight flex items-center gap-1 font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-3 h-3 flex-shrink-0" /> {errors.duration}
            </p>
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
