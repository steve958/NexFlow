"use client";
import { ReactNode, useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firestoreClient";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";
import Image from "next/image";
import { useCanvasTheme } from "./CanvasThemeProvider";
import { CanvasThemeToggle } from "./CanvasThemeToggle";
import { ArrowRight, CheckCircle, Layers, Activity, Download } from "lucide-react";

export default function AuthGate({ children }: { children: ReactNode }) {
  const { isDark } = useCanvasTheme();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [mounted]);

  const signInWithGoogle = async () => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  // Show loading during SSR
  if (!mounted || loading) {
    return (
      <div className={`h-screen flex items-center justify-center ${
        isDark
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800'
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        <div className="text-center">
          <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-6 ${
            isDark ? 'border-blue-500' : 'border-indigo-500'
          }`}></div>
          <h2 className={`text-2xl font-semibold mb-3 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Loading NexFlow
          </h2>
          <p className={`text-lg ${
            isDark ? 'text-blue-200' : 'text-blue-600'
          }`}>
            Preparing your workspace...
          </p>
        </div>
      </div>
    );
  }

  // Show sign-in screen if not authenticated
  if (!user) {
    return (
      <div className={`min-h-screen flex flex-col lg:flex-row ${
        isDark
          ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800'
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-20">
          <CanvasThemeToggle />
        </div>

        {/* Left Side - Brand/Visual Section */}
        <div className={`flex-1 relative overflow-hidden flex items-center justify-center p-6 lg:p-12 ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900'
            : 'bg-gradient-to-br from-white via-blue-50 to-indigo-100'
        }`}>
          {/* Background Effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl animate-blob ${
              isDark ? 'bg-blue-400/20' : 'bg-blue-300/30'
            }`}></div>
            <div className={`absolute top-1/3 right-1/4 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000 ${
              isDark ? 'bg-indigo-400/20' : 'bg-indigo-300/30'
            }`}></div>
            <div className={`absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000 ${
              isDark ? 'bg-purple-400/20' : 'bg-purple-300/30'
            }`}></div>
          </div>

          {/* Grid Pattern */}
          <div className={`absolute inset-0 ${
            isDark
              ? 'bg-[url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=")] opacity-20'
              : 'bg-[url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDAsMCwwLDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=")] opacity-30'
          }`}></div>

          {/* Content */}
          <div className="relative z-10 max-w-lg text-center">
            {/* Logo */}
            <div className="mb-8 lg:mb-12">
              <div className="mx-auto w-24 h-24 lg:w-32 lg:h-32 mb-6 lg:mb-8 relative">
                <div className={`absolute inset-0 rounded-3xl blur-2xl ${
                  isDark ? 'bg-blue-500/30' : 'bg-blue-400/40'
                }`}></div>
                <Image
                  src="/logo.png"
                  alt="NexFlow Logo"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain drop-shadow-2xl rounded-3xl relative z-10"
                />
              </div>
              <h1 className={`text-4xl lg:text-6xl font-bold mb-3 lg:mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                NexFlow
              </h1>
              <p className={`text-lg lg:text-xl ${
                isDark ? 'text-blue-200' : 'text-blue-600'
              }`}>
                Professional Architecture Diagrams
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 lg:space-y-6 mb-8 lg:mb-12 hidden md:block">
              <div className="flex items-center text-left">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                  isDark
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg'
                    : 'bg-gradient-to-r from-blue-400 to-indigo-500 shadow-md'
                }`}>
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    30+ Professional Templates
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-blue-200' : 'text-gray-600'
                  }`}>
                    Service, database, cloud, and network components
                  </p>
                </div>
              </div>

              <div className="flex items-center text-left">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                  isDark
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg'
                    : 'bg-gradient-to-r from-indigo-400 to-purple-500 shadow-md'
                }`}>
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Traffic Flow Animation
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-blue-200' : 'text-gray-600'
                  }`}>
                    Visualize load balancing and traffic patterns
                  </p>
                </div>
              </div>

              <div className="flex items-center text-left">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                  isDark
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 shadow-lg'
                    : 'bg-gradient-to-r from-purple-400 to-pink-500 shadow-md'
                }`}>
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Multiple Export Formats
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-blue-200' : 'text-gray-600'
                  }`}>
                    PNG, SVG, PDF - perfect for presentations
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom tagline */}
            <p className={`text-lg font-medium ${
              isDark ? 'text-blue-300' : 'text-blue-700'
            }`}>
              Trusted by developers worldwide
            </p>
          </div>
        </div>

        {/* Right Side - Login Form Section */}
        <div className={`flex-1 flex items-center justify-center p-6 lg:p-12 ${
          isDark
            ? 'bg-gradient-to-br from-gray-800 to-slate-800'
            : 'bg-white'
        }`}>
          <div className="w-full max-w-md">
            {/* Login Card */}
            <div className={`p-8 rounded-3xl shadow-2xl border ${
              isDark
                ? 'bg-gray-900/80 border-gray-700 backdrop-blur-xl'
                : 'bg-white border-gray-200 shadow-blue-100/50'
            }`}>
              {/* Header */}
              <div className="text-center mb-8">
                <h2 className={`text-3xl font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Welcome back
                </h2>
                <p className={`text-lg ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Sign in to your workspace
                </p>
              </div>

              {/* Google Sign-in Button */}
              <button
                onClick={signInWithGoogle}
                className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-3 group shadow-lg transform hover:scale-[1.02] hover:-translate-y-0.5 ${
                  isDark
                    ? 'bg-white text-gray-900 hover:bg-gray-100 hover:shadow-xl'
                    : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-2xl'
                }`}
              >
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </button>

              {/* Security Note */}
              <div className={`mt-8 text-center p-4 rounded-xl ${
                isDark
                  ? 'bg-blue-900/30 border border-blue-700/50'
                  : 'bg-blue-50 border border-blue-200'
              }`}>
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className={`w-5 h-5 mr-2 ${
                    isDark ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-blue-300' : 'text-blue-800'
                  }`}>
                    Secure Authentication
                  </span>
                </div>
                <p className={`text-xs ${
                  isDark ? 'text-blue-200' : 'text-blue-600'
                }`}>
                  Your data is protected with enterprise-grade security
                </p>
              </div>

              {/* Terms */}
              <div className="mt-8 text-center">
                <p className={`text-xs ${
                  isDark ? 'text-gray-500' : 'text-gray-500'
                }`}>
                  By signing in, you agree to our{' '}
                  <a href="#" className={`underline transition-colors ${
                    isDark
                      ? 'text-blue-400 hover:text-blue-300'
                      : 'text-blue-600 hover:text-blue-800'
                  }`}>
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="#" className={`underline transition-colors ${
                    isDark
                      ? 'text-blue-400 hover:text-blue-300'
                      : 'text-blue-600 hover:text-blue-800'
                  }`}>
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}
