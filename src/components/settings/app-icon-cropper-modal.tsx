'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Upload,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Check,
  X,
  Smartphone,
  Layers,
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useModalOverlay } from '@/hooks/use-modal-overlay';

interface AppIconCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveIcon?: (iconDataUrl: string, config: { appName: string; packageName: string }) => void;
}

export function AppIconCropperModal({
  isOpen,
  onClose,
  onSaveIcon,
}: AppIconCropperModalProps) {
  const mounted = useModalOverlay(isOpen);
  const { toast } = useToast();

  // App Metadata State
  const [appName, setAppName] = useState('Nuvell');
  const [packageName, setPackageName] = useState('com.nuvell.app');
  const [packageError, setPackageError] = useState<string | null>(null);

  // Image & Canvas State
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [maskType, setMaskType] = useState<'circle' | 'squircle' | 'square'>('circle');

  // Preview Data URLs
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Validate Package Name
  const validatePackageName = (name: string): boolean => {
    const regex = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
    const reserved = new Set([
      'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
      'class', 'const', 'continue', 'default', 'do', 'double', 'else', 'enum',
      'extends', 'final', 'finally', 'float', 'for', 'goto', 'if', 'implements',
      'import', 'instanceof', 'int', 'interface', 'long', 'native', 'new',
      'package', 'private', 'protected', 'public', 'return', 'short', 'static',
      'strictfp', 'super', 'switch', 'synchronized', 'this', 'throw', 'throws',
      'transient', 'try', 'void', 'volatile', 'while'
    ]);

    if (!regex.test(name)) {
      setPackageError('Format package harus diawali huruf kecil dengan minimal satu titik (contoh: com.nuvell.app)');
      return false;
    }

    const segments = name.split('.');
    for (const seg of segments) {
      if (reserved.has(seg.toLowerCase())) {
        setPackageError(`Kata '${seg}' adalah kata kunci terlarang dalam Android Java.`);
        return false;
      }
    }

    setPackageError(null);
    return true;
  };

  // Handle Image File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'].includes(file.type)) {
      toast({
        title: 'Format file tidak didukung',
        description: 'Gunakan gambar PNG, JPG, atau WebP.',
        variant: 'error',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setZoom(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  // Draw on Canvas and Generate 1024x1024 Master Icon
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !img.complete) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 1024;
    canvas.width = size;
    canvas.height = size;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Save state
    ctx.save();

    // Center transform
    ctx.translate(size / 2 + position.x * (size / 300), size / 2 + position.y * (size / 300));
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Draw image centered
    const aspect = img.width / img.height;
    let drawW = size;
    let drawH = size;
    if (aspect > 1) {
      drawH = size / aspect;
    } else {
      drawW = size * aspect;
    }

    ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    // Export to preview data URL
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    setCroppedPreviewUrl(dataUrl);
  }, [position, rotation, zoom]);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageRef.current = img;
        renderCanvas();
      };
      img.src = imageSrc;
    } else {
      // Default Nuvell Brand Mark
      generateDefaultNuvellIcon();
    }
  }, [imageSrc, renderCanvas]);

  // Generate Default Minimal Editorial Nuvell Brand Icon
  const generateDefaultNuvellIcon = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 1024;
    canvas.width = size;
    canvas.height = size;

    // Rich Dark Charcoal Background
    const bgGrad = ctx.createRadialGradient(size / 2, size / 2, 50, size / 2, size / 2, size / 1.4);
    bgGrad.addColorStop(0, '#1A1E27');
    bgGrad.addColorStop(1, '#0E1117');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // Subtle Muted Border
    ctx.strokeStyle = 'rgba(223, 194, 111, 0.2)';
    ctx.lineWidth = 12;
    ctx.strokeRect(24, 24, size - 48, size - 48);

    // Elegant Nuvell "N" Monogram with Gold Gradient
    const goldGrad = ctx.createLinearGradient(size * 0.25, size * 0.2, size * 0.75, size * 0.8);
    goldGrad.addColorStop(0, '#DFC26F'); // Warm Gold
    goldGrad.addColorStop(0.5, '#C5A059'); // Muted Gold
    goldGrad.addColorStop(1, '#8B263E'); // Subtle Burgundy Hint

    ctx.fillStyle = goldGrad;

    // Bold Geometric 'N' with Book Cut
    ctx.beginPath();
    // Left vertical stem
    ctx.rect(size * 0.26, size * 0.24, size * 0.12, size * 0.52);
    // Right vertical stem
    ctx.rect(size * 0.62, size * 0.24, size * 0.12, size * 0.52);
    // Diagonal bar connecting the stems
    ctx.moveTo(size * 0.26, size * 0.24);
    ctx.lineTo(size * 0.74, size * 0.76);
    ctx.lineTo(size * 0.74, size * 0.64);
    ctx.lineTo(size * 0.38, size * 0.24);
    ctx.closePath();
    ctx.fill();

    // Central Warm Dot Accent
    ctx.beginPath();
    ctx.arc(size * 0.5, size * 0.82, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#DFC26F';
    ctx.fill();

    const dataUrl = canvas.toDataURL('image/png', 1.0);
    setCroppedPreviewUrl(dataUrl);
  };

  // Mouse / Touch Drag Events for Pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    if (!imageSrc) {
      generateDefaultNuvellIcon();
    }
  };

  const handleSave = () => {
    if (!validatePackageName(packageName)) {
      toast({
        title: 'Package Name Tidak Valid',
        description: packageError || 'Periksa kembali format package name.',
        variant: 'error',
      });
      return;
    }

    if (!croppedPreviewUrl) return;

    if (onSaveIcon) {
      onSaveIcon(croppedPreviewUrl, { appName, packageName });
    }

    // Save to local storage for persistent APK generation
    try {
      localStorage.setItem('nuvell_custom_icon_master', croppedPreviewUrl);
      localStorage.setItem('nuvell_custom_app_name', appName);
      localStorage.setItem('nuvell_custom_package_name', packageName);
    } catch {
      // Storage quota fallback
    }

    toast({
      title: 'App Icon Berhasil Disimpan',
      description: `Icon untuk ${appName} (${packageName}) siap dikemas ke APK.`,
    });

    onClose();
  };

  const handleDownloadMaster = () => {
    if (!croppedPreviewUrl) return;
    const a = document.createElement('a');
    a.href = croppedPreviewUrl;
    a.download = `${appName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_icon_1024.png`;
    a.click();
    toast({
      title: 'Master Icon Diunduh',
      description: 'Master icon 1024x1024 PNG berhasil disimpan ke perangkat.',
    });
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="modal-overlay-scrim flex items-center justify-center p-4 sm:p-6 transition-all animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-surface border border-border-bold dark:border-border-medium rounded-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-gold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-editorial text-editorial-title">
                Konfigurasi App Icon & Identitas Android
              </h2>
              <p className="text-xs text-editorial-muted">
                Atur ikon launcher, adaptive icon, nama aplikasi, dan package ID Android secara presisi.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-editorial-muted hover:text-editorial-title hover:bg-surface-raised transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Canvas Cropper & Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Hidden Master Output Canvas */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Interactive Crop Stage */}
            <div className="relative aspect-square w-full max-w-[340px] mx-auto rounded-2xl bg-surface-sunken border border-border-subtle overflow-hidden flex items-center justify-center shadow-inner cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Rendered Live Image Preview */}
              {croppedPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={croppedPreviewUrl}
                  alt="Crop Canvas"
                  className="w-full h-full object-contain pointer-events-none"
                />
              ) : (
                <div className="text-center p-6 text-editorial-faint">
                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <span className="text-xs">Klik Upload untuk memilih gambar icon</span>
                </div>
              )}

              {/* Android Adaptive Safe Zone Mask Overlay */}
              <div className="absolute inset-0 pointer-events-none border border-dashed border-gold/40 m-8 rounded-full flex items-center justify-center">
                <span className="text-[10px] font-mono text-gold/60 bg-black/60 px-2 py-0.5 rounded-full">
                  Safe Zone 66%
                </span>
              </div>
            </div>

            {/* File Upload Button */}
            <div className="flex items-center justify-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-gold/15 hover:bg-gold/25 border border-gold/40 text-gold text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Gambar Kustom</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setImageSrc(null);
                  handleReset();
                }}
                className="px-3 py-2 rounded-xl bg-surface-raised hover:bg-surface-sunken border border-border-subtle text-editorial-muted text-xs font-medium transition-colors"
              >
                Gunakan Default Nuvell
              </button>
            </div>

            {/* Editing Controls (Zoom, Rotate, Reset) */}
            <div className="bg-surface-raised/50 p-3.5 rounded-xl border border-border-subtle space-y-3">
              {/* Zoom Control */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="text-editorial-muted font-medium flex items-center gap-1.5">
                  <ZoomIn className="w-3.5 h-3.5 text-gold" />
                  Skala / Zoom ({zoom.toFixed(2)}x)
                </span>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="flex-1 max-w-[180px] accent-gold cursor-pointer"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-border-subtle/60">
                <span className="text-[11px] text-editorial-faint">
                  Drag gambar untuk menggeser posisi
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-1.5 rounded-lg bg-surface border border-border-subtle text-editorial-muted hover:text-gold hover:border-gold/40 transition-colors"
                    title="Putar 90 Derajat"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1.5 rounded-lg bg-surface border border-border-subtle text-editorial-muted hover:text-editorial-title hover:border-border-bold transition-colors"
                    title="Reset Posisi & Zoom"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Previews & Metadata Inputs (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Metadata Fields */}
            <div className="space-y-3 bg-surface-raised/40 p-4 rounded-xl border border-border-subtle">
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-editorial-faint block">
                  Nama Aplikasi (Launcher Label)
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Contoh: Nuvell"
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-border-subtle text-sm text-editorial-title focus:border-gold focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase tracking-wider text-editorial-faint block">
                  Android Package Name
                </label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => {
                    setPackageName(e.target.value.toLowerCase().trim());
                    validatePackageName(e.target.value.toLowerCase().trim());
                  }}
                  placeholder="com.nuvell.app"
                  className={`w-full px-3 py-2 rounded-lg bg-surface border text-sm font-mono text-editorial-title focus:outline-none transition-colors ${
                    packageError ? 'border-red-500/80 focus:border-red-500' : 'border-border-subtle focus:border-gold'
                  }`}
                />
                {packageError && (
                  <p className="text-[10px] text-red-400 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{packageError}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Android Launcher Previews */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-editorial-faint">
                  Pratinjau Launcher Android
                </span>
                {/* Mask switcher */}
                <div className="flex items-center gap-1 text-[10px]">
                  {(['circle', 'squircle', 'square'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMaskType(m)}
                      className={`px-2 py-0.5 rounded capitalize ${
                        maskType === m ? 'bg-gold text-background font-semibold' : 'text-editorial-faint hover:text-editorial-muted'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-sunken border border-border-subtle flex items-center justify-around">
                {/* 1. Large Circle Launcher Preview */}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-16 h-16 shadow-lg border border-gold/20 overflow-hidden bg-surface ${
                      maskType === 'circle'
                        ? 'rounded-full'
                        : maskType === 'squircle'
                        ? 'rounded-2xl'
                        : 'rounded-lg'
                    }`}
                  >
                    {croppedPreviewUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={croppedPreviewUrl} alt="Launcher Icon" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span className="text-xs font-semibold text-editorial-title truncate max-w-[80px]">
                    {appName || 'Nuvell'}
                  </span>
                </div>

                {/* 2. Small In-App / Settings Icon Preview */}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-10 h-10 shadow border border-border-subtle overflow-hidden bg-surface ${
                      maskType === 'circle' ? 'rounded-full' : 'rounded-xl'
                    }`}
                  >
                    {croppedPreviewUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={croppedPreviewUrl} alt="Settings Icon" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span className="text-[10px] text-editorial-faint font-mono">32dp</span>
                </div>

                {/* 3. Tiny Notification / Status Icon */}
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-7 h-7 shadow-sm border border-border-subtle overflow-hidden bg-surface ${
                      maskType === 'circle' ? 'rounded-full' : 'rounded-lg'
                    }`}
                  >
                    {croppedPreviewUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={croppedPreviewUrl} alt="Status Icon" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <span className="text-[10px] text-editorial-faint font-mono">24dp</span>
                </div>
              </div>
            </div>

            {/* Master Export Info */}
            <div className="p-3 rounded-xl bg-gold/5 border border-gold/20 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-gold font-semibold">
                <Layers className="w-4 h-4" />
                <span>Multi-Density Adaptive Pack</span>
              </div>
              <p className="text-[11px] text-editorial-muted leading-relaxed">
                Menghasilkan master 1024x1024 beserta density mipmaps (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi) dan adaptive icon XML.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-border-subtle flex items-center justify-between gap-3 bg-surface-raised/40">
          <button
            type="button"
            onClick={handleDownloadMaster}
            className="px-4 py-2 rounded-xl bg-surface border border-border-subtle hover:border-gold/40 text-editorial-muted hover:text-editorial-title text-xs font-medium flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Master PNG (1024x1024)</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-editorial-muted hover:text-editorial-title text-xs font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-gold hover:bg-gold/90 text-background text-xs font-bold flex items-center gap-2 transition-all shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Konfigurasi Icon</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
