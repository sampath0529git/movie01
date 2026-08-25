"use client";
import { X, ArrowRight, ChevronDown } from "lucide-react";
import React, { useState, useEffect } from "react";
import { saveFormSubmission, auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from "firebase/auth";

interface LoginModalProps {
  onClose: () => void;
}

export default function LoginModal({ onClose }: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    // Simulate Turnstile verification
    const timer = setTimeout(() => {
      setIsVerified(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onClose();
    } catch (error) {
      console.error("Google Sign-In Error", error);
      if ((typeof window !== 'undefined' ? window.self : null) !== (typeof window !== 'undefined' ? window.top : null)) {
        alert(
          'Login failed. Because you are viewing this app inside the AI Studio editor iframe, popups might be blocked. Please click the "Open in new tab" icon (top right arrow) to open the app in a real tab and try logging in again.',
        );
      } else {
        alert(
          "Failed to sign in with Google. Ensure Google Sign-In is enabled in your Firebase console.",
        );
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !isVerified) return;

    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, usernameOrEmail);
      alert("Password reset email sent! Check your inbox.");
      setMode("login");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to send reset email");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "forgot") {
      return handleResetPassword(e);
    }
    if (!usernameOrEmail.trim() || !isVerified) return;

    setIsSubmitting(true);
    try {
      if (mode === "register") {
        const userCredential = await createUserWithEmailAndPassword(auth, usernameOrEmail, password);
        if (displayName.trim()) {
           await updateProfile(userCredential.user, { displayName });
        }
        alert("Registration successful!");
      } else {
        await signInWithEmailAndPassword(auth, usernameOrEmail, password);
        // Also save form submission for tracking if needed
        await saveFormSubmission(usernameOrEmail).catch(console.error);
        alert("Login successful!");
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to authenticate");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1f2128] w-full max-w-md rounded-xl overflow-hidden shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 mt-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Tabs */}
          <div className="flex justify-center gap-6 mb-8 border-b border-[#2a2d36]">
            <button 
              onClick={() => setMode("login")}
              className={`font-semibold pb-3 border-b-2 px-2 transition-colors ${mode === "login" || mode === "forgot" ? "text-white border-white" : "text-gray-400 border-transparent hover:text-[#eeeeee]"}`}
            >
              Login
            </button>
            <button 
              onClick={() => setMode("register")}
              className={`font-semibold pb-3 border-b-2 px-2 transition-colors ${mode === "register" ? "text-white border-white" : "text-gray-400 border-transparent hover:text-[#eeeeee]"}`}
            >
              Register
            </button>
          </div>

          {mode !== "forgot" && (
            <>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 bg-[#2a2d36] hover:bg-[#343844] text-white rounded-md py-3 font-medium transition-colors border border-white/5"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign In with Google
              </button>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-[#2a2d36]"></div>
                <span className="text-[#646875] text-xs font-semibold">OR</span>
                <div className="flex-1 h-px bg-[#2a2d36]"></div>
              </div>
            </>
          )}

          <div className="bg-[#2a2d36] rounded p-4 mb-6 flex items-center justify-between border border-[#3a3d46]">
            <div className="flex items-center gap-3">
              {isVerified ? (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-green-500 flex items-center justify-center bg-green-500/20">
                    <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-white">Success!</span>
                </>
              ) : (
                <>
                  <div className="w-5 h-5 rounded-full border-2 border-dashed border-brand-500 animate-spin"></div>
                  <span className="text-sm text-gray-300">Verifying...</span>
                </>
              )}
            </div>
            <div className="text-right">
              <div className="flex justify-end mb-1">
                {/* Cloudflare logo mock */}
                <svg viewBox="0 0 100 30" width="60" height="15" fill="#f38020">
                  <path d="M30 15a10 10 0 0110-10 12 12 0 0122 8 8 8 0 010 16H30a8 8 0 010-14z" />
                </svg>
              </div>
              <div className="text-[9px] text-gray-400">
                <a href="#" className="hover:underline hover:text-white">
                  Privacy
                </a>{" "}
                •{" "}
                <a href="#" className="hover:underline hover:text-white">
                  Help
                </a>
              </div>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === "register" && (
              <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-[#16181d] border border-[#2a2d36] rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-brand-600 transition-colors"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                {mode === "register" || mode === "forgot" ? "E-mail" : "Username or E-mail"}
              </label>
              <input
                type={mode === "register" || mode === "forgot" ? "email" : "text"}
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                className="w-full bg-[#16181d] border border-[#2a2d36] rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-brand-600 transition-colors"
                required
              />
            </div>

            {mode !== "forgot" && (
              <div>
                <label className="block text-sm text-gray-400 mb-1.5 font-medium">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#16181d] border border-[#2a2d36] rounded-md px-4 py-2.5 text-white focus:outline-none focus:border-brand-600 transition-colors"
                  minLength={mode === "register" ? 6 : undefined}
                  required
                />
              </div>
            )}

            {mode === "forgot" && (
              <div className="text-sm text-gray-400 mt-2">
                Enter your email address and we'll send you a link to reset your password.
              </div>
            )}

            {mode === "login" && (
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-[#2a2d36] bg-[#16181d] text-brand-600 focus:ring-brand-600"
                  />
                  <span className="text-sm text-gray-400">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-sm text-brand-500 hover:text-brand-400 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-[#2a2d36] hover:bg-[#343844] text-white font-semibold py-3 rounded-md transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isVerified}
                className="flex-1 bg-brand-700 hover:bg-brand-600 text-white font-semibold py-3 rounded-md transition-colors flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isSubmitting ? (mode === "login" ? "Signing in..." : mode === "forgot" ? "Sending..." : "Registering...") : (mode === "login" ? "Sign in" : mode === "forgot" ? "Reset Password" : "Register")}
                {!isSubmitting && (
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Scrollbar mock to match image exactly */}
      <div className="fixed right-0 top-0 bottom-0 w-4 bg-[#e5e5e5] border-l border-[#d4d4d4] flex flex-col justify-between items-center z-50">
        <div className="w-full h-4 bg-gray-300 flex items-center justify-center text-gray-600 cursor-pointer hover:bg-gray-400">
          <ChevronDown className="w-3 h-3 rotate-180" />
        </div>
        <div className="w-2 h-32 bg-[#a3a3a3] rounded-full my-1 hover:bg-[#888] cursor-pointer"></div>
        <div className="flex-grow"></div>
        <div className="w-full h-4 bg-gray-300 flex items-center justify-center text-gray-600 cursor-pointer hover:bg-gray-400">
          <ChevronDown className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}
