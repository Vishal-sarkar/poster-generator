/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Award, 
  Timer, 
  Navigation, 
  Calendar, 
  Download, 
  Share2, 
  RefreshCw, 
  History, 
  X, 
  Plus, 
  Trash2, 
  ExternalLink, 
  FileText, 
  ChevronRight, 
  ChevronLeft,
  Settings, 
  CheckCircle,
  TrendingUp,
  Sliders,
  ChevronDown,
  ChevronUp,
  Lock
} from 'lucide-react';
import { CertificateData, TEMPLATES } from './types';
import { CertificatePreview } from './components/CertificatePreview';
import { CertificateForm } from './components/CertificateForm';
import { getTemplateForEvent } from './events';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { supabase } from './supabaseClient';
// @ts-ignore
import logoImg from '../assets/logo.jpeg';

// Initial state for certificate input
const DEFAULT_FORM_STATE: CertificateData = {
  name: '',
  duration: '',
  distance: '',
  distanceUnit: '',
  rideName: '',
  rideDate: '',
  selectedTemplateId: '1',
  signatureName: 'Unique Jain',
  signatureRole: 'Founder & CEO',
  signatureText: 'Unique Jain',
  phoneNumber: '',
  email: '',
  completedDistance: '',
  activityProofUrl: '',
};

interface SavedCertificate {
  id: string;
  name: string;
  duration: string;
  distance: string;
  rideName: string;
  date: string;
  imgUrl: string;
}

