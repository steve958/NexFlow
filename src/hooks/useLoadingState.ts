"use client";

import { useState, useCallback } from "react";

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  message: string;
}

export function useLoadingState(initialMessage = "Loading...") {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    message: initialMessage,
  });

  const startLoading = useCallback((message?: string) => {
    setState({
      isLoading: true,
      error: null,
      message: message || initialMessage,
    });
  }, [initialMessage]);

  const stopLoading = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isLoading: false,
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setState({
      isLoading: false,
      error,
      message: "",
    });
  }, []);

  const setMessage = useCallback((message: string) => {
    setState((prev) => ({
      ...prev,
      message,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      message: initialMessage,
    });
  }, [initialMessage]);

  return {
    ...state,
    startLoading,
    stopLoading,
    setError,
    setMessage,
    reset,
  };
}
