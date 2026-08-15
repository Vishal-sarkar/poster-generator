/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { CertificateData, TEMPLATES } from '../types';
import { TemplateBackground, TemplateBadge } from './TemplateDesigns';
// @ts-ignore
import certNavyGoldBg from '../../assets/cert_navy_gold_bg.png';
// @ts-ignore
import certYouthDayBg from '../../assets/cert_youth_day_bg.svg';
// @ts-ignore
import certIndependenceDayBg from '../../assets/cert_independence_day_bg.svg';
// @ts-ignore
import certIndependenceDayCyclingBg from '../../assets/cert_independence_day_cycling_bg.svg';

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (isNaN(date.getTime())) return dateStr;

  const dayNum = date.getDate();
  const monthName = date.toLocaleString('en-US', { month: 'long' });
  const fullYear = date.getFullYear();

  const suffix = (d: number) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };

  return `${dayNum}${suffix(dayNum)} ${monthName} ${fullYear}`;
};

interface CertificatePreviewProps {
  data: CertificateData;
  isGenerating?: boolean; // If true, forces scale to 1 for html2canvas extraction
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({ data, isGenerating = false }) => {
     const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(() => {
    if (isGenerating) return 1; // <--- Prevents scale from initializing to 0.25 on iOS
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 768;
      const estimateWidth = isMobile ? window.innerWidth - 32 : (window.innerWidth * 7 / 12) - 48;
      const targetWidth = Math.min(1414, Math.max(0, estimateWidth - 4));
      return targetWidth / 1414;
    }
    return 1;
  });



