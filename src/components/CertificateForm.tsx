/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CertificateData, TEMPLATES, TemplateConfig } from '../types';
import { getTemplateForEvent } from '../events';
import { Award, Timer, Navigation, Calendar, Edit3, ShieldAlert, BadgeCheck, ChevronDown, Phone, Mail, TrendingUp, Upload, Image, Loader2, Trash2 } from 'lucide-react';

interface CertificateFormProps {
  data: CertificateData;
  onChange: (key: keyof CertificateData, value: string) => void;
  isValid: boolean;
  onGenerate: () => void;
  errors: { [key: string]: string };
  loadDemo: (type: 'morning' | 'century') => void;
  mobileStep?: number;
  isUploadingProof?: boolean;
  onUploadProof?: (file: File) => Promise<string | null>;
}

export const CertificateForm: React.FC<CertificateFormProps> = ({
  data,
  onChange,
  isValid,
  onGenerate,
  errors,
  loadDemo,
  mobileStep = 1,
  isUploadingProof = false,
  onUploadProof,
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

  const [openDropdown, setOpenDropdown] = React.useState<'hours' | 'minutes' | 'seconds' | 'target' | 'date' | null>(null);
  const [viewDate, setViewDate] = React.useState(() => data.rideDate ? new Date(data.rideDate) : new Date());

  React.useEffect(() => {
    if (data.rideDate) {
      setViewDate(new Date(data.rideDate));
    }
  }, [data.rideDate]);

  const getDaysInMonth = (dateDate: Date) => {
    const year = dateDate.getFullYear();
    const month = dateDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    const days: { day: number; isCurrentMonth: boolean; dateString: string }[] = [];
    
    // Prev month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthTotalDays - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateString = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, isCurrentMonth: false, dateString });
    }
    
    // Active month days
    for (let d = 1; d <= totalDays; d++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, isCurrentMonth: true, dateString });
    }
    
    // Next month padding to fill complete grid of 42 cells
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateString = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, isCurrentMonth: false, dateString });
    }
    
    return days;
  };

  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const isWalkRunning = path.includes('/walk-runing');
  const targetOptions = isWalkRunning
    ? ['3 KM', '5 KM', '10 KM', '21 KM']
    : ['10 KM', '25 KM', '50 KM', '100 KM'];

  const currentTarget = data.distance && data.distanceUnit
    ? `${parseFloat(data.distance)} ${data.distanceUnit}`
    : 'SELECT TARGET';

  const isTargetOpen = openDropdown === 'target';
  const isDateOpen = openDropdown === 'date';

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
            <Calendar className="w-3.5 h-3.5 text-[#64748B]" /> Activity Date *
          </label>
          <div className="relative w-full">
            <button
              type="button"
              id="input-ride-date"
              onClick={() => setOpenDropdown(isDateOpen ? null : 'date')}
              className={`w-full h-11 px-4 text-sm font-semibold bg-white border-2 rounded-sm focus:outline-none flex items-center justify-between cursor-pointer select-none transition-colors ${
                errors.rideDate ? 'border-red-500' : 'border-[#E2E8F0] focus:border-[#1A2B4C]'
              }`}
            >
              <span className={!data.rideDate ? 'text-slate-400 font-normal animate-fade-in' : 'text-[#1A2B4C]'}>
                {data.rideDate
                  ? new Date(data.rideDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                  : 'DD-MM-YYYY'}
              </span>
              <Calendar className="w-4 h-4 text-[#64748B]" />
            </button>
            
            {isDateOpen && (
              <>
                {/* Backdrop to dismiss calendar on external clicks */}
                <div 
                  className="fixed inset-0 z-40 bg-transparent" 
                  onClick={() => setOpenDropdown(null)} 
                />
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border-2 border-[#1A2B4C] rounded-sm p-4 z-50 shadow-[0_4px_12px_rgba(0,0,0,0.1)] w-full">
                  {/* Header Month/Year Selector & Navigation */}
                  <div className="flex items-center justify-between mb-3.5">
                    <button
                      type="button"
                      onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                      className="p-1 hover:bg-slate-100 rounded transition-colors text-[#1A2B4C] font-black text-sm select-none"
                    >
                      ←
                    </button>
                    <span className="text-xs font-black uppercase tracking-wider text-[#1A2B4C]">
                      {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                    <button
                      type="button"
                      onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                      className="p-1 hover:bg-slate-100 rounded transition-colors text-[#1A2B4C] font-black text-sm select-none"
                    >
                      →
                    </button>
                  </div>

                  {/* Weekday letters header */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 uppercase mb-2">
                    <span>Su</span>
                    <span>Mo</span>
                    <span>Tu</span>
                    <span>We</span>
                    <span>Th</span>
                    <span>Fr</span>
                    <span>Sa</span>
                  </div>

                  {/* Days grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {getDaysInMonth(viewDate).map((cell, idx) => {
                      const isSelected = data.rideDate === cell.dateString;
                      const isToday = new Date().toDateString() === new Date(cell.dateString).toDateString();
                      
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            onChange('rideDate', cell.dateString);
                            setOpenDropdown(null);
                          }}
                          className={`h-8 w-8 text-xs font-bold rounded-full transition flex items-center justify-center mx-auto cursor-pointer ${
                            isSelected
                              ? 'bg-[#1A2B4C] text-white hover:bg-[#1A2B4C]'
                              : !cell.isCurrentMonth
                              ? 'text-slate-300 hover:bg-slate-50'
                              : isToday
                              ? 'border-2 border-[#1A2B4C] text-[#1A2B4C] hover:bg-slate-50'
                              : 'text-[#1A2B4C] hover:bg-slate-100'
                          }`}
                        >
                          {cell.day}
                        </button>
                      );
                    })}
                  </div>

                  {/* Quick selection shortcuts */}
                  <div className="flex items-center justify-between border-t border-slate-200 pt-2.5 mt-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        onChange('rideDate', '');
                        setOpenDropdown(null);
                      }}
                      className="text-[10px] font-black uppercase text-red-500 hover:text-red-700 transition"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const todayStr = new Date().toISOString().split('T')[0];
                        onChange('rideDate', todayStr);
                        setViewDate(new Date());
                        setOpenDropdown(null);
                      }}
                      className="text-[10px] font-black uppercase text-[#C5A059] hover:text-[#B48F48] transition"
                    >
                      Today
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          {errors.rideDate && (
            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-3.5 h-3.5" /> {errors.rideDate}
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

        {/* Completed Distance */}
        <div>
          <label htmlFor="input-completed-distance" className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-[#64748B]" /> Completed Distance *
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              id="input-completed-distance"
              value={data.completedDistance || ''}
              onChange={(e) => onChange('completedDistance', e.target.value)}
              placeholder="ENTER COMPLETED DISTANCE (e.g. 50.0)"
              className={`w-full h-11 pl-4 pr-12 text-sm font-semibold bg-white border-2 rounded-sm focus:outline-none transition-colors ${
                errors.completedDistance ? 'border-red-500 focus:border-red-600' : 'border-[#E2E8F0] focus:border-[#1A2B4C]'
              }`}
            />
            <span className="absolute right-4 text-xs font-bold text-[#64748B] select-none pointer-events-none">
              KM
            </span>
          </div>
          {errors.completedDistance && (
            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-3 h-3" /> {errors.completedDistance}
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

        {/* Upload Activity Proof */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center gap-1">
            <Image className="w-3.5 h-3.5 text-[#64748B]" /> Upload Activity Proof *
          </label>
          <div className="relative">
            {data.activityProofUrl ? (
              // Uploaded/Success Preview state
              <div className="border-2 border-dashed border-[#1A2B4C] rounded-sm p-4 bg-slate-50 flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 bg-white border border-[#E2E8F0] rounded-sm overflow-hidden flex-shrink-0 relative shadow-sm">
                    <img
                      src={data.activityProofUrl}
                      alt="Activity proof preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1A2B4C] uppercase tracking-wider truncate">proof_uploaded.png</p>
                    <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5 animate-pulse">
                      <BadgeCheck className="w-3.5 h-3.5" /> Uploaded successfully
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onChange('activityProofUrl', '')}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0 cursor-pointer"
                  title="Remove Activity Proof"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              // Empty Upload Box
              <label
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-sm p-5 bg-white cursor-pointer transition-all duration-150 relative ${
                  errors.activityProofUrl
                    ? 'border-red-500 hover:border-red-600 bg-red-50/20'
                    : 'border-[#E2E8F0] hover:border-[#1A2B4C] hover:bg-slate-50/50'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && onUploadProof) {
                      await onUploadProof(file);
                    }
                  }}
                  disabled={isUploadingProof}
                  className="hidden"
                />
                
                {isUploadingProof ? (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#1A2B4C]" />
                    <p className="text-[10px] font-bold text-[#1A2B4C] uppercase tracking-wider">Uploading proof image...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-1.5 text-center">
                    <Upload className="w-6 h-6 text-[#64748B]" />
                    <p className="text-xs font-bold text-[#1A2B4C] uppercase tracking-wider">Choose image file</p>
                    <p className="text-[9px] text-[#64748B] uppercase tracking-widest font-medium">JPEG, PNG, GIF up to 5MB</p>
                  </div>
                )}
              </label>
            )}
          </div>
          {errors.activityProofUrl && (
            <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1 font-semibold uppercase tracking-wider">
              <ShieldAlert className="w-3 h-3" /> {errors.activityProofUrl}
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
