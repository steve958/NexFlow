"use client";
import { useCallback, useRef, useState } from 'react';

export interface VideoRecordingOptions {
  width: number;
  height: number;
  frameRate: number;
  videoBitsPerSecond: number;
  mimeType: string;
}

export interface VideoRecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  error: string | null;
  recordedBlob: Blob | null;
}

const DEFAULT_OPTIONS: VideoRecordingOptions = {
  width: 1920,
  height: 1080,
  frameRate: 60,
  videoBitsPerSecond: 5000000, // 5 Mbps
  mimeType: 'video/mp4' // Default to MP4 for better compatibility
};

export function useVideoRecorder() {
  const [recordingState, setRecordingState] = useState<VideoRecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    error: null,
    recordedBlob: null
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get supported MIME types for video recording - prioritize MP4 for compatibility
  const getSupportedMimeType = useCallback((): string => {
    const mimeTypes = [
      'video/mp4;codecs=h264',
      'video/mp4',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm'
    ];

    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        console.log('Using MIME type:', mimeType);
        return mimeType;
      }
    }

    console.warn('No supported MIME type found, using fallback');
    return 'video/mp4';
  }, []);

  // Create canvas stream for recording
  const createCanvasStream = useCallback((
    canvas: HTMLCanvasElement,
    options: Partial<VideoRecordingOptions> = {}
  ): MediaStream | null => {
    if (!canvas) {
      console.error('Canvas element is required for video recording');
      return null;
    }

    const recordingOptions = { ...DEFAULT_OPTIONS, ...options };

    try {
      // Get current canvas dimensions (DO NOT MODIFY THEM)
      const canvasRect = canvas.getBoundingClientRect();

      console.log('Recording canvas at current dimensions:', {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        displayWidth: canvasRect.width,
        displayHeight: canvasRect.height,
        requestedWidth: recordingOptions.width,
        requestedHeight: recordingOptions.height
      });

      // Create stream from canvas at its current size
      const stream = canvas.captureStream(recordingOptions.frameRate);

      if (!stream) {
        throw new Error('Failed to capture canvas stream');
      }

      console.log('Canvas stream created successfully:', {
        tracks: stream.getTracks().length,
        frameRate: recordingOptions.frameRate,
        actualCanvasSize: { width: canvas.width, height: canvas.height }
      });

      return stream;
    } catch (error) {
      console.error('Error creating canvas stream:', error);
      setRecordingState(prev => ({
        ...prev,
        error: `Failed to create canvas stream: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
      return null;
    }
  }, []);

  // Start recording
  const startRecording = useCallback((
    canvas: HTMLCanvasElement,
    options: Partial<VideoRecordingOptions> = {}
  ) => {
    if (recordingState.isRecording) {
      console.warn('Recording already in progress');
      return;
    }

    console.log('Starting video recording...');

    const recordingOptions = { ...DEFAULT_OPTIONS, ...options };
    recordingOptions.mimeType = getSupportedMimeType();

    // Create canvas stream
    const stream = createCanvasStream(canvas, recordingOptions);
    if (!stream) {
      return;
    }

    try {
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: recordingOptions.mimeType,
        videoBitsPerSecond: recordingOptions.videoBitsPerSecond
      });

      // Reset chunks
      chunksRef.current = [];

      // Set up event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log('Data chunk received:', event.data.size, 'bytes');
        }
      };

      mediaRecorder.onstop = () => {
        console.log('Recording stopped, creating blob...');
        const recordedBlob = new Blob(chunksRef.current, {
          type: recordingOptions.mimeType
        });

        console.log('Recording completed:', {
          size: recordedBlob.size,
          type: recordedBlob.type,
          chunks: chunksRef.current.length
        });

        setRecordingState(prev => ({
          ...prev,
          isRecording: false,
          recordedBlob,
          error: null
        }));

        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        const error = event instanceof ErrorEvent ? event.message : 'Recording failed';
        setRecordingState(prev => ({
          ...prev,
          error,
          isRecording: false
        }));
      };

      mediaRecorder.onstart = () => {
        console.log('Recording started successfully');
        startTimeRef.current = Date.now();

        // Start duration tracking
        durationIntervalRef.current = setInterval(() => {
          setRecordingState(prev => ({
            ...prev,
            duration: Math.floor((Date.now() - startTimeRef.current) / 1000)
          }));
        }, 1000);
      };

      mediaRecorder.onpause = () => {
        console.log('Recording paused');
        setRecordingState(prev => ({ ...prev, isPaused: true }));
      };

      mediaRecorder.onresume = () => {
        console.log('Recording resumed');
        setRecordingState(prev => ({ ...prev, isPaused: false }));
      };

      // Store references
      mediaRecorderRef.current = mediaRecorder;
      streamRef.current = stream;

      // Start recording
      mediaRecorder.start(1000); // Collect data every second

      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
        duration: 0,
        error: null,
        recordedBlob: null
      }));

    } catch (error) {
      console.error('Error starting recording:', error);
      setRecordingState(prev => ({
        ...prev,
        error: `Failed to start recording: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));

      // Clean up stream if recorder failed
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [recordingState.isRecording, getSupportedMimeType, createCanvasStream]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (!recordingState.isRecording || !mediaRecorderRef.current) {
      console.warn('No active recording to stop');
      return;
    }

    console.log('Stopping recording...');

    try {
      mediaRecorderRef.current.stop();

      // Clear duration interval
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      setRecordingState(prev => ({
        ...prev,
        error: `Failed to stop recording: ${error instanceof Error ? error.message : 'Unknown error'}`
      }));
    }
  }, [recordingState.isRecording]);

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (!recordingState.isRecording || !mediaRecorderRef.current) {
      console.warn('No active recording to pause');
      return;
    }

    if (recordingState.isPaused) {
      console.log('Resuming recording...');
      mediaRecorderRef.current.resume();
    } else {
      console.log('Pausing recording...');
      mediaRecorderRef.current.pause();
    }
  }, [recordingState.isRecording, recordingState.isPaused]);

  // Download recorded video
  const downloadRecording = useCallback((filename?: string) => {
    if (!recordingState.recordedBlob) {
      console.warn('No recorded video to download');
      return;
    }

    const url = URL.createObjectURL(recordingState.recordedBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `nexflow-animation-${Date.now()}.mp4`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up URL
    URL.revokeObjectURL(url);

    console.log('Video download initiated:', link.download);
  }, [recordingState.recordedBlob]);

  // Reset recording state
  const resetRecording = useCallback(() => {
    if (recordingState.isRecording) {
      stopRecording();
    }

    setRecordingState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      error: null,
      recordedBlob: null
    });

    // Clean up references
    mediaRecorderRef.current = null;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    chunksRef.current = [];

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    console.log('Recording state reset');
  }, [recordingState.isRecording, stopRecording]);

  // Check MediaRecorder support
  const isMediaRecorderSupported = useCallback((): boolean => {
    return typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function';
  }, []);

  // Format duration for display
  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    ...recordingState,
    formattedDuration: formatDuration(recordingState.duration),

    // Methods
    startRecording,
    stopRecording,
    pauseRecording,
    downloadRecording,
    resetRecording,

    // Utilities
    isMediaRecorderSupported,
    getSupportedMimeType
  };
}