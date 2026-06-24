import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  auth, 
  googleProvider,
  db,
  handleFirestoreError,
  OperationType,
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  sendPasswordResetEmail, 
  updateProfile,
  sendEmailVerification,
  doc, 
  setDoc, 
  serverTimestamp, 
  getDoc
} from "../lib/firebase";
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  Chrome, 
  Sparkles,
  ArrowRight
} from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup";
  onSuccess?: () => void;
  restrictedToolName?: string | null; // Pass this if restricted access triggered it!
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  initialMode = "login", 
  onSuccess,
  restrictedToolName 
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // States for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Strength and Validation state
  const [pwdStrength, setPwdStrength] = useState<"Weak" | "Medium" | "Strong" | "Very Strong">("Weak");
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string; form?: string }>({});
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrors({});
      setSuccessMsg("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFullName("");
      setTermsAccepted(false);
    }
  }, [isOpen, initialMode]);

  // Compute Password Strength
  useEffect(() => {
    if (!password) {
      setPwdStrength("Weak");
      return;
    }
    let pts = 0;
    if (password.length >= 8) pts++;
    if (/[A-Z]/.test(password)) pts++;
    if (/[0-9]/.test(password)) pts++;
    if (/[^A-Za-z0-9]/.test(password)) pts++;

    if (pts <= 1) setPwdStrength("Weak");
    else if (pts === 2) setPwdStrength("Medium");
    else if (pts === 3) setPwdStrength("Strong");
    else setPwdStrength("Very Strong");
  }, [password]);

  // Toast Helper
  const triggerToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    if (typeof (window as any).showToast === "function") {
      (window as any).showToast(msg, type);
    }
  };

  // Real-time validations
  const validateEmail = (val: string) => {
    if (!val) return "Email is required";
    const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!reg.test(val)) return "Invalid email address";
    return "";
  };

  const validatePassword = (val: string) => {
    if (val.length < 6) return "Password must be at least 6 characters";
    return "";
  };

  const handleOAuthGoogle = async () => {
    setLoading(true);
    setErrors({});
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      // Store user profile details in Firestore if not already present
      const userProfileRef = doc(db, "users", user.uid);
      try {
        const userDoc = await getDoc(userProfileRef);
        if (!userDoc.exists()) {
          await setDoc(userProfileRef, {
            uid: user.uid,
            fullName: user.displayName || "Google User",
            email: user.email || "",
            createdAt: serverTimestamp()
          });
        }
      } catch (dbErr: any) {
        handleFirestoreError(dbErr, OperationType.WRITE, `users/${user.uid}`);
      }

      setSuccessMsg("Logged in with Google successfully!");
      triggerToast("Logged in with Google successfully!", "success");
      
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      let msg = err.message || "Failed to sign in with Google";
      if (err.code === "auth/operation-not-allowed") {
        msg = "Google Sign-in is not enabled in your Firebase project. To use Google login, please go to your Firebase Console -> Authentication -> Sign-in Method, and enable the 'Google' provider.";
      } else if (err.code === "auth/network-request-failed") {
        msg = "A network error occurred. Please check your internet connection.";
      }
      setErrors({ form: msg });
      triggerToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const mailError = validateEmail(email);
    if (mailError) {
      setErrors({ email: mailError });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await sendPasswordResetEmail(auth, email);
      const successFeedback = "Password reset email sent! Please check your inbox.";
      setSuccessMsg(successFeedback);
      triggerToast(successFeedback, "success");
      
      setTimeout(() => {
        setMode("login");
        setSuccessMsg("");
      }, 3000);
    } catch (err: any) {
      console.error(err);
      let msg = "Could not trigger reset email. Please try again.";
      if (err.code === "auth/user-not-found") {
        msg = "No registered account found with this email.";
      } else if (err.code === "auth/invalid-email") {
        msg = "The email address is badly formatted.";
      }
      setErrors({ form: msg });
      triggerToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg("");

    const mailErr = validateEmail(email);
    if (mailErr) {
      setErrors({ email: mailErr });
      return;
    }

    if (mode === "signup") {
      if (!fullName.trim()) {
        setErrors({ form: "Please enter your full name" });
        return;
      }
      const pwdErr = validatePassword(password);
      if (pwdErr) {
        setErrors({ password: pwdErr });
        return;
      }
      if (password !== confirmPassword) {
        setErrors({ confirm: "Passwords do not match!" });
        return;
      }
      if (!termsAccepted) {
        setErrors({ form: "Please accept the Terms & Conditions" });
        return;
      }

      setLoading(true);
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save customized name into Firebase Auth profile
        await updateProfile(user, {
          displayName: fullName.trim()
        });

        // Save detailed user record entry into FireStore "users" collection
        const userProfileRef = doc(db, "users", user.uid);
        try {
          await setDoc(userProfileRef, {
            uid: user.uid,
            fullName: fullName.trim(),
            email: email.trim(),
            createdAt: serverTimestamp()
          });
        } catch (dbErr: any) {
          handleFirestoreError(dbErr, OperationType.CREATE, `users/${user.uid}`);
        }

        // Send confirmation email verification instantly
        try {
          await sendEmailVerification(user);
          triggerToast("A verification email has been sent to your address!", "info");
        } catch (verifErr: any) {
          console.warn("Could not dispatch email verification request automatically", verifErr);
        }

        const registrationSuccessFeedback = "Registration completed! Verification email dispatched.";
        setSuccessMsg(registrationSuccessFeedback);
        triggerToast(registrationSuccessFeedback, "success");

        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1500);
      } catch (err: any) {
        console.error(err);
        let msg = "Failed to create account. Email might already be registered.";
        if (err.code === "auth/email-already-in-use") {
          msg = "This email address is already in use.";
        } else if (err.code === "auth/weak-password") {
          msg = "The password is too weak. Choose a stronger password.";
        } else if (err.code === "auth/invalid-email") {
          msg = "The email address is badly formatted.";
        } else if (err.code === "auth/operation-not-allowed") {
          msg = "Email/Password sign-up is not enabled in your Firebase console. Go to Firebase Console -> Authentication -> Sign-in method, and toggle 'Email/Password' to Enabled.";
        } else if (err.code === "auth/network-request-failed") {
          msg = "Network latency detected. Check your internet connectivity.";
        }
        setErrors({ form: msg });
        triggerToast(msg, "error");
      } finally {
        setLoading(false);
      }
    } else {
      // Login
      const pwdErr = validatePassword(password);
      if (pwdErr) {
        setErrors({ password: pwdErr });
        return;
      }

      setLoading(true);
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
          triggerToast("Your email remains unverified. Please confirm your registration link in your inbox.", "info");
        }

        // Try restoring profile info inside Firestore if missing
        try {
          const userProfileRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userProfileRef);
          if (!userDoc.exists()) {
            await setDoc(userProfileRef, {
              uid: user.uid,
              fullName: user.displayName || fullName.trim() || "Active User",
              email: user.email || email.trim(),
              createdAt: serverTimestamp()
            });
          }
        } catch (profileRestoreErr) {
          console.warn("Could not maintain profile state during login: ", profileRestoreErr);
        }

        const loginSuccessFeedback = "Login Successful! Preparing your dashboard.";
        setSuccessMsg(loginSuccessFeedback);
        triggerToast(loginSuccessFeedback, "success");

        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 1200);
      } catch (err: any) {
        console.error(err);
        let msg = "Invalid email or password combination.";
        if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential" || err.code === "auth/invalid-password") {
          msg = "Incorrect credentials. Please verify your email and password.";
        } else if (err.code === "auth/operation-not-allowed") {
          msg = "Email/Password sign-in is not enabled in your Firebase project. Go to Firebase Console -> Authentication -> Sign-in method, and toggle 'Email/Password' to Enabled.";
        } else if (err.code === "auth/network-request-failed") {
          msg = "A network error occurred. Please verify your internet connection.";
        }
        setErrors({ form: msg });
        triggerToast(msg, "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const getStrengthBarColor = () => {
    switch (pwdStrength) {
      case "Weak": return "bg-rose-500";
      case "Medium": return "bg-amber-500";
      case "Strong": return "bg-indigo-500";
      case "Very Strong": return "bg-emerald-500";
    }
  };

  const getStrengthProgress = () => {
    switch (pwdStrength) {
      case "Weak": return "w-1/4";
      case "Medium": return "w-2/4";
      case "Strong": return "w-3/4";
      case "Very Strong": return "w-full";
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Card body */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-6 md:p-8 text-slate-100 overflow-y-auto max-h-[90vh]"
        >
          {/* Header color accent lines */}
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full transition-colors hover:bg-white/[0.05]"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Access Restricted Header */}
          {restrictedToolName && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex gap-3 text-red-200">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-red-400">Access Restricted</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Please Sign Up or Login to access our <strong>{restrictedToolName}</strong> and save your activity history globally in your profile database.
                </p>
              </div>
            </div>
          )}

          {/* Top Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ToolVerse SaaS Guard</span>
            </div>
            
            <h3 className="font-display text-2xl md:text-3xl font-extrabold text-white">
              {mode === "login" && "Welcome Back"}
              {mode === "signup" && "Create Your Account"}
              {mode === "forgot" && "Reset Password"}
            </h3>
            <p className="text-slate-400 text-sm mt-1.5">
              {mode === "login" && "Enter your credentials to manage your smart productivity tools."}
              {mode === "signup" && "Join millions of creators optimizing calculations globally today."}
              {mode === "forgot" && "Provide your email address to deploy a custom reset authorization."}
            </p>
          </div>

          {/* Notification Messages */}
          {successMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2"
            >
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {errors.form && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mb-4 border text-xs px-4 py-3 rounded-xl flex flex-col gap-2 ${
                errors.form.includes("not enabled") || errors.form.includes("not-allowed")
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}
            >
              <div className="flex items-start gap-2">
                <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${
                  errors.form.includes("not enabled") || errors.form.includes("not-allowed")
                    ? "text-amber-400"
                    : "text-red-400"
                }`} />
                <div className="flex-1">
                  {errors.form.includes("not enabled") || errors.form.includes("not-allowed") ? (
                    <div>
                      <strong className="block text-amber-400 font-semibold mb-1">Firebase Provider Setup Required</strong>
                      <p className="leading-relaxed">{errors.form}</p>
                      <div className="mt-3 bg-slate-950/65 border border-slate-800 p-2.5 rounded-lg text-[11px] text-slate-400 space-y-1.5 font-sans">
                        <p className="font-semibold text-slate-300">Quick steps to resolve:</p>
                        <ol className="list-decimal pl-4 space-y-1">
                          <li>Open your <strong>Firebase Console</strong> for this project.</li>
                          <li>Click on <strong>Authentication</strong> in the left sidebar menu.</li>
                          <li>Go to the <strong>Sign-in method</strong> tab.</li>
                          <li>Click on the provider (e.g., <strong>Email/Password</strong> or <strong>Google</strong>).</li>
                          <li>Toggle it to <strong>Enabled</strong> and click <strong>Save</strong>.</li>
                        </ol>
                      </div>
                    </div>
                  ) : (
                    <span>{errors.form}</span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Core Fields Form */}
          {mode !== "forgot" ? (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Profile Name Field (Signup Mode only) */}
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ashish Ranjan"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-600 text-sm outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                    }}
                    onBlur={() => {
                      const err = validateEmail(email);
                      if (err) setErrors(prev => ({ ...prev, email: err }));
                    }}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border ${errors.email ? "border-rose-500/50 focus:border-rose-500" : "border-slate-800 focus:border-indigo-500"} focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-600 text-sm outline-none transition-all`}
                  />
                </div>
                {errors.email && <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest">Password</label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors(prev => ({ ...prev, password: "" }));
                    }}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-600 text-sm outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter (Signup Only) */}
                {mode === "signup" && password && (
                  <div className="mt-2.5 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Password Strength:</span>
                      <span className={`text-xs font-bold ${
                        pwdStrength === "Weak" ? "text-rose-400" :
                        pwdStrength === "Medium" ? "text-amber-400" :
                        pwdStrength === "Strong" ? "text-indigo-400" : "text-emerald-400"
                      }`}>{pwdStrength}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${getStrengthBarColor()} ${getStrengthProgress()} transition-all duration-300`} />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field (Signup mode only) */}
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirm) setErrors(prev => ({ ...prev, confirm: "" }));
                      }}
                      className={`w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-950 border ${errors.confirm ? "border-rose-500/50 focus:border-rose-500" : "border-slate-800 focus:border-indigo-500"} focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-600 text-sm outline-none transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirm && <p className="text-rose-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.confirm}</p>}
                </div>
              )}

              {/* Preferences: Remember Me or T&C */}
              {mode === "login" ? (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4.5 h-4.5 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="text-xs text-slate-400 font-medium">Remember me</span>
                  </label>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="w-4.5 h-4.5 rounded bg-slate-950 border-slate-800 text-indigo-600 mt-0.5 focus:ring-0 focus:ring-offset-0 shrink-0"
                    />
                    <span className="text-xs text-slate-400 leading-normal">
                      I accept the <a href="#terms" onClick={(e) => e.preventDefault()} className="text-indigo-400 underline hover:text-indigo-300">Terms and Conditions</a> and the corporate privacy framework policy.
                    </span>
                  </label>
                </div>
              )}

              {/* Submit Main Form Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white font-medium text-sm transition-all focus:ring-2 focus:ring-indigo-500 shadow-lg shadow-indigo-950/40 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{loading ? "Authorizing..." : mode === "login" ? "Sign In" : "Register Credentials"}</span>
                {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
              </button>
            </form>
          ) : (
            /* Forgot Password special view form */
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="registered-email@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder-slate-600 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm rounded-lg transition-colors border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm rounded-lg transition-all"
                >
                  {loading ? "Sending..." : "Dispatch Reset"}
                </button>
              </div>
            </form>
          )}

          {/* Social login divider line */}
          <div className="relative my-6 text-center">
            <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-slate-800" />
            <span className="relative inline-block px-3 py-1 bg-slate-900 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
              Standard OAuth Proxy Integrator
            </span>
          </div>

          {/* Google Login button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleOAuthGoogle}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-sm transition-all flex items-center justify-center gap-2.5"
          >
            <Chrome className="w-4 h-4 text-red-400" />
            <span>Continue with Google</span>
          </button>

          {/* Bottom toggle between Login and Signup */}
          {mode !== "forgot" && (
            <div className="mt-6 text-center border-t border-slate-800/60 pt-4">
              <p className="text-xs text-slate-400">
                {mode === "login" ? "Don't have an global credential yet?" : "Already registered a workspace profile?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "login" ? "signup" : "login");
                    setErrors({});
                  }}
                  className="text-indigo-400 hover:text-indigo-300 hover:underline font-bold"
                >
                  {mode === "login" ? "Sign Up Now" : "Login Here"}
                </button>
              </p>
            </div>
          )}

          {/* Setup / Troubleshooting Assistance */}
          <div className="mt-5 pt-3.5 border-t border-slate-800/45 text-center">
            <p className="text-[10px] text-slate-500 leading-relaxed font-sans max-w-sm mx-auto">
              💡 <strong>Configuration Tip:</strong> If you see an <code>auth/operation-not-allowed</code> error, go to your <strong>Firebase Console &rarr; Authentication &rarr; Sign-in method</strong> and toggle <strong>Email/Password</strong> or <strong>Google</strong> to <strong>Enabled</strong>.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
