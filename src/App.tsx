/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, MouseEvent, TouchEvent, ChangeEvent } from 'react';
import { 
  User, 
  Calendar, 
  Compass, 
  Image as ImageIcon, 
  Download, 
  Share2, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Check, 
  Trash2, 
  Sliders, 
  FileText,
  Smartphone,
  Laptop
} from 'lucide-react';
import { 
  renderPoster, 
  TEMPLATES, 
  FormState 
} from './utils/posterRenderer';
// @ts-ignore
import cyclingBg from '../assets/cycling_bg.png';
// @ts-ignore
import runWalkBg from '../assets/run_walk_bg.jpg';
// @ts-ignore
import halftoneCircle from '../assets/halftone_circle.png';
import CertificateApp from './CertificateApp';
// @ts-ignore
import baackgroundimg from '../assets/baackgroundimg.png';


interface DropdownProps {
  options: string[];
  selected: string;
  onChange: (val: string) => void;
  labelId: string;
}

function CustomDropdown({ options, selected, onChange, labelId }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        id={labelId}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition cursor-pointer"
      >
        <span>{selected}</span>
        <svg
          className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <ul className="py-1">
            {options.map((opt) => {
              const isSelected = selected === opt;
              return (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-900 text-white font-bold'
                        : 'text-neutral-700 hover:bg-slate-50 hover:text-black'
                    }`}
                  >
                    {opt}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

interface DatePickerProps {
  selected: string; // "YYYY-MM-DD"
  onChange: (val: string) => void;
  labelId: string;
}

function CustomDatePicker({ selected, onChange, labelId }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse initial selected date or default to today
  const initialDate = selected ? new Date(selected) : new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear() || new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth() || new Date().getMonth());

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateString = (y: number, m: number, d: number) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

  const calendarDays: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i;
    const m = currentMonth === 0 ? 11 : currentMonth - 1;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    calendarDays.push({
      day: d,
      isCurrentMonth: false,
      dateStr: formatDateString(y, m, d)
    });
  }

  for (let d = 1; d <= totalDays; d++) {
    calendarDays.push({
      day: d,
      isCurrentMonth: true,
      dateStr: formatDateString(currentYear, currentMonth, d)
    });
  }

  const remainingCells = 42 - calendarDays.length;
  for (let d = 1; d <= remainingCells; d++) {
    const m = currentMonth === 11 ? 0 : currentMonth + 1;
    const y = currentMonth === 11 ? currentYear + 1 : currentYear;
    calendarDays.push({
      day: d,
      isCurrentMonth: false,
      dateStr: formatDateString(y, m, d)
    });
  }

  const getDisplayDate = (dateStr: string) => {
    if (!dateStr) return 'Select Date';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = d.getDate();
      const monthShort = MONTHS[d.getMonth()].substring(0, 3);
      const year = d.getFullYear();
      return `${day} ${monthShort} ${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        id={labelId}
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (selected) {
            const selDate = new Date(selected);
            if (!isNaN(selDate.getTime())) {
              setCurrentYear(selDate.getFullYear());
              setCurrentMonth(selDate.getMonth());
            }
          }
        }}
        className="w-full flex items-center px-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition cursor-pointer text-left"
      >
        <Calendar className="w-4 h-4 text-slate-400 mr-3" />
        <span className="flex-1 font-semibold">{getDisplayDate(selected)}</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 md:right-auto md:w-80 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer transition text-neutral-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <span className="font-bold text-sm text-neutral-900">
              {MONTHS[currentMonth]} {currentYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer transition text-neutral-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {DAYS_OF_WEEK.map(day => (
              <span key={day} className="text-[10px] font-bold text-slate-400 uppercase">
                {day}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((item, idx) => {
              const isSelected = selected === item.dateStr;
              const isToday = formatDateString(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) === item.dateStr;
              return (
                <button
                  key={`${item.dateStr}-${idx}`}
                  type="button"
                  onClick={() => {
                    onChange(item.dateStr);
                    setIsOpen(false);
                  }}
                  className={`py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition flex items-center justify-center ${
                    isSelected
                      ? 'bg-neutral-900 text-white font-bold'
                      : item.isCurrentMonth
                      ? 'text-neutral-900 hover:bg-slate-100'
                      : 'text-slate-300 hover:bg-slate-50'
                  } ${isToday && !isSelected ? 'border border-neutral-900' : ''}`}
                >
                  {item.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PosterGenerator() {
  // Pre-load the custom cycling background template image
  const [loadedCyclingBg, setLoadedCyclingBg] = useState<HTMLImageElement | null>(null);
  const [loadedRunWalkBg, setLoadedRunWalkBg] = useState<HTMLImageElement | null>(null);
  const [loadedHalftone, setLoadedHalftone] = useState<HTMLImageElement | null>(null);
  const [loadedYouthDayBg, setLoadedYouthDayBg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = cyclingBg;
    img.onload = () => {
      setLoadedCyclingBg(img);
    };

    const img2 = new Image();
    img2.src = runWalkBg;
    img2.onload = () => {
      setLoadedRunWalkBg(img2);
    };

    const img3 = new Image();
    img3.src = halftoneCircle;
    img3.onload = () => {
      setLoadedHalftone(img3);
    };

    const img4 = new Image();
    img4.src = baackgroundimg;
    img4.onload = () => {
      setLoadedYouthDayBg(img4);
    };
  }, []);

  // Primary unified form state
  const [state, setState] = useState<FormState>(() => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const isWalkRunning = path.includes('/walk-runing');
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const isYouthDay = new URLSearchParams(search).get('event') === 'youth-day';
    return {
      name: 'SACHIDA YADAV',
      date: '2026-01-26',
      target: isWalkRunning ? '21 KM' : '100 KM',
      photoUrl: null,
      templateId: isYouthDay ? 'youth-day' : 'cycling-challenge',
      photoX: 0,
      photoY: 0,
      photoScale: 1.0,
      photoRotation: 0,
      activityRoute: isWalkRunning ? 'walk-runing' : 'cycling',
    };
  });

  // Flow & View States
  // Steps on mobile: 1 = Details, 2 = Photo/Design Editor, 3 = Result Export
  const [mobileStep, setMobileStep] = useState<number>(1);
  const [isGenerated, setIsGenerated] = useState<boolean>(false); // Used to toggle result view on desktop

  // Drag interaction states
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const photoStart = useRef({ x: 0, y: 0 });

  // Mobile Pinch-to-Zoom states
  const touchStartDist = useRef<number | null>(null);
  const photoStartScale = useRef<number>(1);

  // References
  const desktopCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mobileCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Loaded photo HTMLImageElement cache
  const [loadedPhoto, setLoadedPhoto] = useState<HTMLImageElement | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  // Load photo when url changes
  useEffect(() => {
    if (!state.photoUrl) {
      setLoadedPhoto(null);
      return;
    }

    setPhotoError(null);
    let isCurrent = true;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (isCurrent) {
        setLoadedPhoto(img);
      }
    };
    img.onerror = () => {
      if (isCurrent) {
        setPhotoError('Failed to load image. Try another format or file.');
        setLoadedPhoto(null);
      }
    };
    img.src = state.photoUrl;

    return () => {
      isCurrent = false;
    };
  }, [state.photoUrl]);

  // Redirect root path to /cycling on mount
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/' || path === '') {
      window.history.replaceState({}, '', '/cycling');
    }
  }, []);

  // Listen for browser navigation (popstate) to keep the app activity route in sync with URL
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const isWalkRunning = path.includes('/walk-runing');
      const isYouthDay = new URLSearchParams(window.location.search).get('event') === 'youth-day';
      setState(prev => {
        const nextRoute = isWalkRunning ? 'walk-runing' as const : 'cycling' as const;
        const nextTemplateId = isYouthDay ? 'youth-day' : (prev.templateId === 'youth-day' ? 'cycling-challenge' : prev.templateId);
        if (prev.activityRoute !== nextRoute || prev.templateId !== nextTemplateId) {
          return {
            ...prev,
            activityRoute: nextRoute,
            templateId: nextTemplateId
          };
        }
        return prev;
      });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Redraw both canvases instantly when state, loadedPhoto, dragging state, or step/view state changes
  useEffect(() => {
    if (desktopCanvasRef.current) {
      renderPoster(desktopCanvasRef.current, state, loadedPhoto, loadedCyclingBg, loadedRunWalkBg, isDragging, loadedHalftone, loadedYouthDayBg);
    }
    if (mobileCanvasRef.current) {
      renderPoster(mobileCanvasRef.current, state, loadedPhoto, loadedCyclingBg, loadedRunWalkBg, isDragging, loadedHalftone, loadedYouthDayBg);
    }
  }, [state, loadedPhoto, loadedCyclingBg, loadedRunWalkBg, isDragging, mobileStep, isGenerated, loadedHalftone, loadedYouthDayBg]);

  // Hook scroll wheel zooming directly onto canvases to prevent page-level scrolling
  useEffect(() => {
    const handleCanvasWheel = (e: WheelEvent) => {
      if (!loadedPhoto) return;
      e.preventDefault(); // Stop outer page scroll
      
      const zoomFactor = e.deltaY < 0 ? 1.05 : 0.95;
      setState(prev => {
        const nextScale = Math.min(Math.max(prev.photoScale * zoomFactor, 0.2), 5.0);
        return {
          ...prev,
          photoScale: Number(nextScale.toFixed(2))
        };
      });
    };

    const dCanvas = desktopCanvasRef.current;
    const mCanvas = mobileCanvasRef.current;

    if (dCanvas) {
      dCanvas.addEventListener('wheel', handleCanvasWheel, { passive: false });
    }
    if (mCanvas) {
      mCanvas.addEventListener('wheel', handleCanvasWheel, { passive: false });
    }

    return () => {
      if (dCanvas) {
        dCanvas.removeEventListener('wheel', handleCanvasWheel);
      }
      if (mCanvas) {
        mCanvas.removeEventListener('wheel', handleCanvasWheel);
      }
    };
  }, [loadedPhoto]);

  // Handlers for click and drag repositioning
  const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!loadedPhoto) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    photoStart.current = { x: state.photoX, y: state.photoY };
  };

  const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !loadedPhoto) return;
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const displaySize = rect.width;

    // Scale mouse coordinates up to match internal 1080x1080 canvas bounds
    const scaleFactor = 1080 / displaySize;
    const dx = (e.clientX - dragStart.current.x) * scaleFactor;
    const dy = (e.clientY - dragStart.current.y) * scaleFactor;

    // Math: Apply rotation correction so dragging is intuitive in user's screen space
    const rad = (-state.photoRotation * Math.PI) / 180;
    const correctedX = dx * Math.cos(rad) - dy * Math.sin(rad);
    const correctedY = dx * Math.sin(rad) + dy * Math.cos(rad);

    setState(prev => ({
      ...prev,
      photoX: photoStart.current.x + correctedX,
      photoY: photoStart.current.y + correctedY,
    }));
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Handlers for mobile touch gestures (single touch drag, multi-touch pinch zoom)
  const handleTouchStart = (e: TouchEvent<HTMLCanvasElement>) => {
    if (!loadedPhoto) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      const t = e.touches[0];
      dragStart.current = { x: t.clientX, y: t.clientY };
      photoStart.current = { x: state.photoX, y: state.photoY };
      touchStartDist.current = null;
    } else if (e.touches.length === 2) {
      setIsDragging(false); // Disable translate drag during multi-touch pinch zoom
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartDist.current = dist;
      photoStartScale.current = state.photoScale;
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLCanvasElement>) => {
    if (!loadedPhoto) return;
    if (e.touches.length === 1 && isDragging) {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();
      const displaySize = rect.width;
      const scaleFactor = 1080 / displaySize;

      const t = e.touches[0];
      const dx = (t.clientX - dragStart.current.x) * scaleFactor;
      const dy = (t.clientY - dragStart.current.y) * scaleFactor;

      // Rotate drag delta vector by opposite of rotation angle
      const rad = (-state.photoRotation * Math.PI) / 180;
      const correctedX = dx * Math.cos(rad) - dy * Math.sin(rad);
      const correctedY = dx * Math.sin(rad) + dy * Math.cos(rad);

      setState(prev => ({
        ...prev,
        photoX: photoStart.current.x + correctedX,
        photoY: photoStart.current.y + correctedY,
      }));
    } else if (e.touches.length === 2 && touchStartDist.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = dist / touchStartDist.current;
      const nextScale = Math.min(Math.max(photoStartScale.current * factor, 0.2), 5.0);
      setState(prev => ({
        ...prev,
        photoScale: Number(nextScale.toFixed(2)),
      }));
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchStartDist.current = null;
  };

  // Image Upload handler
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setState(prev => ({
            ...prev,
            photoUrl: event.target!.result as string,
            photoX: 0,
            photoY: 0,
            photoScale: 1.0,
            photoRotation: 0, // Reset transformations on fresh photo load
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Clean / remove active photo
  const handleClearPhoto = () => {
    setState(prev => ({
      ...prev,
      photoUrl: null,
      photoX: 0,
      photoY: 0,
      photoScale: 1.0,
      photoRotation: 0,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Pre-load colorful sample sporty illustration so users can play around immediately
  const handleLoadSamplePhoto = () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 1000;
    tempCanvas.height = 1000;
    const tCtx = tempCanvas.getContext('2d');
    if (tCtx) {
      // Dynamic cycling action theme background gradient
      const g = tCtx.createLinearGradient(0, 0, 1000, 1000);
      g.addColorStop(0, '#f2709c');
      g.addColorStop(1, '#ff9472');
      tCtx.fillStyle = g;
      tCtx.fillRect(0, 0, 1000, 1000);

      // Sun glow
      tCtx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      tCtx.beginPath();
      tCtx.arc(500, 420, 280, 0, Math.PI * 2);
      tCtx.fill();

      tCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      tCtx.beginPath();
      tCtx.arc(500, 420, 200, 0, Math.PI * 2);
      tCtx.fill();

      // Cyclist emojis or graphic
      tCtx.textAlign = 'center';
      tCtx.textBaseline = 'middle';
      tCtx.font = '280px Arial';
      tCtx.fillText('🚴', 500, 440);

      // Speed lines
      tCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      tCtx.lineWidth = 14;
      tCtx.beginPath();
      tCtx.moveTo(150, 750);
      tCtx.lineTo(850, 750);
      tCtx.moveTo(250, 800);
      tCtx.lineTo(750, 800);
      tCtx.stroke();

      // Add a nice visual header in the sample picture
      tCtx.fillStyle = '#1e1b4b';
      tCtx.font = 'bold 36px "Montserrat", sans-serif';
      tCtx.fillText('SAMPLE CYCLIST ILLUSTRATION', 500, 880);

      const sampleDataUrl = tempCanvas.toDataURL('image/png');
      setState(prev => ({
        ...prev,
        photoUrl: sampleDataUrl,
        photoX: 0,
        photoY: 0,
        photoScale: 1.0,
        photoRotation: 0,
      }));
    }
  };

  // Fine zoom step controls
  const handleZoomIn = () => {
    setState(prev => ({
      ...prev,
      photoScale: Number(Math.min(prev.photoScale + 0.1, 5.0).toFixed(2))
    }));
  };

  const handleZoomOut = () => {
    setState(prev => ({
      ...prev,
      photoScale: Number(Math.max(prev.photoScale - 0.1, 0.2).toFixed(2))
    }));
  };

  // Handle fine rotation
  const handleRotate90 = () => {
    setState(prev => ({
      ...prev,
      photoRotation: (prev.photoRotation + 90) % 360,
    }));
  };

  // Reset alignment
  const handleResetAlignment = () => {
    setState(prev => ({
      ...prev,
      photoX: 0,
      photoY: 0,
      photoScale: 1.0,
      photoRotation: 0,
    }));
  };

  // Input validation check (Step 1 fields)
  const isFormValid = state.name.trim().length > 0 && state.date.trim().length > 0 && state.target.trim().length > 0;

  // Helper to get whichever canvas is currently active/visible
  const getActiveCanvas = () => {
    return mobileCanvasRef.current || desktopCanvasRef.current;
  };

  // File Download action
  const handleDownload = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${state.name ? state.name.replace(/\s+/g, '_') : 'Challenge'}_Event_Poster.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }, 'image/png');
  };

  // Web Share API support or download fallback
  const handleShare = async () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    
    // Check if web sharing is supported with file payloads
    if (navigator.share && navigator.canShare) {
      try {
        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const file = new File([blob], 'my_event_poster.png', { type: 'image/png' });
          const isWalkRunning = state.activityRoute === 'walk-runing';
          const challengeName = isWalkRunning ? 'Run Walk Challenge' : 'Cycling Challenge';
          const emojis = isWalkRunning ? '🏃‍♂️🚶‍♀️🏆' : '🚲🏆';
          const shareData = {
            files: [file],
            title: `${state.name}'s Finisher Poster`,
            text: `I just completed my target of ${state.target} in the ${challengeName}! Check out my finisher poster! ${emojis}`,
          };

          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
          } else {
            handleDownload(); // Fallback
          }
        }, 'image/png');
      } catch (err) {
        console.error('Error sharing:', err);
        handleDownload(); // Fallback
      }
    } else {
      // Desktop fallback: prompt to download
      handleDownload();
      alert('Sharing API is not supported on this device. The poster has been downloaded to your storage!');
    }
  };

  // Dropdown options based on active route
  const isWalkRunning = state.activityRoute === 'walk-runing';
  const targetOptions = isWalkRunning
    ? ['3 KM', '5 KM', '10 KM', '21 KM']
    : ['10 KM', '25 KM', '50 KM', '100 KM'];

  // States for Target to support preset dropdown
  const [targetPreset, setTargetPreset] = useState<string>(() => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    const isWalkRunningRoute = path.includes('/walk-runing');
    return isWalkRunningRoute ? '21 KM' : '100 KM';
  });

  // Keep targetPreset in sync if the activity route changes
  useEffect(() => {
    if (isWalkRunning) {
      if (!['3 KM', '5 KM', '10 KM', '21 KM'].includes(targetPreset)) {
        setTargetPreset('21 KM');
      }
    } else {
      if (!['100 KM', '50 KM', '25 KM', '10 KM'].includes(targetPreset)) {
        setTargetPreset('100 KM');
      }
    }
  }, [state.activityRoute]);

  useEffect(() => {
    setState(prev => ({ ...prev, target: targetPreset }));
  }, [targetPreset]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-4 px-4 md:py-8 md:px-6">

      {/* ========================================================
          DESKTOP SINGLE PAGE LAYOUT (Large Screens md+)
          ======================================================== */}
      <main className="hidden md:grid grid-cols-12 gap-8 w-full max-w-6xl items-start">
        
        {/* LEFT PANEL: Inputs & Editing Controls (5 Cols) */}
        <div id="desktop-inputs-panel" className="col-span-12 lg:col-span-5 flex flex-col space-y-6">
          
          {/* Card 1: Participant & Ride Details */}
          <section className="uber-card p-6 flex flex-col space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
              <FileText className="w-5 h-5 text-neutral-900" />
              <h2 className="font-bold text-neutral-900 tracking-tight text-sm uppercase">1. Participant Details</h2>
            </div>

            {/* Name Input */}
            <div className="flex flex-col space-y-2">
              <label htmlFor="name-desktop" className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Participant Name</label>
              <div className="relative uber-input-container flex items-center px-4 py-3">
                <User className="w-4 h-4 text-slate-400 mr-3" />
                <input
                  id="name-desktop"
                  type="text"
                  placeholder="Enter full name"
                  value={state.name}
                  onChange={(e) => setState(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-transparent text-neutral-900 w-full outline-none font-medium text-sm focus:outline-none"
                />
              </div>
            </div>



            {/* Target Distance Input */}
            <div className="flex flex-col space-y-2">
              <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Target Milestone</label>
              <div className="grid gap-3 grid-cols-1">
                <CustomDropdown
                  options={targetOptions}
                  selected={targetPreset}
                  onChange={setTargetPreset}
                  labelId="target-desktop"
                />
              </div>
            </div>
          </section>

          {/* Card 2: Photo Editor & Upload */}
          <section className="uber-card p-6 flex flex-col space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
              <ImageIcon className="w-5 h-5 text-neutral-900" />
              <h2 className="font-bold text-neutral-900 tracking-tight text-sm uppercase">2. Photo & Editing</h2>
            </div>

            {/* Loader buttons */}
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 py-3 px-4 uber-btn-primary text-xs flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>UPLOAD PHOTO</span>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={handleLoadSamplePhoto}
                  className="py-3 px-4 uber-btn-secondary text-xs flex items-center space-x-1"
                  title="Load sample athlete graphics"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-black" />
                  <span>USE SAMPLE</span>
                </button>
              </div>

              {state.photoUrl && (
                <div className="flex items-center justify-between bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                  <span className="text-xs font-bold text-emerald-700 flex items-center">
                    <Check className="w-3.5 h-3.5 mr-1" /> Photo Loaded
                  </span>
                  <button
                    type="button"
                    onClick={handleClearPhoto}
                    className="text-red-600 hover:text-red-700 text-xs font-bold flex items-center p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Clear
                  </button>
                </div>
              )}

              {photoError && (
                <p className="text-xs text-red-500 font-bold">{photoError}</p>
              )}
            </div>

            {/* Crop Instructions */}
            {state.photoUrl ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col space-y-3.5">
                <p className="text-xs font-semibold text-neutral-500 text-center uppercase tracking-wide">
                  ✨ Drag photo on preview to center. Use wheel to zoom.
                </p>

                {/* Scale range slider */}
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-neutral-600 w-12">Zoom</span>
                  <button type="button" onClick={handleZoomOut} className="p-1.5 rounded-full uber-btn-secondary text-neutral-900 flex items-center justify-center">
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="range"
                    min="0.2"
                    max="4.0"
                    step="0.05"
                    value={state.photoScale}
                    onChange={(e) => setState(prev => ({ ...prev, photoScale: parseFloat(e.target.value) }))}
                    className="flex-1 h-1 appearance-none rounded-lg bg-slate-200 accent-black cursor-pointer"
                  />
                  <button type="button" onClick={handleZoomIn} className="p-1.5 rounded-full uber-btn-secondary text-neutral-900 flex items-center justify-center">
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono font-bold text-neutral-600 w-10 text-right">
                    {Math.round(state.photoScale * 100)}%
                  </span>
                </div>

                {/* Rotation range slider */}
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-bold text-neutral-600 w-12">Rotation</span>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={state.photoRotation}
                    onChange={(e) => setState(prev => ({ ...prev, photoRotation: parseInt(e.target.value) }))}
                    className="flex-1 h-1 appearance-none rounded-lg bg-slate-200 accent-black cursor-pointer"
                  />
                  <button
                    type="button"
                    onClick={handleRotate90}
                    className="p-1.5 rounded-full uber-btn-secondary text-neutral-900 flex items-center justify-center"
                    title="Rotate 90 degrees"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-xs font-mono font-bold text-neutral-600 w-10 text-right">
                    {state.photoRotation}°
                  </span>
                </div>

                {/* Reset transformations */}
                <button
                  type="button"
                  onClick={handleResetAlignment}
                  className="w-full py-2 uber-btn-secondary text-xs flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>RESET PHOTO POSITION</span>
                </button>
              </div>
            ) : (
              <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center text-xs text-neutral-500 font-medium bg-white">
                Upload your photo or use our pre-made sample graphic to test the positioning editor!
              </div>
            )}
          </section>

          {/* Card 3: Design Template Variants */}
          {state.templateId !== 'youth-day' && (
            <section className="uber-card p-6 flex flex-col space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-200 pb-3">
                <Sliders className="w-5 h-5 text-neutral-900" />
                <h2 className="font-bold text-neutral-900 tracking-tight text-sm uppercase">3. Theme Templates</h2>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {TEMPLATES.filter(tpl => tpl.id !== 'youth-day').map((tpl) => {
                  const isActive = state.templateId === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setState(prev => ({ ...prev, templateId: tpl.id }))}
                      className={`p-3.5 rounded-xl text-left transition flex items-center space-x-3.5 border ${
                        isActive 
                          ? 'bg-black text-white border-black' 
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {/* Tiny visual representation of gradient */}
                      <div 
                        className="w-10 h-10 rounded-lg shadow-inner flex items-center justify-center text-base"
                        style={{ 
                          background: tpl.id === 'cycling-challenge' 
                          ? 'linear-gradient(135deg, #083c91, #d4fb02)' 
                          : 'linear-gradient(135deg, #08253a, #c084fc)'
                        }}
                      >
                        🎨
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs uppercase tracking-wide flex items-center justify-between">
                          <span className={isActive ? 'text-white' : 'text-neutral-900'}>{tpl.name}</span>
                          {isActive && <span className="text-[10px] bg-white text-black px-1.5 py-0.5 rounded-full font-black">Active</span>}
                        </div>
                        <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>{tpl.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT PANEL: Large Live Rendering Canvas & Export Actions (7 Cols) */}
        <div id="desktop-canvas-panel" className="col-span-12 lg:col-span-7 flex flex-col items-center">
          
          {/* Canvas Frame Wrapper */}
          <div className="w-full uber-card p-6 flex flex-col items-center sticky top-4">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-2 animate-pulse"></span>
              Live Real-Time Poster Preview (1080x1080)
            </h3>

            {/* Canvas Area */}
            <div className="relative group uber-canvas-frame overflow-hidden p-2 bg-white w-full max-w-[480px] aspect-square flex items-center justify-center">
              <canvas
                id="event-poster-canvas-desktop"
                ref={desktopCanvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                className={`w-full h-full rounded-xl transition-shadow ${
                  loadedPhoto ? 'cursor-grab active:cursor-grabbing hover:shadow-md' : 'cursor-default'
                }`}
                title={loadedPhoto ? "Drag to pan, use wheel to zoom" : "Event Poster Generator"}
              />

              {/* Interaction instructions overlay */}
              {loadedPhoto && (
                <div className="absolute top-4 right-4 bg-slate-900/75 text-white text-[10px] font-black px-2.5 py-1 rounded-full pointer-events-none tracking-wider uppercase backdrop-blur-sm shadow-md group-hover:opacity-100 opacity-60 transition">
                  🖱️ Drag to Move • Wheel to Zoom
                </div>
              )}
            </div>

            {/* Desktop Action panel underneath canvas */}
            <div className="w-full max-w-[480px] mt-6 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleDownload}
                disabled={!isFormValid}
                className="flex-1 py-4 px-6 uber-btn-primary text-sm flex items-center justify-center space-x-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5 text-white" />
                <span>DOWNLOAD POSTER (PNG)</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                disabled={!isFormValid}
                className="py-4 px-6 uber-btn-outline text-sm flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Share via device API or copy fallback"
              >
                <Share2 className="w-5 h-5 text-black" />
                <span>SHARE</span>
              </button>
            </div>

            {!isFormValid && (
              <p className="text-xs text-red-500 font-bold text-center mt-3">
                ⚠️ Please fill out Name, Date, and Target to enable downloads!
              </p>
            )}
          </div>
        </div>
      </main>

      {/* ========================================================
          MOBILE STEP-BASED VIEW (Viewport Optimized, Minimal Scroll)
          ======================================================== */}
      <main className="md:hidden flex flex-col flex-1 w-full max-w-md relative pb-6">
        
        {/* Step indicator header */}
        <div id="mobile-step-header" className="w-full uber-card p-3 mb-4 flex items-center justify-between rounded-xl">
          <button
            type="button"
            onClick={() => mobileStep > 1 && setMobileStep(prev => prev - 1)}
            disabled={mobileStep === 1}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition border ${
              mobileStep === 1 ? 'opacity-30 border-slate-200 text-slate-300' : 'uber-btn-outline'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
              Step {mobileStep} of 3
            </span>
            <h3 className="text-sm font-extrabold text-neutral-900">
              {mobileStep === 1 && '1. Enter Details'}
              {mobileStep === 2 && '2. Design & Crop'}
              {mobileStep === 3 && '3. Save & Share'}
            </h3>
          </div>

          <div className="flex space-x-1">
            <span className={`w-2.5 h-2.5 rounded-full transition-all ${mobileStep >= 1 ? 'bg-black w-5' : 'bg-slate-300'}`}></span>
            <span className={`w-2.5 h-2.5 rounded-full transition-all ${mobileStep >= 2 ? 'bg-black w-5' : 'bg-slate-300'}`}></span>
            <span className={`w-2.5 h-2.5 rounded-full transition-all ${mobileStep >= 3 ? 'bg-black w-5' : 'bg-slate-300'}`}></span>
          </div>
        </div>

        {/* STEP 1: Details Intake */}
        {mobileStep === 1 && (
          <div className="flex flex-col space-y-4 flex-1">
            <div className="uber-card p-5 flex flex-col space-y-4">
              <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                Add your details below to generate your event poster.
              </p>

              {/* Name */}
              <div className="flex flex-col space-y-1.5">
                <label htmlFor="name-mobile" className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Your Name</label>
                <div className="relative uber-input-container flex items-center px-4 py-3">
                  <User className="w-4 h-4 text-slate-400 mr-3" />
                  <input
                    id="name-mobile"
                    type="text"
                    placeholder="e.g. SACHIDA YADAV"
                    value={state.name}
                    onChange={(e) => setState(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-transparent text-neutral-900 w-full outline-none font-bold text-sm focus:outline-none"
                  />
                </div>
              </div>



              {/* Target Dropdown / presets */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Target Distance</label>
                <CustomDropdown
                  options={targetOptions}
                  selected={targetPreset}
                  onChange={setTargetPreset}
                  labelId="target-mobile"
                />
              </div>
            </div>


            {/* Next action at bottom of step */}
            <div className="w-full flex justify-center mt-6">
              <button
                type="button"
                onClick={() => setMobileStep(2)}
                disabled={!isFormValid}
                className={`w-full max-w-sm py-4 px-6 uber-btn-primary text-sm flex items-center justify-center space-x-2 ${
                  !isFormValid ? 'opacity-40 cursor-not-allowed' : ''
                } rounded-full`}
              >
                <span>ADD PHOTO & DESIGN</span>
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Photo Upload + Canvas Interactive Drag-Crop + Template selector */}
        {mobileStep === 2 && (
          <div className="flex flex-col space-y-4 flex-1">
            
            {/* Live Canvas Interactive Frame */}
            <div className="uber-card p-4 flex flex-col items-center">
              
              <div className="relative uber-canvas-frame overflow-hidden p-1.5 w-full max-w-[350px] aspect-square flex items-center justify-center bg-white">
                <canvas
                  id="event-poster-canvas-mobile"
                  ref={mobileCanvasRef}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                  className="w-full h-full rounded-lg"
                />

                {loadedPhoto ? (
                  <div className="absolute top-2.5 right-2.5 bg-slate-900/75 text-white text-[9px] font-black px-2 py-0.5 rounded-full pointer-events-none tracking-wide">
                    Drag/Pinch to Adjust
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/60 text-white p-4 text-center rounded-lg pointer-events-none">
                    <span className="text-3xl">👤</span>
                    <span className="text-xs font-black mt-2 tracking-wide">NO PHOTO LOADED</span>
                    <span className="text-[10px] opacity-80 mt-1">Tap circular button below to add</span>
                  </div>
                )}
              </div>

              {/* Slider & Crop helpers */}
              {loadedPhoto ? (
                <div className="w-full max-w-[290px] mt-3 space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <ZoomOut className="w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="range"
                      min="0.2"
                      max="4.0"
                      step="0.05"
                      value={state.photoScale}
                      onChange={(e) => setState(prev => ({ ...prev, photoScale: parseFloat(e.target.value) }))}
                      className="flex-1 h-1 appearance-none rounded-lg bg-slate-200 accent-black"
                    />
                    <ZoomIn className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[10px] font-mono font-bold text-slate-600">{Math.round(state.photoScale * 100)}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleRotate90}
                      className="py-1.5 px-3 uber-btn-secondary text-[10px] flex items-center space-x-1"
                    >
                      <RotateCw className="w-3 h-3 text-black" />
                      <span>Rotate 90°</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetAlignment}
                      className="py-1.5 px-3 uber-btn-secondary text-[10px] flex items-center space-x-1"
                    >
                      <RefreshCw className="w-3 h-3 text-black" />
                      <span>Reset Pan</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-[10px] text-slate-500 font-bold text-center mt-2.5">
                  ⚡ Use sample athlete or tap circular photo button below to crop!
                </p>
              )}
            </div>

            {/* Camera/Upload Trigger + Swipeable Carousel */}
            <div className="uber-card p-4 flex flex-col space-y-3.5">
              
              {/* Photo Input Trigger Row */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-600 uppercase">Participant Photo</span>
                
                <div className="flex items-center space-x-2.5">
                  {/* Circular file trigger */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-11 h-11 rounded-full uber-btn-primary flex items-center justify-center text-white"
                    title="Camera Capture"
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="hidden"
                  />

                  {state.photoUrl && (
                    <button
                      type="button"
                      onClick={handleClearPhoto}
                      className="p-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition"
                      title="Delete photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Template selector carousel */}
              {state.templateId !== 'youth-day' && (
                <div className="flex flex-col space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Poster Template Style</span>
                  <div className="flex space-x-3 overflow-x-auto pb-1 px-1 scroll-smooth snap-x">
                    {TEMPLATES.filter(tpl => tpl.id !== 'youth-day').map((tpl) => {
                      const isSelected = state.templateId === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          type="button"
                          onClick={() => setState(prev => ({ ...prev, templateId: tpl.id }))}
                          className={`flex-none w-32 p-2.5 rounded-xl text-center snap-start transition border ${
                            isSelected 
                              ? 'bg-black text-white border-black' 
                              : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div 
                            className="w-10 h-10 rounded-lg mx-auto shadow-inner mb-1.5"
                            style={{ 
                              background: tpl.id === 'cycling-challenge' 
                                ? 'linear-gradient(135deg, #083c91, #d4fb02)' 
                                : 'linear-gradient(135deg, #08253a, #c084fc)'
                            }}
                          />
                          <div className={`font-extrabold text-[10px] truncate uppercase ${isSelected ? 'text-white' : 'text-slate-800'}`}>{tpl.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>

            {/* Action to compile */}
            <div className="w-full flex justify-center mt-6">
              <button
                type="button"
                onClick={() => setMobileStep(3)}
                className="w-full max-w-sm py-4 px-6 uber-btn-primary text-sm flex items-center justify-center space-x-2 rounded-full"
              >
                <span>GENERATE FINAL POSTER</span>
                <ChevronRight className="w-5 h-5 text-white animate-pulse" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Compiled Result Poster Preview + Social Actions */}
        {mobileStep === 3 && (
          <div className="flex flex-col space-y-4 flex-1">
            <div className="uber-card p-5 flex flex-col items-center">
              
              <div className="uber-canvas-frame p-1.5 w-full max-w-[350px] aspect-square bg-white">
                <canvas
                  id="event-poster-canvas-mobile-result"
                  ref={mobileCanvasRef}
                  className="w-full h-full rounded-lg"
                />
              </div>

              <div className="mt-4 text-center">
                <h4 className="text-sm font-bold text-neutral-900">Your Poster is Ready! 🏆</h4>
                <p className="text-[10px] text-slate-500 font-medium mt-1">
                  Compiled at crisp 1080x1080 UHD resolution.
                </p>
              </div>
            </div>

            {/* Quick action buttons stack */}
            <div className="uber-card p-4 flex flex-col space-y-3">
              <button
                type="button"
                onClick={handleDownload}
                className="py-4 w-full uber-btn-primary text-xs flex items-center justify-center space-x-2 rounded-full"
              >
                <Download className="w-4 h-4 text-white" />
                <span>SAVE TO GALLERY (DOWNLOAD)</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="py-4 w-full uber-btn-outline text-xs flex items-center justify-center space-x-2 rounded-full"
              >
                <Share2 className="w-4 h-4 text-black" />
                <span>SHARE POSTER</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileStep(2)}
                className="py-2.5 w-full text-center text-black hover:underline font-bold text-xs"
              >
                ← Back to adjustment editor
              </button>
            </div>

            {/* Home Trigger */}
            <div className="w-full flex justify-center mt-6">
              <button
                type="button"
                onClick={() => setMobileStep(1)}
                className="w-full max-w-sm py-4 px-6 uber-btn-secondary text-sm rounded-full"
              >
                ← START OVER WITH NEW INFO
              </button>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER METADATA */}
      <footer id="credits-footer" className="w-full max-w-6xl mt-12 py-4 border-t border-slate-200 flex items-center justify-center text-slate-400 text-[11px] font-medium">
        <span>© 2026 Pedals Power. All rights reserved.</span>
      </footer>

    </div>
  );
}

export default function App() {
  const [path, setPath] = useState(() => typeof window !== 'undefined' ? window.location.pathname : '/cycling');

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isCertificateRoute = path.includes('/certificate') || path.includes('/certificates');

  if (isCertificateRoute) {
    return <CertificateApp />;
  }

  return <PosterGenerator />;
}
