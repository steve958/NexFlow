"use client";

import React, { useState, useCallback } from 'react';
import { X, Plus, Save, Square, Circle, Diamond } from 'lucide-react';

interface CustomNodeBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (template: CustomNodeTemplate) => void;
}

export interface CustomNodeTemplate {
  id: string;
  type: string;
  label: string;
  color: string;
  borderColor: string;
  textColor: string;
  shape: 'rectangle' | 'rounded' | 'circle' | 'diamond';
  icon?: string; // SVG string or icon name
  description: string;
  category: string;
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NodePreview {
  type: string;
  label: string;
  color: string;
  borderColor: string;
  textColor: string;
  shape: 'rectangle' | 'rounded' | 'circle' | 'diamond';
  icon?: string;
}

const SHAPE_OPTIONS = [
  { value: 'rectangle', label: 'Rectangle', icon: Square },
  { value: 'rounded', label: 'Rounded', icon: Square },
  { value: 'circle', label: 'Circle', icon: Circle },
  { value: 'diamond', label: 'Diamond', icon: Diamond },
] as const;

const PRESET_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
  '#84cc16', '#f97316', '#6366f1', '#ec4899', '#14b8a6', '#f43f5e',
  '#6b7280', '#1f2937', '#7c3aed', '#0891b2', '#059669', '#dc2626',
];

const CATEGORIES = [
  'Services', 'Databases', 'Infrastructure', 'Security', 'Monitoring',
  'Integration', 'Storage', 'Compute', 'Network', 'Frontend', 'Custom'
];

export function CustomNodeBuilder({ isOpen, onClose, onSave }: CustomNodeBuilderProps) {
  const [formData, setFormData] = useState({
    type: '',
    label: '',
    color: '#3b82f6',
    borderColor: '#1e40af',
    textColor: '#ffffff',
    shape: 'rounded' as 'rectangle' | 'rounded' | 'circle' | 'diamond',
    icon: '',
    description: '',
    category: 'Custom',
  });

  const [iconInput, setIconInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.type.trim()) {
      newErrors.type = 'Type is required';
    } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(formData.type)) {
      newErrors.type = 'Type must start with a letter and contain only letters, numbers, and underscores';
    }

    if (!formData.label.trim()) {
      newErrors.label = 'Label is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSave = useCallback(() => {
    if (!validateForm()) return;

    const template: CustomNodeTemplate = {
      id: `custom-${formData.type}-${Date.now()}`,
      type: formData.type,
      label: formData.label,
      color: formData.color,
      borderColor: formData.borderColor,
      textColor: formData.textColor,
      shape: formData.shape,
      icon: iconInput || undefined,
      description: formData.description,
      category: formData.category,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(template);
    handleReset();
    onClose();
  }, [formData, iconInput, validateForm, onSave, onClose]);

  const handleReset = useCallback(() => {
    setFormData({
      type: '',
      label: '',
      color: '#3b82f6',
      borderColor: '#1e40af',
      textColor: '#ffffff',
      shape: 'rounded',
      icon: '',
      description: '',
      category: 'Custom',
    });
    setIconInput('');
    setErrors({});
  }, []);

  const handleColorChange = useCallback((field: 'color' | 'borderColor' | 'textColor', color: string) => {
    setFormData(prev => ({ ...prev, [field]: color }));

    // Auto-adjust border color when main color changes
    if (field === 'color') {
      // Make border color darker
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      const darkerColor = `#${Math.floor(r * 0.7).toString(16).padStart(2, '0')}${Math.floor(g * 0.7).toString(16).padStart(2, '0')}${Math.floor(b * 0.7).toString(16).padStart(2, '0')}`;
      setFormData(prev => ({ ...prev, borderColor: darkerColor }));
    }
  }, []);

  const NodePreviewComponent = useCallback(({ preview }: { preview: NodePreview }) => {
    const baseClasses = "w-32 h-20 border-2 flex items-center justify-center text-sm font-semibold transition-all";

    let shapeClasses = "";
    switch (preview.shape) {
      case 'circle':
        shapeClasses = "rounded-full w-20 h-20";
        break;
      case 'diamond':
        shapeClasses = "transform rotate-45 w-16 h-16";
        break;
      case 'rounded':
        shapeClasses = "rounded-lg";
        break;
      default:
        shapeClasses = "rounded-none";
    }

    return (
      <div className="flex flex-col items-center space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="text-xs text-gray-500 dark:text-gray-400">Preview</div>
        <div
          className={`${baseClasses} ${shapeClasses} shadow-lg`}
          style={{
            backgroundColor: preview.color,
            borderColor: preview.borderColor,
            color: preview.textColor,
          }}
        >
          <span className={preview.shape === 'diamond' ? 'transform -rotate-45' : ''}>
            {preview.label || 'Node'}
          </span>
        </div>
      </div>
    );
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Plus className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Custom Node Builder
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* Form */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Type (unique identifier) *
                    </label>
                    <input
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                        errors.type ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., custom_service"
                    />
                    {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Label *
                    </label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                        errors.label ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Custom Service"
                    />
                    {errors.label && <p className="text-red-500 text-xs mt-1">{errors.label}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows={3}
                    placeholder="Describe what this node represents..."
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    {CATEGORIES.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Visual Styling */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Visual Styling</h3>

                {/* Shape Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Shape
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {SHAPE_OPTIONS.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, shape: value }))}
                        className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                          formData.shape === value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Background Color
                    </label>
                    <div className="space-y-2">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => handleColorChange('color', e.target.value)}
                        className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <div className="grid grid-cols-6 gap-1">
                        {PRESET_COLORS.map(color => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => handleColorChange('color', color)}
                            className="w-8 h-8 rounded border-2 border-gray-300 hover:border-gray-500 transition-colors"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Border Color
                    </label>
                    <input
                      type="color"
                      value={formData.borderColor}
                      onChange={(e) => handleColorChange('borderColor', e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => handleColorChange('textColor', e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Icon */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Icon (Optional)</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SVG Icon Code
                  </label>
                  <textarea
                    value={iconInput}
                    onChange={(e) => setIconInput(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white font-mono text-sm"
                    rows={4}
                    placeholder='<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">...</svg>'
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste an SVG code here. The icon will be displayed at 24x24 pixels.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-6">
            <NodePreviewComponent preview={formData} />

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <button
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Custom Node
              </button>

              <button
                onClick={handleReset}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Reset Form
              </button>
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 text-sm">
                💡 Tips
              </h4>
              <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                <li>• Use descriptive type names (e.g., &quot;auth_service&quot;)</li>
                <li>• Choose contrasting text colors for readability</li>
                <li>• SVG icons work best with &quot;currentColor&quot; fill</li>
                <li>• Test your node in different themes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}