const CertificateLockScreen = ({ eventName, releaseDate, onBack }: { eventName: string; releaseDate: string; onBack: () => void }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(releaseDate) - +new Date();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [releaseDate]);

  const formattedDate = new Date(releaseDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-6 text-center max-w-2xl mx-auto space-y-8 my-12" id="lock-screen-container">
      {/* Icon with float animation */}
      <motion.div 
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="w-20 h-20 bg-[#C5A059]/10 text-[#C5A059] flex items-center justify-center rounded-full border-2 border-[#C5A059]/30 shadow-none"
      >
        <Lock className="w-10 h-10" />
      </motion.div>

      {/* Main text */}
      <div className="space-y-3">
        <h2 className="text-2xl font-black uppercase tracking-wider text-[#1A2B4C]">Certificates Locked</h2>
        <p className="text-xs text-[#64748B] font-bold uppercase tracking-widest leading-relaxed">
          The certificates for <span className="text-[#1A2B4C] font-black">{eventName}</span> are scheduled for release.
        </p>
      </div>

      {/* Countdown display */}
      <div className="grid grid-cols-4 gap-3 max-w-md w-full" id="lock-countdown">
        {[
          { label: 'DAYS', value: timeLeft.days },
          { label: 'HOURS', value: timeLeft.hours },
          { label: 'MINUTES', value: timeLeft.minutes },
          { label: 'SECONDS', value: timeLeft.seconds },
        ].map((item) => (
          <div key={item.label} className="bg-white border-2 border-[#E2E8F0] p-4 rounded-sm flex flex-col items-center">
            <span className="text-2xl sm:text-3xl font-black text-[#1A2B4C] font-mono">
              {String(item.value).padStart(2, '0')}
            </span>
            <span className="text-[9px] font-bold tracking-widest text-[#64748B] mt-1">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Official release notice */}
      <div className="bg-[#1A2B4C]/5 border border-[#1A2B4C]/15 p-4 rounded-sm w-full max-w-md flex flex-col items-center gap-1">
        <span className="text-[10px] font-black tracking-widest uppercase text-[#64748B]">Official Release Time</span>
        <span className="text-xs font-bold text-[#1A2B4C]">{formattedDate}</span>
      </div>

      {/* Back to Form Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 bg-white hover:bg-[#F8FAFC] border-2 border-[#E2E8F0] text-[#1A2B4C] font-black text-xs uppercase tracking-widest rounded-sm transition-colors cursor-pointer"
        >
          Back to Standard Form
        </button>
      </div>
    </div>
  );
};

export default function CertificateApp() {
  const [data, setData] = useState<CertificateData>(() => {
    const initialData = DEFAULT_FORM_STATE;

    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const eventName = searchParams ? searchParams.get('event') || '' : '';
    if (eventName) {
      const template = getTemplateForEvent(eventName);
      if (template) {
        return {
          ...initialData,
          selectedTemplateId: template.id
        };
      }
    }
    return initialData;
  });

  const [view, setView] = useState<'edit' | 'result'>('edit');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImgUrl, setGeneratedImgUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedCertificate[]>([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Certificate Compiled Successfully!');
  const [mobileStep, setMobileStep] = useState<number>(1);
  const [showErrors, setShowErrors] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  // Event settings state for lock validation
  const [eventSetting, setEventSetting] = useState<{ event_name: string; release_date: string | null } | null>(null);
  const [isCheckingRestrictions, setIsCheckingRestrictions] = useState(true);
  const [lockBypassed, setLockBypassed] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Keep track of current time for live unlock recalculation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if restricted
  const isLocked = useMemo(() => {
    if (isCheckingRestrictions || !eventSetting || !eventSetting.release_date) return false;
    const releaseTime = new Date(eventSetting.release_date).getTime();
    return currentTime < releaseTime;
  }, [isCheckingRestrictions, eventSetting, currentTime]);

  const showLockScreen = useMemo(() => {
    return isLocked && !lockBypassed;
  }, [isLocked, lockBypassed]);



  // Load Certificate History from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('certificate_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error parsing certificate history:', e);
      }
    }
  }, []);

  // Fetch event settings for release date checks
  useEffect(() => {
    const checkEventRestrictions = async () => {
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const eventId = searchParams ? (searchParams.get('event') || '').trim().toLowerCase() : '';

      if (!eventId) {
        setIsCheckingRestrictions(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('event_settings')
          .select('event_name, release_date')
          .eq('event_id', eventId)
          .maybeSingle();

        if (error) {
          console.error('Error fetching event settings:', error);
        } else if (data) {
          setEventSetting(data);
        }
      } catch (err) {
        console.error('Error checking event restrictions:', err);
      } finally {
        setIsCheckingRestrictions(false);
      }
    };

    checkEventRestrictions();
  }, []);

  // Load event-specific template and sync target from URL path on mount/popstate
  useEffect(() => {
    const syncTemplateFromPath = () => {
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const eventName = searchParams ? searchParams.get('event') || '' : '';

      setData(prev => {
        let nextTemplateId = prev.selectedTemplateId;
        if (eventName) {
          const template = getTemplateForEvent(eventName);
          if (template) {
            nextTemplateId = template.id;
          }
        }

        const isWalkRunning = path.includes('/walk-runing');
        const targetString = `${parseFloat(prev.distance)} ${prev.distanceUnit}`;
        let nextDistance = prev.distance;
        let nextDistanceUnit = prev.distanceUnit;

        if (prev.distance && prev.distanceUnit) {
          if (isWalkRunning) {
            if (!['3 KM', '5 KM', '10 KM', '21 KM'].includes(targetString)) {
              nextDistance = '5.00';
              nextDistanceUnit = 'KM';
            }
          } else {
            if (!['10 KM', '25 KM', '50 KM', '100 KM'].includes(targetString)) {
              nextDistance = '100.00';
              nextDistanceUnit = 'KM';
            }
          }
        }

        if (prev.selectedTemplateId !== nextTemplateId || prev.distance !== nextDistance || prev.distanceUnit !== nextDistanceUnit) {
          return {
            ...prev,
            selectedTemplateId: nextTemplateId,
            distance: nextDistance,
            distanceUnit: nextDistanceUnit
          };
        }
        return prev;
      });
    };

    syncTemplateFromPath();
    window.addEventListener('popstate', syncTemplateFromPath);
    return () => window.removeEventListener('popstate', syncTemplateFromPath);
  }, []);

    // Immediate Connection test
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select('id')
        .limit(1);

      if (error) {
        console.error('Supabase connection test failed ❌:', error.message);
      } else {
        console.log('Supabase connection test successful! Connected to DB config 🚀');
      }
    };
    testConnection();
  }, []);


  // Demo presets for easy testing
  const loadDemo = (type: 'morning' | 'century') => {
    if (type === 'morning') {
      setData({
        name: 'KARAN GUPTA',
        duration: '04:10:00',
        distance: '50.00',
        distanceUnit: 'KM',
        rideName: 'Morning City Ride',
        rideDate: '2026-07-13',
        selectedTemplateId: 'navy-gold',
        signatureName: 'Unique Jain',
        signatureRole: 'Founder & CEO',
        signatureText: 'Unique Jain',
        phoneNumber: '9876543210',
        email: 'karan.gupta@gmail.com',
        completedDistance: '50.00',
        activityProofUrl: '',
      });
    } else {
      setData({
        name: 'SARAH JENKINS',
        duration: '06:12:45',
        distance: '100.00',
        distanceUnit: 'KM',
        rideName: 'Epic Alpine Century',
        rideDate: '2026-07-18',
        selectedTemplateId: 'cyber-teal',
        signatureName: 'Marcus Vance',
        signatureRole: 'Race Director',
        signatureText: 'M. Vance',
        phoneNumber: '9988776655',
        email: 'sarah.jenkins@gmail.com',
        completedDistance: '100.00',
        activityProofUrl: '',
      });
    }
  };

  // Form Validation
  const errors = useMemo(() => {
    const newErrors: { [key: string]: string } = {};

    // Name Validation
    if (!data.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (data.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Phone Number Validation
    if (!data.phoneNumber || !data.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(data.phoneNumber.trim())) {
      newErrors.phoneNumber = 'Must be a 10-digit number';
    }

    // Email Validation
    if (!data.email || !data.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      newErrors.email = 'Invalid email address';
    }

    // Activity Date Validation
    if (!data.rideDate || !data.rideDate.trim()) {
      newErrors.rideDate = 'Activity date is required';
    }

    // Duration: Validates HH:MM:SS, H:MM:SS, MM:SS
    const durationTrim = data.duration.trim();
    if (!durationTrim) {
      newErrors.duration = 'Duration is required';
    } else {
      const durationRegex = /^(\d{1,2}:)?([0-5]?\d):([0-5]\d)$/;
      if (!durationRegex.test(durationTrim)) {
        newErrors.duration = 'Format: HH:MM:SS or MM:SS';
      }
    }

    // Distance
    const distNum = parseFloat(data.distance);
    if (!data.distance || !data.distance.trim()) {
      newErrors.distance = 'Distance is required';
    } else if (isNaN(distNum) || distNum <= 0) {
      newErrors.distance = 'Must be a positive number';
    }

    // Completed Distance
    if (!data.completedDistance || !data.completedDistance.trim()) {
      newErrors.completedDistance = 'Completed distance is required';
    } else {
      const compVal = parseFloat(data.completedDistance);
      if (isNaN(compVal) || compVal <= 0) {
        newErrors.completedDistance = 'Must be a positive number';
      }
    }

    // Activity Proof URL
    if (!data.activityProofUrl || !data.activityProofUrl.trim()) {
      newErrors.activityProofUrl = 'Activity proof is required';
    }

    return newErrors;
  }, [data]);

  const isValid = Object.keys(errors).length === 0;
  const isStep1Valid = 
    !errors.name && 
    !errors.phoneNumber && 
    !errors.email && 
    !errors.rideDate && 
    !errors.distance && 
    !errors.completedDistance && 
    !errors.duration && 
    !errors.activityProofUrl && 
    data.name.trim() !== '' && 
    data.phoneNumber?.trim() !== '' && 
    data.email?.trim() !== '' && 
    data.rideDate?.trim() !== '' && 
    data.distance.trim() !== '' && 
    data.completedDistance.trim() !== '' && 
    data.duration.trim() !== '' && 
    data.activityProofUrl?.trim() !== '';

  const handleFieldChange = (key: keyof CertificateData, value: string) => {
    if (key === 'distance' && value.includes(' ')) {
      const [dist, unit] = value.split(' ');
      setData((prev) => ({
        ...prev,
        distance: dist,
        distanceUnit: unit,
      }));
    } else {
      setData((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  // Temporarily sanitize stylesheets to remove oklch which crashes html2canvas
  const sanitizeStylesheets = async () => {
    const backups: { element: HTMLStyleElement; originalText: string }[] = [];
    const linkBackups: { element: HTMLLinkElement; tempStyle: HTMLStyleElement }[] = [];

    try {
      // 1. Sanitize all <style> tags
      const styleElements = document.querySelectorAll('style');
      styleElements.forEach((styleEl) => {
        const cssText = styleEl.innerHTML;
        if (cssText && cssText.includes('oklch')) {
          backups.push({
            element: styleEl,
            originalText: cssText,
          });
          const sanitized = cssText.replace(/oklch\([^)]+\)/gi, 'rgb(100, 116, 139)');
          styleEl.innerHTML = sanitized;
        }
      });

      // 2. Sanitize <link rel="stylesheet"> tags
      const linkElements = document.querySelectorAll('link[rel="stylesheet"]');
      for (let i = 0; i < linkElements.length; i++) {
        const linkEl = linkElements[i] as HTMLLinkElement;
        try {
          if (linkEl.href && (linkEl.href.startsWith(window.location.origin) || !linkEl.href.startsWith('http'))) {
            const response = await fetch(linkEl.href);
            if (response.ok) {
              const cssText = await response.text();
              if (cssText && cssText.includes('oklch')) {
                const sanitized = cssText.replace(/oklch\([^)]+\)/gi, 'rgb(100, 116, 139)');
                const tempStyle = document.createElement('style');
                tempStyle.innerHTML = sanitized;
                document.head.appendChild(tempStyle);

                linkEl.disabled = true;

                linkBackups.push({
                  element: linkEl,
                  tempStyle,
                });
              }
            }
          }
        } catch (err) {
          console.warn('Could not sanitize link stylesheet:', linkEl.href, err);
        }
      }
    } catch (err) {
      console.error('Error during stylesheet sanitization:', err);
    }

    return () => {
      // Restore <style> tags
      backups.forEach(({ element, originalText }) => {
        element.innerHTML = originalText;
      });
      // Restore <link> tags
      linkBackups.forEach(({ element, tempStyle }) => {
        element.disabled = false;
        tempStyle.remove();
      });
    };
  };

  // Helper to capture certificate canvas with exact coordinates & CORS support
  const captureCertificateCanvas = async (element: HTMLElement): Promise<HTMLCanvasElement> => {
    const restoreStyles = await sanitizeStylesheets();
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Double DPI for beautiful print quality
        useCORS: true,
        allowTaint: false, // Prevents "tainted canvas" security errors from web fonts
        backgroundColor: '#ffffff',
        logging: false,
        width: 1414,
        height: 970,
        windowWidth: 1414,
        windowHeight: 970,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
      });
      return canvas;
    } finally {
      restoreStyles();
    }
  };

  // Upload activity proof image to Cloudflare R2
  const uploadActivityProofToR2 = async (file: File): Promise<string | null> => {
    const uploadApi = import.meta.env.VITE_R2_UPLOAD_API;
    if (!uploadApi) {
      console.warn('VITE_R2_UPLOAD_API is not configured. Skipping activity proof Cloudflare R2 upload.');
      return null;
    }

    setIsUploadingProof(true);
    try {
      const formData = new FormData();
      formData.append('file', file, `proof_${Date.now()}_${file.name}`);

      // Append type parameter as activity_proofs to keep it separated in R2
      const uploadUrl = new URL(uploadApi);
      uploadUrl.searchParams.set('type', 'activity_proofs');

      const response = await fetch(uploadUrl.toString(), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with server status ${response.status}`);
      }

      const result = await response.json();
      const fileUrl = result.url || null;
      if (fileUrl) {
        handleFieldChange('activityProofUrl', fileUrl);
      }
      return fileUrl;
    } catch (err) {
      console.error('Error uploading activity proof to R2:', err);
      return null;
    } finally {
      setIsUploadingProof(false);
    }
  };

  // Upload certificate image to Cloudflare R2
  const uploadCertificateToR2 = async (canvas: HTMLCanvasElement): Promise<string | null> => {
    const uploadApi = import.meta.env.VITE_R2_UPLOAD_API;
    if (!uploadApi) {
      console.warn('VITE_R2_UPLOAD_API is not configured. Skipping certificate image Cloudflare R2 upload.');
      return null;
    }

    try {
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, 'image/png');
      });

      if (!blob) {
        console.error('Failed to convert canvas to image blob');
        return null;
      }

      const formData = new FormData();
      formData.append('file', blob, `certificate_${Date.now()}.png`);

      // Append type parameter so the worker creates certificates virtual directory
      const uploadUrl = new URL(uploadApi);
      uploadUrl.searchParams.set('type', 'certificates');

      const response = await fetch(uploadUrl.toString(), {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with server status ${response.status}`);
      }

      const result = await response.json();
      return result.url || null;
    } catch (err) {
      console.error('Error uploading certificate to R2:', err);
      return null;
    }
  };

  // Save certificate details to Supabase database log
  const saveDataToBackend = async (uploadedUrl: string | null) => {
    try {
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      const certificateType = path.includes('/walk-runing') ? 'walk-running' : 'cycling';

      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const eventName = searchParams ? searchParams.get('event') || 'morning-ride' : 'morning-ride';
      
      const targetStr = data.distance && data.distanceUnit
        ? `${parseFloat(data.distance)} ${data.distanceUnit}`
        : 'SELECT TARGET';

      const { data: record, error } = await supabase
        .from('certificates')
        .insert({
          name: data.name,
          phone_number: data.phoneNumber,
          email: data.email,
          activity_date: data.rideDate,
          target_distance: targetStr,
          duration: data.duration,
          selected_template_id: data.selectedTemplateId,
          certificate_type: certificateType,
          event_name: eventName,
          certificate_url: uploadedUrl,
          completed_distance: data.completedDistance,
          activity_proof_url: data.activityProofUrl,
        })
        .select('id')
        .single();

      if (error) throw error;
      console.log('Record inserted successfully!');
    } catch (err) {
      console.error('Failed to log form metrics:', err);
    }
  };



  // Compile / Generate Certificate
  const handleGenerateCertificate = async () => {
    if (!isValid) {
      setShowErrors(true);
      return;
    }

    setIsGenerating(true);
    setToastMessage('Compiling Certificate...');
    setShowSuccessToast(true);

    // Short delay to allow state changes to apply (rendering container scale back to 1:1)
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Look for the 1:1 off-viewport capture container first, fallback to live print area
    const previewArea = document.getElementById('export-capture-root') || document.getElementById('certificate-print-area');
    if (!previewArea) {
      // If still mounting, wait another 300ms
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    const finalPreviewArea = document.getElementById('export-capture-root') || document.getElementById('certificate-print-area');
    if (!finalPreviewArea) {
      setView('result');
      setToastMessage('Error compiling certificate.');
      setTimeout(() => setShowSuccessToast(false), 3000);
      setIsGenerating(false);
      return;
    }

    try {
      // Create canvas from standard 1414x970 high resolution pixel node
      const canvas = await captureCertificateCanvas(finalPreviewArea);

      const imgUrl = canvas.toDataURL('image/png');
      setGeneratedImgUrl(imgUrl);

      setToastMessage('Certificate Compiled Successfully!');
      
      let uploadedUrl: string | null = null;
      try {
        uploadedUrl = await uploadCertificateToR2(canvas);
      } catch (uploadErr) {
        console.error('R2 upload failed during generate:', uploadErr);
      }

      await saveDataToBackend(uploadedUrl);
    } catch (err) {
      console.error('Error rendering HTML to Canvas:', err);
      setGeneratedImgUrl('');
      setToastMessage('Compiled with live fallback preview.');
    } finally {
      setView('result');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      setIsGenerating(false);
    }
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    let imgUrl = generatedImgUrl;

    if (!imgUrl) {
      setIsGenerating(true);
      setToastMessage('Compiling high-resolution PDF...');
      setShowSuccessToast(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const previewArea = document.getElementById('export-capture-root') || document.getElementById('certificate-print-area');
      if (previewArea) {
        try {
          const canvas = await captureCertificateCanvas(previewArea);
          imgUrl = canvas.toDataURL('image/png');
          setGeneratedImgUrl(imgUrl);
        } catch (err) {
          console.error('Error rendering PDF canvas on-the-fly:', err);
        }
      }
      setIsGenerating(false);
    }

    if (!imgUrl) {
      setToastMessage('Could not render PDF. Please retry.');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      return;
    }

    try {
      // Standard A4 dimensions in landscape: 297mm x 210mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      pdf.addImage(imgUrl, 'PNG', 0, 0, 297, 210);
      pdf.save(`Certificate_${data.name.replace(/\s+/g, '_') || 'Achievement'}.pdf`);
      
      setToastMessage('PDF Saved Successfully!');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (e) {
      console.error('Error generating PDF:', e);
      setToastMessage('Error generating PDF file.');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  // Download Image
  const handleDownloadImage = async () => {
    let imgUrl = generatedImgUrl;

    if (!imgUrl) {
      setIsGenerating(true);
      setToastMessage('Compiling high-resolution PNG...');
      setShowSuccessToast(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const previewArea = document.getElementById('export-capture-root') || document.getElementById('certificate-print-area');
      if (previewArea) {
        try {
          const canvas = await captureCertificateCanvas(previewArea);
          imgUrl = canvas.toDataURL('image/png');
          setGeneratedImgUrl(imgUrl);
        } catch (err) {
          console.error('Error rendering image canvas on-the-fly:', err);
        }
      }
      setIsGenerating(false);
    }

    if (!imgUrl) {
      setToastMessage('Could not render image. Please retry.');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = imgUrl;
      link.download = `Certificate_${data.name.replace(/\s+/g, '_') || 'Achievement'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setToastMessage('Image Saved Successfully!');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (e) {
      console.error('Error downloading image:', e);
      setToastMessage('Error saving image.');
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  // Native Web Share / Clipboard Fallback
  const handleShareCertificate = async () => {
    let imgUrl = generatedImgUrl;

    if (!imgUrl) {
      setIsGenerating(true);
      setToastMessage('Preparing shareable image...');
      setShowSuccessToast(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      const previewArea = document.getElementById('export-capture-root') || document.getElementById('certificate-print-area');
      if (previewArea) {
        try {
          const canvas = await captureCertificateCanvas(previewArea);
          imgUrl = canvas.toDataURL('image/png');
          setGeneratedImgUrl(imgUrl);
        } catch (err) {
          console.error('Error rendering share canvas on-the-fly:', err);
        }
      }
      setIsGenerating(false);
    }

    if (!imgUrl) {
      // Direct clipboard share of text fallback if canvas compile failed entirely
      try {
        await navigator.clipboard.writeText(
          `I completed my ${data.rideName || 'ride'}! Distance: ${data.distance} ${data.distanceUnit} in ${data.duration}. Generated with Achievement Certificate Generator.`
        );
        setToastMessage('Stats Copied to Clipboard!');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      } catch (err) {
        setToastMessage('Copy / Share not supported.');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      }
      return;
    }

    try {
      const response = await fetch(imgUrl);
      const blob = await response.blob();
      const file = new File([blob], `Certificate_${data.name.replace(/\s+/g, '_') || 'Achievement'}.png`, { type: 'image/png' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Achievement Certificate',
          text: `Check out my personalized certificate for successfully completing the ${data.rideName || 'achievement challenge'}!`,
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'My Achievement Certificate',
          text: `I completed my ride! Distance: ${data.distance} ${data.distanceUnit} in ${data.duration}.`,
          url: window.location.href,
        });
      } else {
        throw new Error('Web Share not supported');
      }
    } catch (e) {
      // Ignore user cancellation/abort exceptions
      const errName = (e && (e as any).name || '').toLowerCase();
      const errMsg = (e && (e as any).message || '').toLowerCase();
      if (
        errName.includes('abort') || 
        errName.includes('cancel') || 
        errMsg.includes('abort') || 
        errMsg.includes('cancel') || 
        errMsg.includes('dismiss')
      ) {
        console.log('Share cancelled or dismissed by user');
        return;
      }

      // Fallback: Copy info message to clipboard
      try {
        await navigator.clipboard.writeText(
          `I completed my ${data.rideName || 'ride'}! Distance: ${data.distance} ${data.distanceUnit} in ${data.duration}. Generated with Achievement Certificate Generator.`
        );
        setToastMessage('Stats Copied to Clipboard!');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      } catch (err) {
        setToastMessage('Share / Copy not supported.');
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      }
    }
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem('certificate_history', JSON.stringify(updated));
  };

  const selectHistoryItem = (item: SavedCertificate) => {
    // Populate form data with historical records where possible
    setData((prev) => ({
      ...prev,
      name: item.name,
      duration: item.duration,
      rideName: item.rideName,
      rideDate: item.date,
    }));
    setGeneratedImgUrl(item.imgUrl);
    setView('result');
    setShowHistoryDrawer(false);
  };

  const activeTemplate = TEMPLATES.find(t => t.id === data.selectedTemplateId) || TEMPLATES[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1A2B4C] font-sans flex flex-col relative" id="app-root-container">
      {/* Toast Alert */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1A2B4C] text-white px-6 py-3 rounded-sm border-2 border-[#C5A059] flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-none"
            id="success-toast"
          >
            <CheckCircle className="w-4 h-4 text-[#C5A059]" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <header className="bg-white border-b-2 border-[#E2E8F0] sticky top-0 z-40 px-6 py-4 flex items-center justify-between" id="header-bar">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center overflow-hidden rounded-sm">
            <img src={logoImg} alt="Pedals Power" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight text-[#1A2B4C]">Pedals Power</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="flex-1 flex flex-col md:flex-row h-full max-w-7xl w-full mx-auto" id="main-content-layout">
        {showLockScreen && eventSetting ? (
          <CertificateLockScreen 
            eventName={eventSetting.event_name} 
            releaseDate={eventSetting.release_date!} 
            onBack={() => setLockBypassed(true)}
          />
        ) : (
          <AnimatePresence mode="wait">
            {view === 'edit' ? (
              /* ================= EDIT MODE SCREEN ================= */
              <motion.div
                key="edit-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-0 md:gap-4 md:p-4 w-full"
                id="app-editor-view"
              >
                {isLocked && eventSetting && (
                  <div className="col-span-12 bg-amber-50 border-l-4 border-amber-500 p-3.5 text-amber-900 text-xs font-semibold flex items-center gap-2 mb-2 rounded-sm shadow-sm" id="lock-warning-banner">
                    <Lock className="w-4 h-4 flex-shrink-0 text-amber-600 animate-pulse" />
                    <span>
                      Notice: Certificate downloads for <strong>{eventSetting.event_name}</strong> are restricted until {new Date(eventSetting.release_date!).toLocaleString()}. You can still fill standard details and preview the layout.
                    </span>
                  </div>
                )}
              
              {/* Mobile Step Progress Indicator */}
              <div className="block md:hidden bg-white border-b-2 border-[#E2E8F0] px-4 py-3" id="mobile-step-indicator">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1A2B4C]">
                    Step {mobileStep} of 3: {mobileStep === 1 ? "Certificate Details" : "Preview & Template"}
                  </span>
                  <div className="flex gap-1.5">
                    <div className={`w-6 h-1.5 rounded-sm transition-all duration-300 ${mobileStep >= 1 ? 'bg-[#1A2B4C]' : 'bg-[#E2E8F0]'}`} />
                    <div className={`w-6 h-1.5 rounded-sm transition-all duration-300 ${mobileStep >= 2 ? 'bg-[#1A2B4C]' : 'bg-[#E2E8F0]'}`} />
                    <div className="w-6 h-1.5 rounded-sm bg-[#E2E8F0]" />
                  </div>
                </div>
              </div>

              {/* Left Panel: Form Customizer */}
              <div className={`col-span-12 md:col-span-5 bg-white p-4 md:border-2 border-[#E2E8F0] md:rounded-sm flex-col space-y-4 md:overflow-y-auto md:max-h-[calc(100vh-120px)] ${mobileStep === 2 ? 'hidden md:flex' : 'flex'}`} id="editor-left-panel">
                {/* React form component with inline template picker */}
                <CertificateForm
                  data={data}
                  onChange={handleFieldChange}
                  isValid={isValid}
                  errors={showErrors ? errors : {}}
                  onGenerate={handleGenerateCertificate}
                  loadDemo={loadDemo}
                  mobileStep={mobileStep}
                  isUploadingProof={isUploadingProof}
                  onUploadProof={uploadActivityProofToR2}
                />

                {/* Desktop layout "Generate" anchor block */}
                <div className="hidden md:block pt-2" id="desktop-generate-block">
                  <button
                    type="button"
                    id="btn-generate-desktop"
                    onClick={isLocked ? undefined : handleGenerateCertificate}
                    disabled={isGenerating || isLocked}
                    className={`w-full py-3.5 px-4 font-black uppercase tracking-widest text-sm rounded-sm border-2 transition-colors duration-150 text-center flex items-center justify-center gap-2 ${
                      isGenerating || isLocked
                        ? 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed'
                        : 'bg-[#1A2B4C] text-white border-[#1A2B4C] hover:bg-[#2D4263]'
                    }`}
                  >
                    {isLocked ? (
                      <>
                        <Lock className="w-4 h-4 text-red-500 animate-pulse" />
                        Locked Until {new Date(eventSetting.release_date!).toLocaleDateString()}
                      </>
                    ) : isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Compiling Certificate...
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4" />
                        Generate Certificate
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* Right Panel: Live Scaling Certificate Preview */}
              <div className={`col-span-12 md:col-span-7 p-4 flex flex-col justify-between bg-[#F1F5F9] md:border-2 border-[#E2E8F0] md:rounded-sm space-y-4 md:max-h-[calc(100vh-120px)] md:overflow-y-auto ${mobileStep === 1 ? 'hidden md:flex' : 'flex order-1'}`} id="editor-right-panel">
                <div className="flex items-center justify-between" id="preview-header">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Live Render Canvas</span>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059] animate-pulse inline-block" />
                    <span className="text-[10px] font-mono text-[#C5A059] uppercase font-bold">Auto-Syncing</span>
                  </div>
                </div>

                {/* Preview wrapper scales with parent */}
                <div className="w-full flex-1 flex items-center justify-center p-1" id="rendered-canvas-container">
                   <CertificatePreview data={data} isGenerating={false} />
                </div>

                {/* <div className="bg-white p-3 border border-[#E2E8F0] rounded-sm flex items-center justify-between gap-2" id="canvas-footer-tip">
                  <p className="text-[10px] text-[#64748B] leading-normal uppercase tracking-wider">
                    Designed to output print-ready <strong>1414 x 970</strong> resolution vectors. Font adjusts dynamically on long names to prevent text wrapping.
                  </p>
                </div> */}
              </div>

              {/* Mobile Sticky Bottom Bar (as per mobile spec guidelines) */}
              <div className="block md:hidden sticky bottom-0 left-0 right-0 bg-white p-4 z-30 order-last" id="mobile-sticky-footer">
                {mobileStep === 1 ? (
                  <button
                    type="button"
                    id="btn-next-mobile"
                    onClick={() => {
                      if (!isStep1Valid) {
                        setShowErrors(true);
                      } else {
                        setMobileStep(2);
                      }
                    }}
                    className="w-full py-3.5 px-4 font-black uppercase tracking-widest text-sm rounded-sm border-2 text-center transition-colors flex items-center justify-center gap-2 cursor-pointer bg-[#1A2B4C] text-white border-[#1A2B4C] active:bg-[#2D4263]"
                  >
                    Next: Design & Preview
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex gap-2 w-full">
                    <button
                      type="button"
                      id="btn-back-mobile"
                      onClick={() => setMobileStep(1)}
                      className="flex-1 py-3.5 px-4 bg-white border-2 border-[#E2E8F0] text-[#1A2B4C] font-black text-xs uppercase tracking-widest rounded-sm text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      Back
                    </button>
                    <button
                      type="button"
                      id="btn-generate-mobile"
                      onClick={isLocked ? undefined : handleGenerateCertificate}
                      disabled={isGenerating || isLocked}
                      className={`flex-[2] py-3.5 px-4 font-black uppercase tracking-widest text-xs sm:text-sm rounded-sm border-2 text-center transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                        isGenerating || isLocked
                          ? 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed'
                          : 'bg-[#1A2B4C] text-white border-[#1A2B4C] active:bg-[#2D4263]'
                      }`}
                    >
                      {isLocked ? (
                        <>
                          <Lock className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                          Locked
                        </>
                      ) : isGenerating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          Compiling...
                        </>
                      ) : (
                        <>
                          <Award className="w-3.5 h-3.5" />
                          Generate
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* ================= RESULT SCREEN ================= */
            <motion.div
              key="result-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex flex-col md:grid md:grid-cols-12 gap-0 md:gap-4 p-0 md:p-4 w-full"
              id="app-result-view"
            >
              {/* Mobile Step Progress Indicator for Step 3 */}
              <div className="col-span-12 block md:hidden bg-white border-b-2 border-[#E2E8F0] px-4 py-3" id="mobile-step-indicator-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1A2B4C]">
                    Step 3 of 3: Final Preview & Download
                  </span>
                  <div className="flex gap-1.5">
                    <div className="w-6 h-1.5 rounded-sm bg-[#1A2B4C]" />
                    <div className="w-6 h-1.5 rounded-sm bg-[#1A2B4C]" />
                    <div className="w-6 h-1.5 rounded-sm bg-[#1A2B4C]" />
                  </div>
                </div>
              </div>

              {/* Left Column: Big Beautiful Certificate Export Review */}
              <div className="col-span-12 md:col-span-8 flex flex-col justify-center items-center bg-white p-4  md:border-2 border-[#E2E8F0] md:rounded-sm space-y-4" id="result-left-panel">


                <div className="w-full flex-1 flex items-center justify-center bg-[#F1F5F9] border border-[#E2E8F0] rounded-sm overflow-hidden" id="final-artifact-wrapper">
                  {generatedImgUrl ? (
                    <img 
                      src={generatedImgUrl} 
                      alt="Personalized Achievement Certificate" 
                      className="max-w-full h-auto border border-[#E2E8F0] rounded-sm shadow-sm" 
                      id="compiled-certificate-image"
                      style={{ aspectRatio: '1414/970' }}
                    />
                  ) : isGenerating ? (
                    <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
                      <RefreshCw className="w-8 h-8 animate-spin mb-2 text-[#94A3B8]" />
                      <p className="text-xs font-bold uppercase">Preparing certificate artifact...</p>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <CertificatePreview data={data} isGenerating={false} />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Flat Export Tool panel */}
              <div className="col-span-12 md:col-span-4 bg-white p-4 md:border-2 md:border-[#E2E8F0] rounded-sm flex flex-col justify-between space-y-4" id="result-right-panel">
                <div className="space-y-4">


                  <div className="space-y-2.5" id="export-options-list">
                    {/* Download Image */}
                    <button
                      type="button"
                      id="btn-download-image"
                      onClick={handleDownloadImage}
                      className="w-full py-2.5 px-4 bg-[#1A2B4C] hover:bg-[#2D4263] text-white font-black text-xs uppercase tracking-widest rounded-sm border-2 border-[#1A2B4C] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download as Image (PNG)
                      </span>
                      <span className="text-[9px] font-mono opacity-80">PNG</span>
                    </button>

                    {/* Download PDF */}
                    <button
                      type="button"
                      id="btn-download-pdf"
                      onClick={handleDownloadPDF}
                      className="w-full py-2.5 px-4 bg-[#C5A059] hover:bg-[#B28B45] text-white font-black text-xs uppercase tracking-widest rounded-sm border-2 border-[#C5A059] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Download as PDF
                      </span>
                      <span className="text-[9px] font-mono opacity-80">A4 Landscape</span>
                    </button>

                    {/* Share Button (Web Share API) */}
                    <button
                      type="button"
                      id="btn-share-certificate"
                      onClick={handleShareCertificate}
                      className="w-full py-2.5 px-4 bg-white hover:bg-[#F8FAFC] text-[#1A2B4C] font-black text-xs uppercase tracking-widest rounded-sm border-2 border-[#1A2B4C] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-[#1A2B4C]" />
                        Share / Copy Details
                      </span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#1A2B4C]" />
                    </button>
                  </div>


                </div>

                {/* Back to Edit Button */}
                <div className="pt-4 ">
                  <button
                    type="button"
                    id="btn-return-edit"
                    onClick={() => { setView('edit'); setMobileStep(1); }}
                    className="w-full py-2.5 px-4 bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#1A2B4C] font-black text-xs uppercase tracking-widest rounded-sm border-2 border-[#E2E8F0] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Edit Certificate Fields
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        )}
      </main>

      {/* Slide-out Certificate History Logs Drawer */}
      <AnimatePresence>
        {showHistoryDrawer && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end" id="history-drawer-overlay">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryDrawer(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" 
            />

            {/* Drawer Body */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="relative w-full max-w-sm bg-white border-l-4 border-[#1A2B4C] h-full flex flex-col justify-between"
              id="history-drawer-body"
            >
              {/* Drawer Header */}
              <div className="p-4 border-b-2 border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <History className="w-4 h-4 text-[#1A2B4C]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#1A2B4C]">Certificate Log (Max 10)</h3>
                </div>
                <button
                  type="button"
                  id="btn-close-history"
                  onClick={() => setShowHistoryDrawer(false)}
                  className="p-1 text-[#64748B] hover:text-[#1A2B4C] rounded-sm hover:bg-[#F8FAFC] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" id="history-drawer-content">
                {history.length === 0 ? (
                  <div className="text-center py-10 text-[#64748B]">
                    <History className="w-10 h-10 mx-auto opacity-30 mb-2 text-[#64748B]" />
                    <p className="text-xs font-bold uppercase">No Generated Certificates Found</p>
                    <p className="text-[10px] mt-1 uppercase tracking-wider">Generate a certificate to save it here in history.</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => selectHistoryItem(item)}
                      className="border-2 border-[#E2E8F0] hover:border-[#1A2B4C] p-2.5 rounded-sm bg-white hover:bg-[#F8FAFC] transition-colors cursor-pointer text-left flex gap-3 relative group"
                    >
                      {/* Mini Thumbnail */}
                      <div className="w-16 h-12 bg-[#F1F5F9] border border-[#E2E8F0] rounded-sm overflow-hidden flex-shrink-0 relative">
                        <img src={item.imgUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-black uppercase text-[#1A2B4C] truncate leading-tight">{item.name}</h4>
                        <p className="text-[9px] text-[#64748B] font-mono mt-0.5 truncate uppercase tracking-wider">{item.rideName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[8px] font-bold px-1.5 py-0.5 bg-[#F8FAFC] border border-[#E2E8F0] text-[#1A2B4C] rounded-sm">
                            {item.distance}
                          </span>
                          <span className="text-[8px] text-[#64748B] font-mono">
                            {item.duration}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="absolute right-2 top-2 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => deleteHistoryItem(item.id, e)}
                          title="Delete"
                          className="p-1 hover:bg-red-50 text-[#64748B] hover:text-red-500 rounded-sm transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-[#64748B]" />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 bg-[#F8FAFC] border-t-2 border-[#E2E8F0] text-center">
                <p className="text-[9px] text-[#64748B] font-mono uppercase tracking-wider">Persisted offline in your local browser sandbox.</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden 1:1 high-resolution preview container for perfect html2canvas capture */}
      <div 
        className="fixed pointer-events-none overflow-hidden" 
        style={{ 
          zIndex: -1000, 
          left: '-2000px', 
          top: '-2000px', 
          width: '1414px', 
          height: '970px',
          backgroundColor: '#ffffff'
        }} 
        id="export-capture-root"
      >
        <CertificatePreview data={data} isGenerating={true} />
      </div>
    </div>
  );
}
