import React, { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { Copy, CheckCircle, Pipette } from "lucide-react";

export const AdvancedColorPicker = ({
  color,
  onChange,
}: {
  color: string;
  onChange: (color: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Quick preset palette (24 base hues)
  const presets = [
    "#e11d48", "#f43f5e", "#f472b6", "#d946ef", "#a855f7", "#8b5cf6",
    "#6366f1", "#3b82f6", "#0ea5e9", "#06b6d4", "#14b8a6", "#10b981",
    "#22c55e", "#84cc16", "#eab308", "#f59e0b", "#f97316", "#ef4444",
    "#78716c", "#52525b", "#3f3f46", "#27272a", "#18181b", "#09090b"
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(color).catch(() => {
      const ta = document.createElement("textarea");
      ta.value = color;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-all w-full"
      >
        <div
          className="w-8 h-8 rounded-lg shadow-inner border border-black/10"
          style={{ backgroundColor: color }}
        />
        <div className="flex-1 text-left">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Pen Color</p>
          <p className="text-xs text-slate-500 font-mono">{color.toUpperCase()}</p>
        </div>
        <Pipette size={16} className="text-slate-400 mr-2" />
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="mb-4">
            {/* Custom UI override for react-colorful */}
            <style dangerouslySetInnerHTML={{__html: `
              .custom-layout .react-colorful { width: 100%; height: 200px; gap: 12px; }
              .custom-layout .react-colorful__pointer { width: 24px; height: 24px; border: 3px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); }
              .custom-layout .react-colorful__hue { height: 16px; border-radius: 8px; }
              .custom-layout .react-colorful__hue-pointer { width: 20px; height: 20px; }
              .custom-layout .react-colorful__saturation { border-radius: 12px; border-bottom: none; }
            `}} />
            <div className="custom-layout">
              <HexColorPicker color={color} onChange={onChange} />
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100 mb-4">
            <span className="font-mono text-sm font-semibold text-slate-700 px-2 uppercase">{color}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 hover:bg-white rounded-lg transition-colors text-slate-500 relative"
              title="Copy HEX"
            >
              {copied ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
          </div>

          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Quick Presets</p>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChange(p)}
                  className={`w-6 h-6 rounded-md shadow-sm border border-black/5 transition-transform hover:scale-110 active:scale-95 ${color.toLowerCase() === p ? 'ring-2 ring-offset-2 ring-slate-800' : ''}`}
                  style={{ backgroundColor: p }}
                  title={p}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Backdrop to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
