import { useState } from "react";
import { Shield, Lock, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      setError("Admin key is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const valid = await login(key.trim());
      if (!valid) {
        setError("Invalid admin key. Access denied.");
      }
    } catch {
      setError("Connection failed. Is the backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-bg-primary)" }}
      id="login-page"
    >
      {/* Background grid pattern */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--color-text-muted) 1px, transparent 1px),
                            linear-gradient(90deg, var(--color-text-muted) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 animate-pulse-glow"
            style={{ background: "var(--color-accent)", color: "#0a0e14" }}
          >
            <Shield size={32} strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            Tactical Armory System
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            Admin Dashboard — Authorized Personnel Only
          </p>
        </div>

        {/* Login card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="admin-key-input"
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: "var(--color-text-muted)" }}
              >
                Admin API Key
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--color-text-muted)" }}
                />
                <input
                  id="admin-key-input"
                  type="password"
                  className="input-field"
                  style={{ paddingLeft: "40px" }}
                  placeholder="Enter your admin key…"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  autoFocus
                  autoComplete="off"
                />
              </div>
            </div>

            {error && (
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
                style={{ background: "#ef444418", color: "var(--color-danger)" }}
                id="login-error"
              >
                <AlertTriangle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isLoading}
              id="btn-login"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Authenticating…
                </>
              ) : (
                <>
                  <Lock size={16} />
                  Access Dashboard
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs mt-6" style={{ color: "var(--color-text-muted)" }}>
            Secured with HMAC-SHA256 • TLS Required in Production
          </p>
        </div>
      </div>
    </div>
  );
}
