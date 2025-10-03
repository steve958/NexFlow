"use client";

import { motion } from "framer-motion";
import { useCanvasTheme } from "./CanvasThemeProvider";

export function LoadingSpinner({ message = "Loading..." }: { message?: string }) {
  const { isDark } = useCanvasTheme();

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${
      isDark
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800'
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      <motion.div
        className="relative w-20 h-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className={`absolute inset-0 border-4 rounded-full ${
            isDark ? 'border-blue-900' : 'border-blue-200'
          }`}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`absolute inset-0 border-4 border-r-transparent border-b-transparent border-l-transparent rounded-full ${
            isDark ? 'border-t-blue-400' : 'border-t-blue-600'
          }`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
      <motion.p
        className={`mt-6 font-medium text-lg ${
          isDark ? 'text-blue-200' : 'text-blue-600'
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {message}
      </motion.p>
    </div>
  );
}

export function InlineLoader({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const { isDark } = useCanvasTheme();
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4"
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} border-r-transparent border-b-transparent border-l-transparent rounded-full ${
        isDark ? 'border-t-blue-400' : 'border-t-blue-600'
      }`}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    />
  );
}
