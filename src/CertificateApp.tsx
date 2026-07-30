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
  ChevronUp
} from 'lucide-react';
import { CertificateData, TEMPLATES } from './types';
import { CertificatePreview } from './components/CertificatePreview';
import { CertificateForm } from './components/CertificateForm';
import { getTemplateForEvent } from './events';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// Initial state for certificate input
const DEFAULT_FORM_STATE: CertificateData = {
  name: 'KARAN GUPTA',
  duration: '04:10:00',
  distance: '45.00',
  distanceUnit: 'KM',
  rideName: 'Morning City Ride',
  rideDate: '13th July 2026',
  selectedTemplateId: 'navy-gold',
  signatureName: 'Unique Jain',
  signatureRole: 'Founder & CEO',
  signatureText: 'Unique Jain',
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

export default function CertificateApp() {
  const [data, setData] = useState<CertificateData>(() => {
    const saved = localStorage.getItem('current_cert_draft');
    const initialData = saved ? JSON.parse(saved) : DEFAULT_FORM_STATE;

    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const pathSegments = path.split('/').filter(Boolean);
    const eventName = pathSegments.length > 1 ? pathSegments[1] : '';
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

  // Auto-save draft on data changes
  useEffect(() => {
    localStorage.setItem('current_cert_draft', JSON.stringify(data));
  }, [data]);

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

  // Load event-specific template from URL path on mount/popstate
  useEffect(() => {
    const syncTemplateFromPath = () => {
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      const pathSegments = path.split('/').filter(Boolean);
      const eventName = pathSegments.length > 1 ? pathSegments[1] : '';
      if (eventName) {
        const template = getTemplateForEvent(eventName);
        if (template) {
          setData(prev => {
            if (prev.selectedTemplateId !== template.id) {
              return {
                ...prev,
                selectedTemplateId: template.id
              };
            }
            return prev;
          });
        }
      }
    };

    syncTemplateFromPath();
    window.addEventListener('popstate', syncTemplateFromPath);
    return () => window.removeEventListener('popstate', syncTemplateFromPath);
  }, []);

  // Demo presets for easy testing
  const loadDemo = (type: 'morning' | 'century') => {
    if (type === 'morning') {
      setData({
        name: 'KARAN GUPTA',
        duration: '04:10:00',
        distance: '45.00',
        distanceUnit: 'KM',
        rideName: 'Morning City Ride',
        rideDate: '13th July 2026',
        selectedTemplateId: 'navy-gold',
        signatureName: 'Unique Jain',
        signatureRole: 'Founder & CEO',
        signatureText: 'Unique Jain',
      });
    } else {
      setData({
        name: 'SARAH JENKINS',
        duration: '06:12:45',
        distance: '100.00',
        distanceUnit: 'KM',
        rideName: 'Epic Alpine Century',
        rideDate: '18th July 2026',
        selectedTemplateId: 'cyber-teal',
        signatureName: 'Marcus Vance',
        signatureRole: 'Race Director',
        signatureText: 'M. Vance',
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
    if (!data.distance.trim()) {
      newErrors.distance = 'Distance is required';
    } else if (isNaN(distNum) || distNum <= 0) {
      newErrors.distance = 'Must be a positive number';
    }

    return newErrors;
  }, [data]);

  const isValid = Object.keys(errors).length === 0;
  const isStep1Valid = !errors.name && !errors.duration && !errors.distance && data.name.trim() !== '' && data.duration.trim() !== '' && data.distance.trim() !== '';

  const handleFieldChange = (key: keyof CertificateData, value: string) => {
    setData((prev) => ({
      ...prev,
      [key]: value,
    }));
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

  // Compile / Generate Certificate
  const handleGenerateCertificate = async () => {
    if (!isValid) return;

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

      // Save into history
      const newHistoryItem: SavedCertificate = {
        id: Date.now().toString(),
        name: data.name,
        duration: data.duration,
        distance: `${data.distance} ${data.distanceUnit}`,
        rideName: data.rideName.trim() || 'Achievement Challenge',
        date: data.rideDate.trim() || new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }),
        imgUrl: imgUrl,
      };

      const updatedHistory = [newHistoryItem, ...history.slice(0, 9)]; // Max 10 items in history
      setHistory(updatedHistory);
      localStorage.setItem('certificate_history', JSON.stringify(updatedHistory));
      
      setToastMessage('Certificate Compiled Successfully!');
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
          <div className="w-8 h-8 bg-[#1A2B4C] flex items-center justify-center font-black text-white text-lg rounded-sm">
            P
          </div>
          <div>
            <h1 className="text-lg font-black uppercase tracking-tight text-[#1A2B4C]">Pedals Power</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              type="button"
              id="btn-history-toggle"
              onClick={() => setShowHistoryDrawer(true)}
              className="px-3 py-1.5 text-xs font-bold bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#1A2B4C] border-2 border-[#E2E8F0] rounded-sm flex items-center gap-1.5 cursor-pointer transition-colors uppercase tracking-wider"
            >
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Saved Logs</span>
              <span className="bg-[#1A2B4C] text-white text-[9px] px-1.5 py-0.5 rounded-sm">{history.length}</span>
            </button>
          )}
          
          {/* <span className="text-xs px-2.5 py-1 rounded-sm bg-[#F8FAFC] text-[#64748B] font-mono font-bold uppercase border border-[#E2E8F0]">
            v1.1
          </span> */}
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="flex-1 flex flex-col md:flex-row h-full max-w-7xl w-full mx-auto" id="main-content-layout">
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
              {/* Mobile Step Progress Indicator */}
              <div className="block md:hidden bg-white border-b-2 border-[#E2E8F0] px-4 py-3" id="mobile-step-indicator">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#1A2B4C]">
                    Step {mobileStep} of 3: {mobileStep === 1 ? "Certificate Stats" : "Preview & Template"}
                  </span>
                  <div className="flex gap-1.5">
                    <div className={`w-6 h-1.5 rounded-sm transition-all duration-300 ${mobileStep >= 1 ? 'bg-[#1A2B4C]' : 'bg-[#E2E8F0]'}`} />
                    <div className={`w-6 h-1.5 rounded-sm transition-all duration-300 ${mobileStep >= 2 ? 'bg-[#1A2B4C]' : 'bg-[#E2E8F0]'}`} />
                    <div className="w-6 h-1.5 rounded-sm bg-[#E2E8F0]" />
                  </div>
                </div>
              </div>

              {/* Left Panel: Form Customizer */}
              <div className={`col-span-12 md:col-span-5 bg-white p-4 border-b-2 md:border-2 border-[#E2E8F0] md:rounded-sm flex flex-col space-y-4 md:overflow-y-auto md:max-h-[calc(100vh-120px)] ${mobileStep === 2 ? 'order-2' : 'order-1'}`} id="editor-left-panel">
                <div className="flex items-center justify-between border-b-2 border-[#E2E8F0] pb-2">
                  <h2 className="text-xs font-black uppercase tracking-widest text-[#1A2B4C] flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-[#64748B]" />
                    Customize Certificate
                  </h2>
                  <button
                    type="button"
                    onClick={() => loadDemo('morning')}
                    className="text-[10px] text-[#64748B] hover:text-[#1A2B4C] font-bold uppercase underline"
                  >
                    Reset Form
                  </button>
                </div>

                {/* React form component with inline template picker */}
                <CertificateForm
                  data={data}
                  onChange={handleFieldChange}
                  isValid={isValid}
                  errors={errors}
                  onGenerate={handleGenerateCertificate}
                  loadDemo={loadDemo}
                  mobileStep={mobileStep}
                />

                {/* Desktop layout "Generate" anchor block */}
                <div className="hidden md:block pt-2" id="desktop-generate-block">
                  <button
                    type="button"
                    id="btn-generate-desktop"
                    onClick={handleGenerateCertificate}
                    disabled={!isValid || isGenerating}
                    className={`w-full py-3.5 px-4 font-black uppercase tracking-widest text-sm rounded-sm border-2 transition-colors duration-150 cursor-pointer text-center flex items-center justify-center gap-2 ${
                      isValid && !isGenerating
                        ? 'bg-[#1A2B4C] text-white border-[#1A2B4C] hover:bg-[#2D4263]'
                        : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed'
                    }`}
                  >
                    {isGenerating ? (
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
              <div className="block md:hidden sticky bottom-0 left-0 right-0 bg-white border-t-2 border-[#E2E8F0] p-4 z-30 order-last shadow-[0_-4px_12px_rgba(0,0,0,0.05)]" id="mobile-sticky-footer">
                {mobileStep === 1 ? (
                  <button
                    type="button"
                    id="btn-next-mobile"
                    onClick={() => setMobileStep(2)}
                    disabled={!isStep1Valid}
                    className={`w-full py-3.5 px-4 font-black uppercase tracking-widest text-sm rounded-sm border-2 text-center transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                      isStep1Valid
                        ? 'bg-[#1A2B4C] text-white border-[#1A2B4C] active:bg-[#2D4263]'
                        : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed'
                    }`}
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
                      onClick={handleGenerateCertificate}
                      disabled={!isValid || isGenerating}
                      className={`flex-[2] py-3.5 px-4 font-black uppercase tracking-widest text-xs sm:text-sm rounded-sm border-2 text-center transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                        isValid && !isGenerating
                          ? 'bg-[#1A2B4C] text-white border-[#1A2B4C] active:bg-[#2D4263]'
                          : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed'
                      }`}
                    >
                      {isGenerating ? (
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
              <div className="col-span-12 md:col-span-8 flex flex-col justify-center items-center bg-white p-4 border-b-2 md:border-2 border-[#E2E8F0] md:rounded-sm space-y-4" id="result-left-panel">
                <div className="w-full flex items-center justify-between border-b-2 border-[#E2E8F0] pb-2">
                  <div>
                    <h2 className="text-xs font-black uppercase tracking-widest text-[#1A2B4C] flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#C5A059]" />
                      Final Certificate Record
                    </h2>
                    <p className="text-[10px] text-[#64748B] font-mono uppercase tracking-wider">1414 x 970 high resolution pixel print capture</p>
                  </div>
                  <span className="px-2 py-0.5 bg-[#1A2B4C]/10 border border-[#1A2B4C]/20 text-[#1A2B4C] text-[10px] font-black rounded-sm uppercase tracking-wider">
                    Ready
                  </span>
                </div>

                <div className="w-full flex-1 flex items-center justify-center bg-[#F1F5F9] border border-[#E2E8F0] p-2 rounded-sm overflow-hidden" id="final-artifact-wrapper">
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
                    <div className="w-full h-full flex items-center justify-center p-2">
                      <CertificatePreview data={data} isGenerating={false} />
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Flat Export Tool panel */}
              <div className="col-span-12 md:col-span-4 bg-white p-4 border-2 border-[#E2E8F0] rounded-sm flex flex-col justify-between space-y-4" id="result-right-panel">
                <div className="space-y-4">
                  <div className="border-b-2 border-[#E2E8F0] pb-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-[#1A2B4C]">Export Certificate</h3>
                    <p className="text-[10px] text-[#64748B] uppercase tracking-wider">Pick preferred output medium below</p>
                  </div>

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

                  {/* Summary of statistics printed */}
                  <div className="bg-[#F8FAFC] p-3 border-2 border-[#E2E8F0] rounded-sm text-xs space-y-2" id="export-summary-metrics">
                    <p className="font-black text-[#1A2B4C] uppercase tracking-wider text-[10px] border-b border-[#E2E8F0] pb-1">Certificate Metrics</p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#64748B]">
                      <div className="uppercase tracking-wider">Name:</div>
                      <div className="font-bold text-[#1A2B4C] truncate text-right">{data.name}</div>
                      <div className="uppercase tracking-wider">Duration:</div>
                      <div className="font-bold text-[#1A2B4C] text-right">{data.duration}</div>
                      <div className="uppercase tracking-wider">Distance:</div>
                      <div className="font-bold text-[#1A2B4C] text-right">{data.distance} {data.distanceUnit}</div>
                      {data.rideName && (
                        <>
                          <div className="uppercase tracking-wider">Event:</div>
                          <div className="font-bold text-[#1A2B4C] truncate text-right">{data.rideName}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Back to Edit Button */}
                <div className="pt-4 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    id="btn-return-edit"
                    onClick={() => { setView('edit'); setMobileStep(2); }}
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
