import { X, Save, Cpu, Search, Zap } from 'lucide-react';
import { AppSettings } from '../types';
import { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

export default function SettingsModal({ isOpen, onClose, currentSettings, onSave }: SettingsModalProps) {
  const [settings, setSettings] = useState<AppSettings>(currentSettings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-500" />
            Agent Configuration
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="Close settings"
            title="Close settings"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* 1. Model Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              AI Model
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSettings({ ...settings, model: 'gemini-2.0-flash' })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  settings.model === 'gemini-2.0-flash'
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="font-semibold text-sm">Gemini 2.0 Flash</div>
                <div className="text-xs opacity-70">Fastest response</div>
              </button>
              <button
                onClick={() => setSettings({ ...settings, model: 'gemini-1.5-pro' })}
                className={`p-3 rounded-lg border text-left transition-all ${
                  settings.model === 'gemini-1.5-pro'
                    ? 'bg-blue-600/20 border-blue-500 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="font-semibold text-sm">Gemini 1.5 Pro</div>
                <div className="text-xs opacity-70">Deep reasoning</div>
              </button>
            </div>
          </div>

          {/* 2. Search Depth Slider */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Search className="w-4 h-4 text-green-500" />
                Search Depth
              </label>
              <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">
                {settings.searchDepth} chunks
              </span>
            </div>
            {/* FIX: Added aria-label and title */}
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={settings.searchDepth}
              aria-label="Search Depth Control"
              title="Search Depth Control"
              onChange={(e) => setSettings({ ...settings, searchDepth: parseInt(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <p className="text-xs text-slate-500">
              Higher depth finds more details but is slower.
            </p>
          </div>

          {/* 3. Creativity Slider */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-500" />
                Creativity (Temperature)
              </label>
              <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-300">
                {settings.creativity}
              </span>
            </div>
            {/* FIX: Added aria-label and title */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.creativity}
              aria-label="Creativity Temperature Control"
              title="Creativity Temperature Control"
              onChange={(e) => setSettings({ ...settings, creativity: parseFloat(e.target.value) })}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <p className="text-xs text-slate-500">
              0.0 is strict fact-based. 1.0 allows more creative reasoning.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}