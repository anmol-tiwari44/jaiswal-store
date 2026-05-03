import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, KeyRound, Eye, EyeOff, AlertTriangle } from "lucide-react";
import {
  useChangeCredentials,
  getGetMeQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth-guard";

function ChangeCredentialsContent() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const mutation = useChangeCredentials({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setSuccess("Credentials updated! Redirecting to login...");
        setTimeout(() => setLocation("/login"), 1500);
      },
      onError: () => setError("Failed to update credentials. Please try again."),
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    mutation.mutate({ data: { username, password } });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-secondary text-secondary-foreground shadow-md">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/admin">
            <button className="flex items-center gap-2 text-secondary-foreground/70 hover:text-secondary-foreground transition-colors text-sm">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
          </Link>
          <span className="text-secondary-foreground/30">|</span>
          <h1 className="font-bold text-sm">Change Login Credentials</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-card-border rounded-3xl shadow-sm p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-11 w-11 bg-primary/10 rounded-xl flex items-center justify-center">
              <KeyRound className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Change Credentials</h2>
              <p className="text-muted-foreground text-sm">Update your admin login details</p>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5 mb-8">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              After changing credentials, you will be logged out and must sign in again with the new details.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                New Username <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter new username"
                required
                className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                New Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  required
                  minLength={6}
                  className="w-full h-11 px-4 pr-11 rounded-xl border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}
            {success && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-4 py-3"
              >
                {success}
              </motion.p>
            )}

            <div className="flex gap-3 pt-2">
              <Link href="/admin" className="flex-1">
                <button
                  type="button"
                  className="w-full h-11 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted transition"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="flex-1 h-11 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
              >
                {mutation.isPending ? (
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                {mutation.isPending ? "Updating..." : "Update Credentials"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default function ChangeCredentials() {
  return (
    <AuthGuard>
      <ChangeCredentialsContent />
    </AuthGuard>
  );
}
