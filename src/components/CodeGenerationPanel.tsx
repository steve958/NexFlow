"use client";
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { X, Zap, ChevronDown, Loader2, Key, Eye, EyeOff } from 'lucide-react';
import { serializeDiagram, isWithinSizeLimit, MAX_NODES_PER_GENERATION } from '@/lib/diagramSerializer';
import type { DiagramNode, DiagramEdge, NodeGroup } from '@/types/diagram';
import type {
  GenerationOptions,
  FrameworkOption,
  InfrastructureOption,
  ORMOption,
  IncludeOption,
  GeneratedFile,
  GenerationResponse,
  GenerationError,
  AIProvider,
  AIConfig,
} from '@/types/generation';
import {
  FRAMEWORK_LABELS,
  INFRASTRUCTURE_LABELS,
  ORM_LABELS,
  INCLUDE_LABELS,
  AI_PROVIDER_LABELS,
  DEFAULT_MODELS,
} from '@/types/generation';

// ─── localStorage helpers ────────────────────────────────────────────────────

const AI_CONFIG_KEY = 'nexflow_ai_config';

function loadAIConfig(): AIConfig {
  if (typeof window === 'undefined') {
    return { provider: 'anthropic', apiKey: '', model: DEFAULT_MODELS.anthropic };
  }
  try {
    const raw = localStorage.getItem(AI_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        provider: parsed.provider || 'anthropic',
        apiKey: parsed.apiKey || '',
        model: parsed.model || DEFAULT_MODELS[parsed.provider as AIProvider] || DEFAULT_MODELS.anthropic,
      };
    }
  } catch { /* ignore */ }
  return { provider: 'anthropic', apiKey: '', model: DEFAULT_MODELS.anthropic };
}