  // Responsive scaling logic
  useEffect(() => {
    if (isGenerating) {
      setScale(1);
      return;
    }

    const handleResize = () => {
      if (!containerRef.current) return;
      const containerWidth = containerRef.current.getBoundingClientRect().width || 1414;
      // Subtract 4px for the left and right border of the wrapper
      const maxTargetWidth = Math.max(0, containerWidth - 4);
      const targetWidth = Math.min(1414, maxTargetWidth);
      setScale(targetWidth / 1414);
    };

    // Initial scale check
    handleResize();

    // Set up ResizeObserver for real-time fluid responsiveness
    if (containerRef.current && containerRef.current.parentElement) {
      const observer = new ResizeObserver(() => {
        handleResize();
      });
      observer.observe(containerRef.current.parentElement);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isGenerating]);

  const template = TEMPLATES.find((t) => t.id === data.selectedTemplateId) || TEMPLATES[0];

  // Font size logic for recipient's name (different for Youth Day / Independence Day vs others)
  const getNameStyle = (nameText: string): React.CSSProperties => {
    if (data.selectedTemplateId === '2' || data.selectedTemplateId === 'independence-day' || data.selectedTemplateId === '3') {
      const len = nameText.length || 1;
      const calculatedSize = len <= 24 ? 80 : Math.max(38, Math.min(55, 1700 / len));
      return {
        fontSize: `${calculatedSize}px`,
        color: template.textColor,
      };
    }
    const len = nameText.length || 1;
    const calculatedSize = Math.max(26, Math.min(68, 1100 / Math.max(12, len)));
    return {
      fontSize: `${calculatedSize}px`,
      color: template.textColor,
    };
  };

  // Format Description text
  const getDescriptionText = () => {
    const hasRide = data.rideName.trim().length > 0;
    const hasDate = data.rideDate.trim().length > 0;

    if (hasRide && hasDate) {
      return `For successfully completing ${data.rideName.trim()} on ${formatDate(data.rideDate.trim())}`;
    } else if (hasRide) {
      return `For successfully completing ${data.rideName.trim()}`;
    } else if (hasDate) {
      return `For successfully completing the achievement challenge on ${formatDate(data.rideDate.trim())}`;
    } else {
      return 'For successfully completing the achievement challenge';
    }
  };

  // Helper to format/display completed distance safely
  const displayCompletedDistance = () => {
    const comp = (data.completedDistance || '').trim();
    if (!comp) {
      const dist = (data.distance || '0.00').replace(/[a-zA-Z\s]/g, '');
      return `${dist} KM`;
    }
    const cleanNum = comp.replace(/[^0-9.]/g, '');
    return `${cleanNum} KM`;
  };

  const wrapperStyle: React.CSSProperties = isGenerating
    ? {
        width: '1414px',
        height: '970px',
        position: 'relative',
        overflow: 'hidden',
      }
    : {
        width: `${scale * 1414 + 4}px`,
        height: `${scale * 970 + 4}px`,
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
        border: '2px solid #e2e8f0',
        borderRadius: '6px',
      };

  const innerStyle: React.CSSProperties = {
    width: '1414px',
    height: '970px',
    transform: isGenerating ? 'none' : `scale(${scale})`,
    transformOrigin: 'top left',
    position: 'absolute',
    top: 0,
    left: 0,
    boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif',
  };

  if (data.selectedTemplateId === '1') {
    return (
      <div ref={containerRef} className="w-full flex items-start justify-start select-none" id="cert-preview-wrapper">
        <div style={wrapperStyle} className="transition-all duration-200">
          <div style={innerStyle} className="bg-white relative shadow-none" id="certificate-print-area">
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
              <img src={certNavyGoldBg} alt="Certificate Background" className="w-full h-full object-cover" />
            </div>

            {/* Recipient Name */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 text-center flex items-center justify-center" 
              style={{ 
                top: '420px', 
                width: '1200px', 
                height: '60px',
                zIndex: 10 
              }}
            >
              <h2 
                className="font-bold tracking-normal leading-tight font-serif-cert text-center"
                style={{
                  ...getNameStyle(data.name || 'YOUR NAME HERE'),
                  fontFamily: '"Cinzel", serif',
                  fontWeight: 700,
                  color: '#0A2540',
                  margin: 0,
                  padding: 0,
                  whiteSpace: 'nowrap'
                }}
              >
                {(data.name || '').trim() || 'YOUR NAME HERE'}
              </h2>
            </div>

            {/* Event Description (covers and replaces "held on 1" text on background) */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 text-center flex items-center justify-center bg-white font-sans" 
              style={{ 
                top: '522px', 
                width: '950px', 
                height: '35px', 
                zIndex: 10,
                color: '#0A2540',
                fontSize: '18px',
                fontWeight: 500
              }}
            >
              For successfully completing {(data.rideName || 'World Bicycle Day Virtual Challenge 2026').trim()} held on {formatDate(data.rideDate || '13th July 2026').trim()}
            </div>

            {/* Duration Stat (placed above the line) */}
            <div 
              className="absolute text-center" 
              style={{ 
                left: '266px', 
                top: '635px', 
                width: '260px', 
                zIndex: 10 
              }}
            >
              <span className="text-[32px] font-bold tracking-wider font-sans" style={{ color: '#0A2540' }}>
                {data.duration || '00:00:00'}
              </span>
            </div>

            {/* Distance Stat (placed above the line) */}
            <div 
              className="absolute text-center" 
              style={{ 
                left: '886px', 
                top: '635px', 
                width: '260px', 
                zIndex: 10 
              }}
            >
              <span className="text-[32px] font-bold tracking-wider font-sans" style={{ color: '#0A2540' }}>
                {displayCompletedDistance()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

    if (data.selectedTemplateId === '2') {
    return (
      <div 
        ref={containerRef} 
        className="w-full flex items-start justify-start select-none" 
        style={isGenerating ? { width: '1414px', minWidth: '1414px' } : undefined}
        id="cert-preview-wrapper"
      >
        <div style={wrapperStyle} className="transition-all duration-200">
          <div style={innerStyle} className="bg-white relative shadow-none" id="certificate-print-area">

                        {/* Background Image */}
            <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
              <img 
                src={certYouthDayBg} 
                alt="Certificate Background" 
                className="w-full h-full object-cover" 
                style={{ width: '1414px', height: '970px', maxWidth: 'none', maxHeight: 'none' }}
                width="1414" 
                height="970" 
              />
            </div>


            {/* Recipient Name */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 text-center flex items-center justify-center" 
              style={{ 
                top: isGenerating ? '345px' : '370px', 
                width: '1200px', 
                height: '160px',
                zIndex: 10 
              }}
            >
              <h2 
                className="font-bold tracking-normal text-center"
                style={{
                  ...getNameStyle(data.name || 'YOUR NAME HERE'),
                  fontFamily: '"Poppins", sans-serif',
                  fontWeight: 500,
                  color: '#d09e3b',
                  letterSpacing: '0.02em',
                  margin: 0,
                  padding: 0,
                  lineHeight: '1.05'
                }}
              >
                {(data.name || '').trim() || 'YOUR NAME HERE'}
              </h2>
            </div>

            {/* Duration Stat (placed above the line) */}
            <div 
              className="absolute text-center" 
              style={{ 
                left: '266px', 
                top: isGenerating ? '640px' : '664px', 
                width: '260px', 
                zIndex: 10 
              }}
            >
              <span className="text-[28px] font-bold tracking-normal text-[#1A2B4C]" style={{ fontFamily: '"Boston Angel", serif' }}>
                {data.duration || '00:00:00'}
              </span>
            </div>

            {/* Distance Stat (placed above the line) */}
            <div 
              className="absolute text-center" 
              style={{ 
                left: '858px', 
                top: isGenerating ? '640px' : '664px', 
                width: '260px', 
                zIndex: 10 
              }}
            >
              <span className="text-[28px] font-bold tracking-normal text-[#1A2B4C]" style={{ fontFamily: '"Boston Angel", serif' }}>
                {displayCompletedDistance()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (data.selectedTemplateId === 'independence-day' || data.selectedTemplateId === '3') {
    const isWalkRunning = typeof window !== 'undefined' && window.location.pathname.includes('/walk-runing');
    const bgImg = isWalkRunning ? certIndependenceDayBg : certIndependenceDayCyclingBg;

    return (
      <div ref={containerRef} className="w-full flex items-start justify-start select-none" id="cert-preview-wrapper">
        <div style={wrapperStyle} className="transition-all duration-200">
          <div style={innerStyle} className="bg-white relative shadow-none" id="certificate-print-area">
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
              <img src={bgImg} alt="Certificate Background" className="w-full h-full object-cover" />
            </div>

            {/* Recipient Name */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 text-center flex items-center justify-center" 
              style={{ 
                top: isGenerating ? '365px' : '400px', 
                width: '1200px', 
                height: '160px',
                zIndex: 10 
              }}
            >
              <h2 
                className="font-medium tracking-normal text-center"
                style={{
                  ...getNameStyle(data.name || 'YOUR NAME HERE'),
                  fontFamily: '"Glacial Indifference", sans-serif',
                  fontWeight: 500,
                  color: '#d09e3b',
                  letterSpacing: '0.02em',
                  margin: 0,
                  padding: 0,
                  lineHeight: '1.05'
                }}
              >
                {(data.name || '').trim() || 'YOUR NAME HERE'}
              </h2>
            </div>

            {/* Duration Stat (placed above the line) */}
            <div 
              className="absolute text-center" 
              style={{ 
                left: '262px', 
                top: isGenerating ? '695px' : '715px', 
                width: '260px', 
                zIndex: 10 
              }}
            >
              <span className="text-[28px] font-medium tracking-normal text-[#1A2B4C]" style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 500 }}>
                {data.duration || '00:00:00'}
              </span>
            </div>

            {/* Distance Stat (placed above the line) */}
            <div 
              className="absolute text-center" 
              style={{ 
                left: '854px', 
                top: isGenerating ? '695px' : '715px', 
                width: '260px', 
                zIndex: 10 
              }}
            >
              <span className="text-[28px] font-medium tracking-normal text-[#1A2B4C]" style={{ fontFamily: '"Poppins", sans-serif', fontWeight: 500 }}>
                {displayCompletedDistance()}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full flex items-start justify-start select-none" id="cert-preview-wrapper">
      <div style={wrapperStyle} className="transition-all duration-200">
        <div style={innerStyle} className="bg-white relative shadow-none" id="certificate-print-area">
          {/* SVG Geometric Background Border */}
          <TemplateBackground template={template} />

          {/* Certificate Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-[90px] text-center" style={{ zIndex: 10 }}>
            {/* Top Row: Empty Left / Logo and Badge Right */}
            <div className="flex justify-between items-start w-full">
              {/* Top Left: Small Decorative Accent */}
              <div className="text-left">
                <p className="text-xs tracking-widest font-mono uppercase" style={{ color: template.accentColor }}>
                  OFFICIAL ATHLETIC RECORD
                </p>
                <div className="w-24 h-0.5 mt-1" style={{ backgroundColor: template.primaryColor }} />
              </div>

              {/* Top Right: Certificate Badge */}
              <div className="pr-4 pt-2">
                <TemplateBadge type={template.badgeType} primaryColor={template.primaryColor} accentColor={template.accentColor} />
              </div>
            </div>

            {/* Middle Section: Main Text Layout */}
            <div className="flex-1 flex flex-col justify-center items-center my-4 space-y-6">
              {/* Certificate Header */}
              <div className="space-y-2">
                <h1 className={`text-5xl font-extrabold tracking-widest uppercase ${template.fontTitle}`} style={{ color: template.primaryColor }}>
                  Certificate
                </h1>
                <p className={`text-sm tracking-widest font-bold uppercase ${template.fontLabel}`} style={{ color: template.accentColor }}>
                  of achievement
                </p>
              </div>

              {/* Sub-header */}
              <p className="text-sm font-medium uppercase tracking-wider font-sans" style={{ color: '#64748B' }}>
                This Certificate Is Given To
              </p>

              {/* Recipient Name with dynamic text scale */}
              <div className="w-full max-w-[850px] min-h-[90px] flex items-center justify-center py-2" style={{ borderBottom: '2px solid transparent' }}>
                <h2 
                  className={`font-bold tracking-normal leading-tight text-center px-4 ${template.fontName}`}
                  style={{
                    ...getNameStyle(data.name || 'YOUR NAME HERE'),
                    whiteSpace: 'nowrap'
                  }}
                >
                  {data.name.trim() || 'YOUR NAME HERE'}
                </h2>
              </div>

              {/* Accomplishment description */}
              <p className="text-lg max-w-[720px] leading-relaxed font-sans italic" style={{ color: '#475569' }}>
                {getDescriptionText()}
              </p>
            </div>

            {/* Bottom Row: Stats and Signature */}
            <div className="grid grid-cols-3 items-end w-full px-12 pt-4">
              {/* Left Column: Duration Stat */}
              <div className="flex flex-col items-center">
                <span className={`text-3xl font-bold tracking-wider ${template.fontLabel}`} style={{ color: template.primaryColor }}>
                  {data.duration || '00:00:00'}
                </span>
                <div className="w-full max-w-[180px] h-0.5 my-2" style={{ backgroundColor: template.primaryColor }} />
                <span className="text-xs font-bold tracking-widest uppercase font-sans" style={{ color: '#94A3B8' }}>
                  Duration
                </span>
              </div>

              {/* Center Column: Official Signature */}
              <div className="flex flex-col items-center px-6">
                {/* Simulated Cursive Signature */}
                <div className="h-14 flex items-center justify-center">
                  <span className="text-4xl font-signature font-medium" style={{ color: template.primaryColor }}>
                    {data.signatureText || 'Unique Jain'}
                  </span>
                </div>
                <div className="w-full max-w-[200px] h-0.5 my-2" style={{ backgroundColor: template.primaryColor }} />
                <span className="text-xs font-bold tracking-wider uppercase" style={{ fontFamily: 'Inter, sans-serif', color: '#1E293B' }}>
                  {data.signatureName || 'Unique Jain'}
                </span>
                <span className="text-[10px] font-medium tracking-wide font-sans" style={{ color: '#64748B' }}>
                  {data.signatureRole || 'Founder & CEO'}
                </span>
              </div>

              {/* Right Column: Distance Stat */}
              <div className="flex flex-col items-center">
                <span className={`text-3xl font-bold tracking-wider ${template.fontLabel}`} style={{ color: template.primaryColor }}>
                  {displayCompletedDistance()}
                </span>
                <div className="w-full max-w-[180px] h-0.5 my-2" style={{ backgroundColor: template.primaryColor }} />
                <span className="text-xs font-bold tracking-widest uppercase font-sans" style={{ color: '#94A3B8' }}>
                  Distance
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
