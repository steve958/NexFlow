"use client";
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Video, Square, Download, Film, GripVertical } from 'lucide-react';
import { useVideoRecorder, VideoRecordingOptions } from '@/hooks/useVideoRecorder';

interface VideoExportPanelProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isVisible: boolean;
  onClose: () => void;
  onRecordingStop?: () => void; // Optional callback to trigger canvas refresh
}

export function VideoExportPanel({
  canvasRef,
  isVisible,
  onClose,
  onRecordingStop
}: VideoExportPanelProps) {
  const videoRecorder = useVideoRecorder();

  const [recordingOptions, setRecordingOptions] = useState<VideoRecordingOptions>({
    width: 1920, // Not used - will record at actual canvas size
    height: 1080, // Not used - will record at actual canvas size
    frameRate: 30,
    videoBitsPerSecond: 2500000,
    mimeType: 'video/mp4'
  });

  const [filename, setFilename] = useState('');

  // Dragging functionality
  const panelRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState(() => {
    // Start in top-right corner, accounting for panel width
    if (typeof window !== 'undefined') {
      return { x: window.innerWidth - 320 - 16, y: 16 }; // 320px panel width + 16px margin
    }
    return { x: 16, y: 16 }; // Fallback for SSR
  });

  const handleStartRecording = useCallback(() => {
    if (!canvasRef.current) {
      console.error('Canvas not available');
      return;
    }

    if (!videoRecorder.isMediaRecorderSupported()) {
      alert('Video recording is not supported in this browser');
      return;
    }

    console.log('Starting simple canvas recording...');
    videoRecorder.startRecording(canvasRef.current, recordingOptions);
  }, [canvasRef, videoRecorder, recordingOptions]);

  const handleStopRecording = useCallback(() => {
    console.log('Stopping recording...');
    videoRecorder.stopRecording();
    // Trigger canvas refresh callback if provided
    if (onRecordingStop) {
      // Use a small delay to ensure recording cleanup is complete
      setTimeout(onRecordingStop, 100);
    }
  }, [videoRecorder, onRecordingStop]);

  const handleDownload = useCallback(() => {
    const downloadFilename = filename || `nexflow-recording-${Date.now()}.mp4`;
    videoRecorder.downloadRecording(downloadFilename);
  }, [videoRecorder, filename]);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!panelRef.current) return;

    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    // Keep panel within viewport bounds
    const maxX = window.innerWidth - 320; // 320px is panel width (w-80)
    const maxY = window.innerHeight - 200; // Estimated panel height

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add/remove global mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!isVisible) return null;

  const isRecording = videoRecorder.isRecording;
  const hasRecording = !!videoRecorder.recordedBlob;
  const hasError = !!videoRecorder.error;

  return (
    <div
      ref={panelRef}
      className="fixed w-80 z-50 select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        right: 'auto' // Override the right positioning
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 cursor-move"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2">
            <GripVertical className="w-3 h-3 text-gray-400" />
            <Video className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Record Canvas
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-lg leading-none cursor-pointer"
            disabled={isRecording}
            onMouseDown={(e) => e.stopPropagation()} // Prevent dragging when clicking close
          >
            ×
          </button>
        </div>

        <div className="p-3" onMouseDown={(e) => e.stopPropagation()}>
          {/* Recording Status */}
          {isRecording && (
            <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-red-800 dark:text-red-200">
                    Recording • {videoRecorder.formattedDuration}
                  </p>
                </div>
                <button
                  onClick={handleStopRecording}
                  className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                >
                  <Square className="w-3 h-3" />
                  Stop
                </button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {hasError && (
            <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <p className="text-red-800 dark:text-red-200 text-xs">
                Error: {videoRecorder.error}
              </p>
            </div>
          )}

          {/* Success Display */}
          {hasRecording && !isRecording && !hasError && (
            <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <p className="text-xs font-medium text-green-800 dark:text-green-200">
                    Complete • {videoRecorder.formattedDuration}
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!isRecording && !hasRecording && (
            <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
              <p className="text-blue-800 dark:text-blue-200 text-xs">
                Start animations, then click record to capture canvas in real-time at current viewport size.
              </p>
            </div>
          )}

          {/* Settings */}
          {!isRecording && !hasRecording && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Frame Rate
                  </label>
                  <select
                    value={recordingOptions.frameRate}
                    onChange={(e) => setRecordingOptions(prev => ({ ...prev, frameRate: Number(e.target.value) }))}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700"
                  >
                    <option value={30}>30 FPS</option>
                    <option value={60}>60 FPS</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Quality
                  </label>
                  <select
                    value={recordingOptions.videoBitsPerSecond}
                    onChange={(e) => setRecordingOptions(prev => ({ ...prev, videoBitsPerSecond: Number(e.target.value) }))}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700"
                  >
                    <option value={1500000}>Low (1.5 Mbps)</option>
                    <option value={2500000}>Medium (2.5 Mbps)</option>
                    <option value={5000000}>High (5 Mbps)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Filename (optional)
                </label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  placeholder="nexflow-recording"
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-xs bg-white dark:bg-gray-700"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-3" onMouseDown={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            {!isRecording && !hasRecording && (
              <button
                onClick={handleStartRecording}
                disabled={!canvasRef?.current}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Film className="w-3 h-3" />
                Start Recording
              </button>
            )}
            <button
              onClick={onClose}
              className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
              disabled={isRecording}
            >
              {isRecording ? 'Recording...' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}