function saveAIConfig(config: AIConfig): void {
  try {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
  } catch { /* ignore */ }
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface CodeGenerationPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onGenerated: (files: GeneratedFile[]) => void;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups: NodeGroup[];
  isDark: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function detectDefaults(nodes: DiagramNode[]) {
  const types = new Set(nodes.map((n) => n.type));
  const includes: IncludeOption[] = ['api-stubs', 'readme', 'env-example'];
  if (types.has('database')) includes.push('db-schemas');
  if (types.has('container')) includes.push('dockerfiles');
  if (types.has('cicd')) includes.push('cicd');

  const infra: InfrastructureOption[] = [];
  if (types.has('container')) infra.push('docker-compose');

  let orm: ORMOption = 'none';
  if (types.has('database')) orm = 'prisma';

  return { includes, infra, orm };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function CodeGenerationPanel({
  isVisible,
  onClose,
  onGenerated,
  nodes,
  edges,
  groups,
  isDark,
}: CodeGenerationPanelProps) {
  const defaults = useMemo(() => detectDefaults(nodes), [nodes]);

  // AI settings (persisted in localStorage)
  const [aiProvider, setAiProvider] = useState<AIProvider>('anthropic');
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiModel, setAiModel] = useState(DEFAULT_MODELS.anthropic);
  const [showApiKey, setShowApiKey] = useState(false);

  // Load saved AI config on mount
  useEffect(() => {
    const saved = loadAIConfig();
    setAiProvider(saved.provider);
    setAiApiKey(saved.apiKey);
    setAiModel(saved.model);
  }, []);

  // Save AI config when it changes
  useEffect(() => {
    if (aiApiKey) {
      saveAIConfig({ provider: aiProvider, apiKey: aiApiKey, model: aiModel });
    }
  }, [aiProvider, aiApiKey, aiModel]);

  // Update default model when provider changes
  const handleProviderChange = useCallback((provider: AIProvider) => {
    setAiProvider(provider);
    setAiModel(DEFAULT_MODELS[provider]);
  }, []);

  const [framework, setFramework] = useState<FrameworkOption>('typescript-express');
  const [infrastructure, setInfrastructure] = useState<InfrastructureOption[]>(defaults.infra);
  const [orm, setOrm] = useState<ORMOption>(defaults.orm);
  const [includes, setIncludes] = useState<IncludeOption[]>(defaults.includes);
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const withinLimit = useMemo(() => isWithinSizeLimit(nodes), [nodes]);

  const toggleInfra = useCallback((opt: InfrastructureOption) => {
    setInfrastructure((prev) =>
      prev.includes(opt) ? prev.filter((i) => i !== opt) : [...prev, opt],
    );
  }, []);

  const toggleInclude = useCallback((opt: IncludeOption) => {
    setIncludes((prev) =>
      prev.includes(opt) ? prev.filter((i) => i !== opt) : [...prev, opt],
    );
  }, []);

  const handleGenerate = useCallback(async () => {
    setError(null);

    if (!aiApiKey.trim()) {
      setError('Please enter your AI API key above.');
      return;
    }

    setIsGenerating(true);

    try {
      const architecture = serializeDiagram(nodes, edges, groups);
      const options: GenerationOptions = {
        framework,
        infrastructure,
        orm,
        includes,
        additionalInstructions,
      };

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          architecture,
          options,
          aiConfig: { provider: aiProvider, apiKey: aiApiKey, model: aiModel },
        }),
      });

      if (!res.ok) {
        const err: GenerationError = await res.json();
        setError(err.error || 'Generation failed. Please try again.');
        return;
      }

      const data: GenerationResponse = await res.json();
      onGenerated(data.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsGenerating(false);
    }
  }, [nodes, edges, groups, framework, infrastructure, orm, includes, additionalInstructions, aiProvider, aiApiKey, aiModel, onGenerated]);

  // Keyboard: Escape to close (capture phase to beat canvas handler)
  useEffect(() => {
    if (!isVisible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const bg = isDark ? 'bg-gray-900' : 'bg-white';
  const border = isDark ? 'border-white/10' : 'border-gray-200';
  const text = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-500';
  const inputBg = isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900';
  const cardBg = isDark ? 'bg-gray-800/50' : 'bg-gray-50';

  return (
    <div className="fixed inset-0 z-[10003] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className={`relative w-full max-w-lg ${bg} border-l ${border} shadow-2xl flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-5 border-b ${border}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className={`text-lg font-bold ${text}`}>Generate Code</h2>
              <p className={`text-xs ${textMuted}`}>AI-powered scaffolding from your diagram</p>
            </div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* AI Settings */}
          <div className={`p-4 rounded-lg border ${isDark ? 'border-amber-500/30 bg-amber-500/5' : 'border-amber-200 bg-amber-50'}`}>
            <div className="flex items-center gap-2 mb-3">
              <Key className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
              <span className={`text-sm font-semibold ${text}`}>AI Provider Settings</span>
            </div>

            {/* Provider */}
            <div className="mb-3">
              <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Provider</label>
              <div className="relative">
                <select
                  value={aiProvider}
                  onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
                  className={`w-full px-3 py-2 rounded-lg border appearance-none cursor-pointer text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
                >
                  {(Object.entries(AI_PROVIDER_LABELS) as [AIProvider, string][]).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
                <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none ${textMuted}`} />
              </div>
            </div>

            {/* API Key */}
            <div className="mb-3">
              <label className={`block text-xs font-medium mb-1 ${textMuted}`}>API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                  placeholder={aiProvider === 'anthropic' ? 'sk-ant-...' : 'sk-...'}
                  className={`w-full px-3 py-2 pr-10 rounded-lg border text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder:text-gray-500`}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className={`text-xs mt-1 ${textMuted}`}>Stored locally in your browser only</p>
            </div>

            {/* Model */}
            <div>
              <label className={`block text-xs font-medium mb-1 ${textMuted}`}>Model</label>
              <input
                type="text"
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm ${inputBg} focus:outline-none focus:ring-2 focus:ring-amber-500/50`}
              />
            </div>
          </div>

          {/* Size warning */}
          {!withinLimit && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
              Your diagram has more than {MAX_NODES_PER_GENERATION} nodes. Consider generating per-group for better results.
            </div>
          )}

          {/* Framework */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${text}`}>Framework</label>
            <div className="relative">
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value as FrameworkOption)}
                className={`w-full px-3 py-2.5 rounded-lg border appearance-none cursor-pointer ${inputBg} focus:outline-none focus:ring-2 focus:ring-teal-500/50`}
              >
                {(Object.entries(FRAMEWORK_LABELS) as [FrameworkOption, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${textMuted}`} />
            </div>
          </div>

          {/* ORM */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${text}`}>Database ORM</label>
            <div className="relative">
              <select
                value={orm}
                onChange={(e) => setOrm(e.target.value as ORMOption)}
                className={`w-full px-3 py-2.5 rounded-lg border appearance-none cursor-pointer ${inputBg} focus:outline-none focus:ring-2 focus:ring-teal-500/50`}
              >
                {(Object.entries(ORM_LABELS) as [ORMOption, string][]).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
              <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${textMuted}`} />
            </div>
          </div>

          {/* Infrastructure */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${text}`}>Infrastructure</label>
            <div className={`p-3 rounded-lg ${cardBg} space-y-2`}>
              {(Object.entries(INFRASTRUCTURE_LABELS) as [InfrastructureOption, string][]).map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={infrastructure.includes(val)}
                    onChange={() => toggleInfra(val)}
                    className="w-4 h-4 rounded border-gray-400 text-teal-500 focus:ring-teal-500/50"
                  />
                  <span className={`text-sm ${text}`}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Includes */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${text}`}>Include</label>
            <div className={`p-3 rounded-lg ${cardBg} space-y-2`}>
              {(Object.entries(INCLUDE_LABELS) as [IncludeOption, string][]).map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includes.includes(val)}
                    onChange={() => toggleInclude(val)}
                    className="w-4 h-4 rounded border-gray-400 text-teal-500 focus:ring-teal-500/50"
                  />
                  <span className={`text-sm ${text}`}>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Instructions */}
          <div>
            <label className={`block text-sm font-semibold mb-2 ${text}`}>Additional Instructions</label>
            <textarea
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              placeholder="e.g. Use PostgreSQL, deploy to AWS ECS, add rate limiting..."
              rows={3}
              maxLength={2000}
              className={`w-full px-3 py-2.5 rounded-lg border resize-none ${inputBg} focus:outline-none focus:ring-2 focus:ring-teal-500/50 placeholder:text-gray-500`}
            />
            <div className={`text-xs mt-1 text-right ${textMuted}`}>
              {additionalInstructions.length}/2000
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-5 border-t ${border}`}>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || nodes.length === 0 || !aiApiKey.trim()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Generate Code
              </>
            )}
          </button>
          {nodes.length === 0 && (
            <p className={`text-xs text-center mt-2 ${textMuted}`}>
              Add nodes to your diagram first
            </p>
          )}
          {nodes.length > 0 && !aiApiKey.trim() && (
            <p className={`text-xs text-center mt-2 ${textMuted}`}>
              Enter your API key above to get started
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
