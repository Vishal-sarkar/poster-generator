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
  TrendingUp
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
}

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

  useEffect(() => {
    if (isAuthenticated) {
      fetchLogs();
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setAuthError('');
    try {
      const { data: userData, error } = await supabase
        .from('dashboard_users')
        .select('id')
        .eq('username', username.trim())
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
      'DURATION', 
      'TEMPLATE ID', 
      'CERTIFICATE TYPE',
      'EVENT NAME'
    ];

    const rows = filteredLogs.map(log => [
      log.id,
      new Date(log.created_at).toLocaleString(),
      log.name,
      log.phone_number,
      log.email,
      log.activity_date,
      log.target_distance,
      log.duration,
      log.selected_template_id,
      log.certificate_type,
      log.event_name || 'N/A'
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
                  placeholder="ENTER USERNAME"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-11 px-4 text-sm font-semibold bg-white border-2 border-[#E2E8F0] focus:border-[#1A2B4C] rounded-sm focus:outline-none transition-colors uppercase placeholder:text-slate-400 placeholder:font-normal"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-[#64748B] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="ENTER PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-4 text-sm font-semibold bg-white border-2 border-[#E2E8F0] focus:border-[#1A2B4C] rounded-sm focus:outline-none transition-colors uppercase placeholder:text-slate-400 placeholder:font-normal"
                />
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
                  <th className="p-3">Distance</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Template ID</th>
                  <th className="p-3">Event Type</th>
                  <th className="p-3">Event Name</th>
                  <th className="p-3 pr-4">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] text-xs font-semibold text-[#1A2B4C]">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="p-10 text-center text-[#64748B]">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#94A3B8] mb-2" />
                      <p className="text-[10px] font-black uppercase tracking-wider">Retrieving logs from database...</p>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-10 text-center text-[#64748B]">
                      <Database className="w-8 h-8 mx-auto text-[#94A3B8] mb-2 opacity-50" />
                      <p className="text-[10px] font-black uppercase tracking-wider">No matching database records found</p>
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                      <td className="p-3 pl-4 font-bold uppercase">{log.name}</td>
                      <td className="p-3 font-mono">{log.phone_number}</td>
                      <td className="p-3 lowercase font-mono">{log.email}</td>
                      <td className="p-3 font-mono">
                        {new Date(log.activity_date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-3">{log.target_distance}</td>
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
                      <td className="p-3 pr-4 font-mono text-[#64748B] text-[10px]">
                        {new Date(log.created_at).toLocaleString('en-US', { hour12: false })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
