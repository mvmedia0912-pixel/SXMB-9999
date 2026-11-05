import React, { useState } from 'react';
import {
  Smartphone,
  Download,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Zap,
  FileCode,
  Layers,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.ts';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedManifestUrl, setCopiedManifestUrl] = useState(false);
  const [copiedManifestJson, setCopiedManifestJson] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [showManifestDetail, setShowManifestDetail] = useState(false);

  if (!isOpen) return null;

  const appUrl = window.location.origin || 'https://ais-pre-jzwjftjubsnkhpnapim55p-10678451654.asia-east1.run.app';
  const manifestUrl = `${appUrl}/manifest.json`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(appUrl)}`;
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}`;

  const manifestJsonContent = JSON.stringify(
    {
      id: "/",
      name: "XSMB AI - Dự Đoán Xổ Số Miền Bắc",
      short_name: "XSMB AI",
      description: "Ứng dụng dự đoán xổ số miền Bắc với thuật toán xác suất thống kê, Pascal, Bạc Nhớ và Cầu Ghép",
      start_url: "/",
      scope: "/",
      display: "standalone",
      orientation: "portrait-primary",
      background_color: "#0f172a",
      theme_color: "#0f172a",
      lang: "vi",
      dir: "ltr",
      categories: ["utilities", "entertainment", "lifestyle"],
      icons: [
        {
          src: `${appUrl}/pwa-192x192.png`,
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `${appUrl}/pwa-512x512.png`,
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: `${appUrl}/pwa-maskable-512x512.png`,
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
        {
          src: `${appUrl}/apple-touch-icon.png`,
          sizes: "180x180",
          type: "image/png",
        },
      ],
    },
    null,
    2
  );

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyManifestUrl = () => {
    navigator.clipboard.writeText(manifestUrl);
    setCopiedManifestUrl(true);
    setTimeout(() => setCopiedManifestUrl(false), 2000);
  };

  const handleCopyManifestJson = () => {
    navigator.clipboard.writeText(manifestJsonContent);
    setCopiedManifestJson(true);
    setTimeout(() => setCopiedManifestJson(false), 2000);
  };

  const handleDirectInstall = async () => {
    const success = await install();
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl text-slate-100 p-6 md:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">Cài Đặt App Cho Điện Thoại Android</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                WebAPK & APK
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-0.5">
              Tạo biểu tượng trên màn hình chính, chạy độc lập mượt mà không có thanh trình duyệt
            </p>
          </div>
        </div>

        {/* Success Alert if installed */}
        {installSuccess && (
          <div className="mb-5 p-4 rounded-xl bg-emerald-950/60 border border-emerald-600/40 text-emerald-200 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">
              Đã kích hoạt cài đặt thành công! Biểu tượng app đã được thêm vào màn hình chính Android.
            </span>
          </div>
        )}

        {/* Method 1: Instant 1-Click Install if on Android Chrome */}
        {isInstallable && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-slate-800 border border-emerald-500/40">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Cài đặt trực tiếp ngay bây giờ</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Trình duyệt hỗ trợ cài đặt trực tiếp gói WebAPK chuẩn Android vào máy.
                </p>
              </div>
              <button
                onClick={handleDirectInstall}
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-950/50 transition cursor-pointer active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Cài Đặt Ngay</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab / Step Breakdown */}
        <div className="space-y-4 text-xs md:text-sm">
          {/* Method A (Recommended): Direct WebAPK via Phone Chrome */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-bold text-emerald-300">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px]">1</span>
                <span>Cách nhanh nhất: Cài trực tiếp trên điện thoại Android (Khuyên dùng)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Tự động tạo WebAPK
              </span>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed mb-3">
              Không cần dùng PWABuilder hay máy tính, chỉ cần mở link trên Google Chrome điện thoại Android:
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="p-2 bg-white rounded-xl shadow-md shrink-0">
                <img
                  src={qrCodeUrl}
                  alt="QR Code XSMB App"
                  className="w-32 h-32 object-contain"
                  loading="lazy"
                />
              </div>

              <div className="flex-1 space-y-2 w-full">
                <ol className="list-decimal list-inside text-slate-300 text-xs space-y-1.5 pl-1 leading-relaxed">
                  <li>Dùng camera điện thoại Android quét mã QR hoặc mở link bên dưới:</li>
                  <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950/70 border border-slate-700/60 my-1">
                    <input
                      type="text"
                      readOnly
                      value={appUrl}
                      className="w-full bg-transparent px-2 text-[11px] font-mono text-slate-300 outline-none truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition shrink-0"
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLink ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                  <li>Nhấn nút <strong>"Cài App Android"</strong> hoặc bấm menu <strong>3 chấm (⋮)</strong> góc phải Chrome.</li>
                  <li>Chọn <strong>"Cài đặt ứng dụng"</strong> (Install App). Android sẽ tự động tạo icon ra màn hình chính!</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Method B: PWABuilder Export & Manifest Fix */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-white">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-purple-600 text-[11px]">2</span>
                <span>Xuất file APK qua PWABuilder (Nếu cần tải file .apk về máy)</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                File .APK
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Nếu PWABuilder thông báo chưa quét thấy Manifest tự động, bạn có thể cấp trực tiếp link Manifest đã cấu hình sẵn:
            </p>

            {/* Direct Manifest Link */}
            <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 font-medium text-purple-300">
                  <FileCode className="w-3.5 h-3.5" />
                  Đường dẫn Manifest chính thức:
                </span>
                <button
                  onClick={handleCopyManifestUrl}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white"
                >
                  {copiedManifestUrl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedManifestUrl ? 'Đã sao chép link' : 'Sao chép link'}</span>
                </button>
              </div>
              <div className="font-mono text-[11px] text-amber-300 bg-slate-900 px-2 py-1 rounded select-all break-all">
                {manifestUrl}
              </div>
            </div>

            {/* Button to open PWABuilder */}
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <a
                href={pwaBuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Mở PWABuilder Đã Cập Nhật</span>
              </a>

              <button
                onClick={() => setShowManifestDetail(!showManifestDetail)}
                className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-xs transition"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{showManifestDetail ? 'Ẩn Mã JSON' : 'Xem / Dán JSON Manifest'}</span>
              </button>
            </div>

            {/* Collapsible Manifest JSON for Manual Paste */}
            {showManifestDetail && (
              <div className="mt-2 p-3 rounded-lg bg-slate-950/90 border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Nội dung Manifest (Dán vào Manifest Editor nếu cần):</span>
                  <button
                    onClick={handleCopyManifestJson}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-semibold"
                  >
                    {copiedManifestJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedManifestJson ? 'Đã chép JSON' : 'Sao chép JSON'}</span>
                  </button>
                </div>
                <pre className="text-[10px] font-mono text-emerald-300 max-h-40 overflow-y-auto p-2 bg-slate-900 rounded">
                  {manifestJsonContent}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Benefits badge */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>An toàn 100%, không yêu cầu quyền nhạy cảm</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Tự động cập nhật kết quả hàng ngày</span>
          </div>
        </div>
      </div>
    </div>
  );
};
