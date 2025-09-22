"use client";
import { ReactNode, useEffect, useState } from "react";
import { getFirebaseAuth } from "@/lib/firestoreClient";
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { Star, Users, Zap, ArrowRight, Github } from "lucide-react";
import Image from "next/image";
import { ThemeToggleCompact } from "./ThemeToggle";

export default function AuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<null | { uid: string; email?: string }>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [firebaseError, setFirebaseError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const auth = getFirebaseAuth();
    if (!auth) {
      setFirebaseError(true);
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, (u) => {
      console.log("Auth state changed:", u ? `User: ${u.email}` : "No user");
      setUser(u ? { uid: u.uid, email: u.email ?? undefined } : null);
      setLoading(false);
      setIsSigningIn(false);
    });
  }, [mounted]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      const auth = getFirebaseAuth();
      if (!auth) {
        throw new Error("Firebase not initialized");
      }
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error("Sign in failed:", error);
      setIsSigningIn(false);
    }
  };

  // Show loading during SSR and initial mount
  if (!mounted || loading) {
    return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Loading NexFlow</h2>
          <p className="text-gray-600 dark:text-gray-300">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  // Show Firebase configuration error
  if (firebaseError) {
    return (
      <div className="h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Configuration Error</h2>
          <p className="text-gray-600 mb-4">
            Firebase configuration is missing. Please check that environment variables are properly set in your deployment.
          </p>
          <div className="text-sm text-gray-500 bg-gray-100 rounded-lg p-3">
            <p className="font-medium mb-2">Required environment variables:</p>
            <ul className="text-left space-y-1">
              <li>• NEXT_PUBLIC_FB_API_KEY</li>
              <li>• NEXT_PUBLIC_FB_AUTH_DOMAIN</li>
              <li>• NEXT_PUBLIC_FB_PROJECT_ID</li>
              <li>• NEXT_PUBLIC_FB_APP_ID</li>
              <li>• NEXT_PUBLIC_FB_DATABASE_URL</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16">
                  <Image
                    src="/logo.png"
                    alt="NexFlow Logo"
                    width={64}
                    height={64}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">NexFlow</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Architecture Visualization Platform</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-sm font-medium">Features</a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-sm font-medium">Pricing</a>
                <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-sm font-medium">
                  <Github className="w-4 h-4" />
                  GitHub
                </button>
                <ThemeToggleCompact />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Hero Content */}
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Design system architecture with{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    visual clarity
                  </span>
                </h2>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Create beautiful, interactive diagrams that bring your system architecture to life.
                  Collaborate in real-time and export to any format.
                </p>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Real-time Collaboration</h3>
                    <p className="text-sm text-gray-600">Work together with live cursors and presence indicators</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Interactive Animations</h3>
                    <p className="text-sm text-gray-600">Visualize data flow with animated packet streams</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Team Workspaces</h3>
                    <p className="text-sm text-gray-600">Organize projects and share with your team</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Rich Templates</h3>
                    <p className="text-sm text-gray-600">Start fast with pre-built architecture patterns</p>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500 mb-4">Trusted by teams at</p>
                <div className="flex items-center gap-8 opacity-60">
                  <div className="text-gray-400 font-semibold">Microsoft</div>
                  <div className="text-gray-400 font-semibold">Google</div>
                  <div className="text-gray-400 font-semibold">Netflix</div>
                  <div className="text-gray-400 font-semibold">Spotify</div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Card */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                  <div className="text-center mb-8">
                    <div className="w-24 h-24 mx-auto mb-4">
                      <Image
                        src="/logo.png"
                        alt="NexFlow Logo"
                        width={96}
                        height={96}
                        className="w-full h-full object-contain rounded-2xl"
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Welcome to NexFlow</h3>
                    <p className="text-gray-600">Sign in to start creating amazing diagrams</p>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={handleGoogleSignIn}
                      disabled={isSigningIn}
                      className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 rounded-xl px-6 py-4 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                      {isSigningIn ? (
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                          </svg>
                          <span className="text-gray-700 font-medium">
                            {isSigningIn ? "Signing in..." : "Continue with Google"}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                        </>
                      )}
                    </button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">or</span>
                      </div>
                    </div>

                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-3 bg-gray-100 border-2 border-gray-200 rounded-xl px-6 py-4 cursor-not-allowed"
                    >
                      <span className="text-gray-500 font-medium">Email sign-in (Coming soon)</span>
                    </button>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                    <p className="text-xs text-gray-500">
                      By signing in, you agree to our{" "}
                      <a href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</a>
                      {" "}and{" "}
                      <a href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
                    </p>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-6 text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>256-bit SSL encryption</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>GDPR compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white mt-24">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#" className="hover:text-gray-900">Features</a></li>
                  <li><a href="#" className="hover:text-gray-900">Templates</a></li>
                  <li><a href="#" className="hover:text-gray-900">Integrations</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#" className="hover:text-gray-900">About</a></li>
                  <li><a href="#" className="hover:text-gray-900">Blog</a></li>
                  <li><a href="#" className="hover:text-gray-900">Careers</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#" className="hover:text-gray-900">Help Center</a></li>
                  <li><a href="#" className="hover:text-gray-900">Contact</a></li>
                  <li><a href="#" className="hover:text-gray-900">Status</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#" className="hover:text-gray-900">Privacy</a></li>
                  <li><a href="#" className="hover:text-gray-900">Terms</a></li>
                  <li><a href="#" className="hover:text-gray-900">Security</a></li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
              © 2024 NexFlow. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    );
  }
  return <>{children}</>;
}
