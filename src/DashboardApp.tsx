import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  Download, 
  Search, 
  LogOut, 
  Key, 
  ShieldAlert, 
  Award, 
  Calendar, 
  Phone, 
  Mail, 
  RefreshCw, 
  Database,
  TrendingUp,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface CertificateLog {
  id: string;
  created_at: string;
  name: string;
  phone_number: string;
  email: string;
  activity_date: string;
  target_distance: string;
  duration: string;
  selected_template_id: string;
  certificate_type: string;
  event_name?: string;
  certificate_url?: string;
  completed_distance?: string;
}

interface EventSetting {
  id?: string;
  event_id: string;
  event_name: string;
  release_date: string | null;
  isTemp?: boolean;
}

interface CustomDateTimePickerProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

const CustomDateTimePicker = ({ value, onChange }: CustomDateTimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value ? new Date(value) : new Date());

  useEffect(() => {
    if (value) {
      setViewDate(new Date(value));
    }
  }, [value]);

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

  let currentHour = '00';
  let currentMinute = '00';
  let selectedDateString = '';
  
  if (value) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      selectedDateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      currentHour = String(d.getHours()).padStart(2, '0');
      currentMinute = String(d.getMinutes()).padStart(2, '0');
    }
  }

  const handleDateSelect = (dateStr: string) => {
    const combinedStr = `${dateStr}T${currentHour}:${currentMinute}:00`;
    const newDate = new Date(combinedStr);
    onChange(newDate.toISOString());
  };

  const handleTimeChange = (h: string, m: string) => {
    const dateStr = selectedDateString || new Date().toISOString().split('T')[0];
    const combinedStr = `${dateStr}T${h}:${m}:00`;
    const newDate = new Date(combinedStr);
    onChange(newDate.toISOString());
  };

  const handleSetToday = () => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const combinedStr = `${todayStr}T${h}:${m}:00`;
    onChange(new Date(combinedStr).toISOString());
    setViewDate(now);
  };

  const hoursArray = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minutesArray = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-10 px-3 bg-white border-2 border-[#E2E8F0] rounded-sm text-[#1A2B4C] text-xs font-semibold flex items-center justify-between hover:border-[#1A2B4C] transition-colors cursor-pointer"
      >
        <span className={!value ? 'text-slate-400 font-normal' : 'text-[#1A2B4C]'}>
          {value ? (() => {
            const d = new Date(value);
            const pad = (num: number) => String(num).padStart(2, '0');
            return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
          })() : 'DD-MM-YYYY --:--'}
        </span>
        <Calendar className="w-4 h-4 text-[#64748B]" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full mt-1 bg-white border-2 border-[#1A2B4C] rounded-sm p-4 z-50 shadow-[0_4px_12px_rgba(0,0,0,0.1)] w-80 max-w-[calc(100vw-2.5rem)]">
            {/* Calendar header */}
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

            {/* Weekdays header */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-slate-400 uppercase mb-2">
              <span>Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Calendar grid of days */}
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(viewDate).map((cell, idx) => {
                const isSelected = selectedDateString === cell.dateString;
                const isToday = new Date().toDateString() === new Date(cell.dateString).toDateString();
                
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDateSelect(cell.dateString)}
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

            {/* Time select & Actions */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-2.5 mt-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400">Time:</span>
                <select
                  value={currentHour}
                  onChange={(e) => handleTimeChange(e.target.value, currentMinute)}
                  className="h-8 px-1.5 text-xs font-bold border border-[#E2E8F0] rounded-sm text-[#1A2B4C] focus:outline-none focus:border-[#1A2B4C] bg-white cursor-pointer"
                >
                  {hoursArray.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
                <span className="text-[#1A2B4C] font-bold text-xs">:</span>
                <select
                  value={currentMinute}
                  onChange={(e) => handleTimeChange(currentHour, e.target.value)}
                  className="h-8 px-1.5 text-xs font-bold border border-[#E2E8F0] rounded-sm text-[#1A2B4C] focus:outline-none focus:border-[#1A2B4C] bg-white cursor-pointer"
                >
                  {minutesArray.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              
              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onChange(null);
                    setIsOpen(false);
                  }}
                  className="text-[10px] font-black uppercase text-red-500 hover:text-red-700 transition cursor-pointer"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSetToday();
                    setIsOpen(false);
                  }}
                  className="text-[10px] font-black uppercase text-[#C5A059] hover:text-[#B48F48] transition cursor-pointer"
                >
                  Today
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default function DashboardApp() {
  // Authentication State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('admin_auth') === 'true';
  });
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dashboard Data State
  const [logs, setLogs] = useState<CertificateLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'cycling' | 'walk-running'>('all');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Event settings state
  const [eventSettings, setEventSettings] = useState<EventSetting[]>([]);
  const [isSavingSettings, setIsSavingSettings] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  useEffect(() => {
    const debugDB = async () => {
      try {
        const { data, error } = await supabase
          .from('dashboard_users')
          .select('*');
        console.log('DEBUG [DB Users List]:', data);
        if (error) console.error('DEBUG [DB Users Error]:', error);
      } catch (e) {
        console.error('DEBUG [DB Catch]:', e);
      }
    };
    debugDB();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
      fetchEventSettings();
    }
  }, [isAuthenticated]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEventSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('event_settings')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        // Table might not exist yet if migration hasn't been run
        if (error.code === 'PGRST205') {
          setSettingsError("Warning: Table 'event_settings' not found in database. Please run the SQL migration in your Supabase SQL Editor.");
        }
        throw error;
      }
      
      let list = data || [];
      if (!list.some(item => item.event_id === 'youth-day')) {
        list = [...list, { event_id: 'youth-day', event_name: 'International Youth Day Virtual Challenge', release_date: null }];
      }
      if (!list.some(item => item.event_id === 'independence-day')) {
        list = [...list, { event_id: 'independence-day', event_name: 'Independence Day Virtual Challenge', release_date: null }];
      }
      setEventSettings(list);
    } catch (err) {
      console.error('Error fetching event settings:', err);
    }
  };

  const handleSaveEventSetting = async (eventSetting: EventSetting) => {
    if (!eventSetting.event_id.trim()) {
      setSettingsError('Event ID is required');
      return;
    }
    if (!eventSetting.event_name.trim()) {
      setSettingsError('Event Name is required');
      return;
    }

    const saveKey = eventSetting.id || eventSetting.event_id || 'new';
    setIsSavingSettings(saveKey);
    setSettingsError('');
    setSettingsSuccess('');
    try {
      const payload: any = {
        event_id: eventSetting.event_id.trim().toLowerCase(),
        event_name: eventSetting.event_name.trim(),
        release_date: eventSetting.release_date || null
      };
      if (eventSetting.id) {
        payload.id = eventSetting.id;
      }

      const { error } = await supabase
        .from('event_settings')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        if (error.code === 'PGRST205') {
          throw new Error("Table 'event_settings' not found. Make sure to run the SQL migration in your Supabase console.");
        }
        if (error.code === '23505') {
          throw new Error(`Event ID "${eventSetting.event_id}" already exists. Please choose a unique Event ID.`);
        }
        throw error;
      }
      setSettingsSuccess(`Settings for "${eventSetting.event_name}" saved successfully!`);
      await fetchEventSettings();
    } catch (err: any) {
      console.error('Error saving event setting:', err);
      setSettingsError(err.message || 'Error saving event settings');
    } finally {
      setIsSavingSettings(null);
    }
  };

  const handleAddNewEventSetting = () => {
    setEventSettings(prev => [
      ...prev,
      {
        event_id: '',
        event_name: '',
        release_date: null,
        isTemp: true
      }
    ]);
  };

  const handleDeleteEventSetting = async (eventId: string) => {
    if (!confirm(`Are you sure you want to delete settings for event "${eventId}"?`)) return;
    setSettingsError('');
    setSettingsSuccess('');
    try {
      const { error } = await supabase
        .from('event_settings')
        .delete()
        .eq('event_id', eventId);

      if (error) throw error;
      setSettingsSuccess(`Event restriction for "${eventId}" deleted successfully.`);
      await fetchEventSettings();
    } catch (err: any) {
      console.error('Error deleting event setting:', err);
      setSettingsError(err.message || 'Error deleting event settings');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');
    try {
      const { data: userData, error } = await supabase
        .from('dashboard_users')
        .select('id')
        .eq('username', username.trim().toLowerCase())
        .eq('password', password)
        .maybeSingle();

      if (error) throw error;

      if (userData) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_auth', 'true');
      } else {
        setAuthError('INVALID USERNAME OR PASSWORD');
      }
    } catch (err) {
      console.error('Login error:', err);
      setAuthError('DATABASE CONNECTION ERROR');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    setUsername('');
    setPassword('');
  };

  // Filter logs based on search term and certificate type
  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.phone_number.includes(searchTerm) ||
      log.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = 
      typeFilter === 'all' || 
      log.certificate_type === typeFilter;

    return matchesSearch && matchesType;
  });

  // Reset page on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const startItem = filteredLogs.length === 0 ? 0 : startIndex + 1;
  const endItem = Math.min(startIndex + ITEMS_PER_PAGE, filteredLogs.length);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      pages.push(totalPages);
    }
    return pages;
  };

  // Calculate statistics metrics
  const totalCount = logs.length;
  const cyclingCount = logs.filter(log => log.certificate_type === 'cycling').length;
  const walkRunCount = logs.filter(log => log.certificate_type === 'walk-running').length;

  // Build CSV and trigger browser file download
  const handleExportCSV = () => {
    const headers = [
      'RECORD ID', 
      'DATE COMPILATION', 
      'RECIPIENT NAME', 
      'PHONE NUMBER', 
      'EMAIL ADDRESS', 
      'ACTIVITY DATE', 
      'TARGET DISTANCE', 
      'COMPLETED DISTANCE',
      'DURATION', 
      'TEMPLATE ID', 
      'CERTIFICATE TYPE',
      'EVENT NAME',
      'CERTIFICATE URL',
      'ACTIVITY PROOF URL'
    ];

    const rows = filteredLogs.map(log => [
      log.id,
      new Date(log.created_at).toLocaleString(),
      log.name,
      log.phone_number,
      log.email,
      log.activity_date,
      log.target_distance,
      log.completed_distance || 'N/A',
      log.duration,
      log.selected_template_id,
      log.certificate_type,
      log.event_name || 'N/A',
      log.certificate_url || 'N/A',
      log.activity_proof_url || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pedals_power_certificates_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* ================= AUTHENTICATION LOGIN SCREEN ================= */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans text-[#1A2B4C]" id="auth-root">
        <div className="w-full max-w-md bg-white border-2 border-[#E2E8F0] p-8 rounded-sm shadow-none space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-[#1A2B4C] flex items-center justify-center font-black text-white text-2xl rounded-sm mx-auto">
              P
            </div>
            <h1 className="text-xl font-black uppercase tracking-wider">Pedals Power</h1>
            <p className="text-xs text-[#64748B] uppercase tracking-widest font-bold">Admin Logs Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" id="login-form">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#64748B] mb-1.5">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-11 px-4 text-sm font-semibold bg-white border-2 border-[#E2E8F0] focus:border-[#1A2B4C] rounded-sm focus:outline-none transition-colors placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#64748B] mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pl-4 pr-10 text-sm font-semibold bg-white border-2 border-[#E2E8F0] focus:border-[#1A2B4C] rounded-sm focus:outline-none transition-colors placeholder:text-slate-400 placeholder:font-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-slate-400 hover:text-black focus:outline-none transition cursor-pointer select-none"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <p className="text-[10px] text-red-500 font-black uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full h-12 bg-[#1A2B4C] hover:bg-[#2D4263] text-white border-2 border-[#1A2B4C] font-black uppercase tracking-widest text-xs rounded-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Key className="w-4 h-4" />
              )}
              {isLoggingIn ? 'AUTHENTICATING...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ================= DASHBOARD CONSOLE SCREEN ================= */
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1A2B4C] font-sans flex flex-col" id="dashboard-console">
      {/* Header Panel */}
      <header className="bg-white border-b-2 border-[#E2E8F0] sticky top-0 z-40 px-6 py-4 flex items-center justify-between" id="dashboard-header">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1A2B4C] flex items-center justify-center font-black text-white text-lg rounded-sm">
            P
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black uppercase tracking-wider">Pedals Power Admin</h1>
            <p className="text-[9px] text-[#64748B] font-bold uppercase tracking-widest mt-0.5">Certificates Database Log</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="px-3.5 py-1.5 text-xs font-black bg-[#F8FAFC] hover:bg-[#E2E8F0] border-2 border-[#E2E8F0] rounded-sm flex items-center gap-1.5 cursor-pointer transition-colors uppercase tracking-widest"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </header>

      {/* Main Console Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Statistics Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="stats-banner">
          {/* Card 1: Total logs */}
          <div className="bg-white border-2 border-[#E2E8F0] p-4 rounded-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">Total Certificates</p>
              <h3 className="text-2xl font-black mt-1">{totalCount}</h3>
            </div>
            <div className="w-10 h-10 bg-[#1A2B4C]/10 text-[#1A2B4C] flex items-center justify-center rounded-sm">
              <Database className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Cycling logs */}
          <div className="bg-white border-2 border-[#E2E8F0] p-4 rounded-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">Cycling Records</p>
              <h3 className="text-2xl font-black mt-1">{cyclingCount}</h3>
            </div>
            <div className="w-10 h-10 bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center rounded-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Walk-Run logs */}
          <div className="bg-white border-2 border-[#E2E8F0] p-4 rounded-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#64748B]">Walk/Running Records</p>
              <h3 className="text-2xl font-black mt-1">{walkRunCount}</h3>
            </div>
            <div className="w-10 h-10 bg-[#1A2B4C]/10 text-[#1A2B4C] flex items-center justify-center rounded-sm">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Event Release Restrictions Settings Panel */}
        <div className="bg-white border-2 border-[#E2E8F0] p-4 sm:p-6 rounded-sm space-y-4" id="event-restrictions-settings">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-[#1A2B4C]">Certificate Release Restrictions</h2>
                <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-widest mt-0.5">Prevent certificate download prior to event date</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddNewEventSetting}
              className="px-3 py-1.5 bg-[#1A2B4C] hover:bg-[#2D4263] text-white text-[10px] font-black uppercase tracking-widest rounded-sm transition-colors flex items-center justify-center gap-1 cursor-pointer w-full sm:w-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Event Restriction
            </button>
          </div>

          {settingsError && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{settingsError}</span>
            </div>
          )}

          {settingsSuccess && (
            <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 flex-shrink-0" />
              <span>{settingsSuccess}</span>
            </div>
          )}

          <div className="space-y-6">
            {eventSettings.map((setting, idx) => {

              return (
                <div key={setting.event_id || `temp-${idx}`} className="border border-[#E2E8F0] p-3.5 sm:p-4 rounded-sm space-y-4 bg-[#F8FAFC]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B] shrink-0">Event ID:</span>
                      <input
                        type="text"
                        placeholder="e.g. youth-day"
                        value={setting.event_id}
                        onChange={(e) => {
                          const updated = [...eventSettings];
                          updated[idx].event_id = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, '');
                          setEventSettings(updated);
                        }}
                        className="h-8 px-2 text-xs font-mono font-bold text-[#1A2B4C] bg-white border border-[#E2E8F0] rounded-sm focus:outline-none focus:border-[#1A2B4C] transition-colors w-full sm:w-40"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
                      {!setting.isTemp && (
                        <button
                          type="button"
                          onClick={() => handleDeleteEventSetting(setting.event_id)}
                          className="text-[9px] font-black text-red-500 hover:text-red-700 uppercase cursor-pointer flex items-center gap-0.5 border border-red-200 bg-red-50 px-2 py-1 rounded-sm transition-colors"
                          title="Delete this restriction permanently"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete Setting
                        </button>
                      )}
                      {setting.isTemp && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = eventSettings.filter((_, i) => i !== idx);
                            setEventSettings(updated);
                          }}
                          className="text-[9px] font-black text-slate-500 hover:text-black uppercase cursor-pointer border border-slate-200 bg-white px-2 py-1 rounded-sm transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <span className="text-[9px] font-black px-2 py-1 bg-[#C5A059]/10 border border-[#C5A059]/30 text-[#C5A059] rounded-sm uppercase tracking-wider whitespace-nowrap">
                        {setting.release_date ? 'RESTRICTION ACTIVE' : 'NO RESTRICTION'}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-[#64748B] mb-1.5">
                        Event Display Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Independence Day Virtual Challenge"
                        value={setting.event_name}
                        onChange={(e) => {
                          const updated = [...eventSettings];
                          updated[idx].event_name = e.target.value;
                          setEventSettings(updated);
                        }}
                        className="w-full h-10 px-3 text-xs font-semibold bg-white border-2 border-[#E2E8F0] rounded-sm focus:outline-none focus:border-[#1A2B4C] transition-colors"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-[10px] font-black uppercase tracking-wider text-[#64748B] mb-1.5 flex items-center justify-between">
                        <span>Release Date & Time</span>
                        {setting.release_date && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...eventSettings];
                              updated[idx].release_date = null;
                              setEventSettings(updated);
                            }}
                            className="text-[9px] font-black text-red-500 uppercase hover:underline cursor-pointer"
                          >
                            Clear Restriction
                          </button>
                        )}
                      </label>
                      <CustomDateTimePicker
                        value={setting.release_date}
                        onChange={(val) => {
                          const updated = [...eventSettings];
                          updated[idx].release_date = val;
                          setEventSettings(updated);
                        }}
                      />
                    </div>

                    <div className="md:col-span-3">
                      <button
                        type="button"
                        disabled={isSavingSettings === (setting.id || setting.event_id || 'new')}
                        onClick={() => handleSaveEventSetting(setting)}
                        className="w-full h-10 bg-[#1A2B4C] hover:bg-[#2D4263] disabled:opacity-50 text-white font-black text-[10px] uppercase tracking-widest rounded-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isSavingSettings === (setting.id || setting.event_id || 'new') ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Database className="w-3.5 h-3.5" />
                            Save Restrictions
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Database Search & Controls */}
        <div className="bg-white border-2 border-[#E2E8F0] p-4 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4" id="db-controls">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1 relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="SEARCH RECIPIENT, PHONE, OR EMAIL..."
                className="w-full h-10 pl-9 pr-4 text-xs font-semibold bg-white border-2 border-[#E2E8F0] rounded-sm focus:outline-none focus:border-[#1A2B4C] transition-colors placeholder:text-slate-400 placeholder:font-normal uppercase"
              />
            </div>

            {/* Type Filter Select */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="h-10 px-3 text-xs font-semibold bg-white border-2 border-[#E2E8F0] rounded-sm focus:outline-none focus:border-[#1A2B4C] cursor-pointer"
            >
              <option value="all">ALL CATEGORIES</option>
              <option value="cycling">CYCLING ONLY</option>
              <option value="walk-running">WALK & RUN ONLY</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchLogs}
              title="Refresh logs"
              className="h-10 w-10 border-2 border-[#E2E8F0] hover:bg-[#F8FAFC] flex items-center justify-center rounded-sm transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-[#1A2B4C] ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredLogs.length === 0}
              className={`h-10 px-4 text-xs font-black uppercase tracking-widest rounded-sm border-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
                filteredLogs.length > 0
                  ? 'bg-[#1A2B4C] hover:bg-[#2D4263] border-[#1A2B4C] text-white'
                  : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              Export to CSV
            </button>
          </div>
        </div>

        {/* Database Grid Logs Table */}
        <div className="bg-white border-2 border-[#E2E8F0] rounded-sm overflow-hidden" id="db-records-view">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b-2 border-[#E2E8F0] text-[9px] font-black uppercase tracking-wider text-[#64748B]">
                  <th className="p-3 pl-4">Recipient Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Activity Date</th>
                  <th className="p-3">Target Dist.</th>
                  <th className="p-3">Completed Dist.</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Template ID</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Event Name</th>
                  <th className="p-3">Certificate Preview</th>
                  <th className="p-3">Activity Proof</th>
                  <th className="p-3 pr-4">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs font-semibold text-[#1A2B4C]">
                {isLoading ? (
                  <tr>
                    <td colSpan={13} className="p-10 text-center text-[#64748B]">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#94A3B8] mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-wider">Retrieving logs from database...</p>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="p-10 text-center text-[#64748B]">
                      <Database className="w-8 h-8 mx-auto text-[#94A3B8] mb-2 opacity-50" />
                      <p className="text-[10px] font-black uppercase tracking-wider">No matching database records found</p>
                    </td>
                  </tr>
                ) : (
                  paginatedLogs.map(log => (
                    <tr key={log.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                      <td className="p-3 pl-4 font-bold uppercase">{log.name}</td>
                      <td className="p-3 font-mono">{log.phone_number}</td>
                      <td className="p-3 lowercase font-mono">{log.email}</td>
                      <td className="p-3 font-mono">
                        {new Date(log.activity_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-3">{log.target_distance}</td>
                      <td className="p-3 font-mono text-[#C5A059] font-bold">{log.completed_distance || 'N/A'}</td>
                      <td className="p-3 font-mono">{log.duration}</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-0.5 bg-[#1A2B4C]/10 border border-[#1A2B4C]/25 rounded-sm font-mono text-[10px]">
                          {log.selected_template_id}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[9px] font-black rounded-sm uppercase tracking-wider border ${
                          log.certificate_type === 'cycling'
                            ? 'bg-[#C5A059]/10 border-[#C5A059]/30 text-[#C5A059]'
                            : 'bg-[#1A2B4C]/10 border-[#1A2B4C]/30 text-[#1A2B4C]'
                        }`}>
                          {log.certificate_type}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-xs text-[#64748B]">
                        {log.event_name || 'N/A'}
                      </td>
                      <td className="p-3">
                        {log.certificate_url ? (
                          <button
                            type="button"
                            onClick={() => setSelectedImageUrl(log.certificate_url!)}
                            className="group relative block overflow-hidden rounded border border-[#E2E8F0] transition hover:border-[#1A2B4C] focus:outline-none cursor-pointer"
                          >
                            <img
                              src={log.certificate_url}
                              alt="Certificate thumbnail"
                              className="h-8 w-12 object-cover transition duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <span className="text-[8px] text-white font-black uppercase tracking-wider">VIEW</span>
                            </div>
                          </button>
                        ) : (
                          <span className="text-slate-400 font-normal italic text-[10px]">N/A</span>
                        )}
                      </td>
                      <td className="p-3">
                        {log.activity_proof_url ? (
                          <button
                            type="button"
                            onClick={() => setSelectedImageUrl(log.activity_proof_url!)}
                            className="group relative block overflow-hidden rounded border border-[#E2E8F0] transition hover:border-[#1A2B4C] focus:outline-none cursor-pointer"
                          >
                            <img
                              src={log.activity_proof_url}
                              alt="Activity proof thumbnail"
                              className="h-8 w-12 object-cover transition duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                              <span className="text-[8px] text-white font-black uppercase tracking-wider">VIEW</span>
                            </div>
                          </button>
                        ) : (
                          <span className="text-slate-400 font-normal italic text-[10px]">N/A</span>
                        )}
                      </td>
                      <td className="p-3 pr-4 font-mono text-[#64748B] text-[10px]">
                        {new Date(log.created_at).toLocaleString('en-US', { hour12: false })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {!isLoading && filteredLogs.length > 0 && (
            <div className="px-4 py-3 bg-[#F8FAFC] border-t-2 border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-[#64748B]">
              <div className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                Showing <span className="font-bold text-[#1A2B4C]">{startItem}</span> to <span className="font-bold text-[#1A2B4C]">{endItem}</span> of <span className="font-bold text-[#1A2B4C]">{filteredLogs.length}</span> records
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-2.5 py-1 rounded-sm border-2 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors ${
                    currentPage === 1
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-[#1A2B4C] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#1A2B4C] cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Prev
                </button>

                <div className="flex items-center gap-1 px-1">
                  {getPageNumbers().map((page, idx) => (
                    typeof page === 'number' ? (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`w-7 h-7 flex items-center justify-center rounded-sm border-2 text-[10px] font-black transition-colors ${
                          currentPage === page
                            ? 'bg-[#1A2B4C] text-white border-[#1A2B4C]'
                            : 'bg-white text-[#1A2B4C] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#1A2B4C] cursor-pointer'
                        }`}
                      >
                        {page}
                      </button>
                    ) : (
                      <span key={idx} className="px-1 text-slate-400 font-bold text-[10px]">
                        {page}
                      </span>
                    )
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-2.5 py-1 rounded-sm border-2 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors ${
                    currentPage === totalPages
                      ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                      : 'bg-white text-[#1A2B4C] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#1A2B4C] cursor-pointer'
                  }`}
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Modal Previewer */}
      {selectedImageUrl && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 md:p-6"
          onClick={() => setSelectedImageUrl(null)}
        >
          {/* Modal Wrapper */}
          <div 
            className="relative max-w-4xl w-full bg-white border border-slate-200 rounded-sm shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()} // prevent close on inner click
          >
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[#1A2B4C] flex items-center justify-center font-black text-white text-[10px] rounded-sm">
                  P
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-[#1A2B4C]">
                  Certificate Image Log Preview
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImageUrl(null)}
                className="text-[10px] font-black text-slate-400 hover:text-black uppercase tracking-widest transition-colors cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Image Display */}
            <div className="p-6 bg-slate-100 flex items-center justify-center min-h-[300px] max-h-[65vh] overflow-auto">
              <img 
                src={selectedImageUrl} 
                alt="Full Certificate Preview" 
                className="max-w-full max-h-[55vh] object-contain shadow-lg rounded border border-white"
              />
            </div>

            {/* Footer Actions */}
            <div className="px-5 py-3.5 border-t border-slate-200 flex items-center justify-end bg-slate-50 gap-2">
              <a
                href={selectedImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#1A2B4C] hover:bg-[#2D4263] text-white text-[10px] font-black uppercase tracking-widest rounded-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Open Original File
              </a>
              <button
                type="button"
                onClick={() => setSelectedImageUrl(null)}
                className="px-4 py-2 border-2 border-slate-200 text-slate-500 hover:text-black text-[10px] font-black uppercase tracking-widest rounded-sm bg-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
