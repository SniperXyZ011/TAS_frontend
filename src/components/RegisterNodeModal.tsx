import { useState } from "react";
import { X, Copy, Check, AlertTriangle } from "lucide-react";
import { registerNode } from "../services/api";
import type { RegisterNodeResponse } from "../types/api";

interface RegisterNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: () => void;
}

export default function RegisterNodeModal({
  isOpen,
  onClose,
  onRegistered,
}: RegisterNodeModalProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [tier, setTier] = useState<"standard" | "priority" | "admin">("standard");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<RegisterNodeResponse | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await registerNode({
        name: name.trim(),
        location: location.trim() || "unknown",
        tier,
      });
      setResult(res);
      onRegistered();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      setError(apiErr?.message || "Failed to register node");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleClose = () => {
    setName("");
    setLocation("");
    setTier("standard");
    setError("");
    setResult(null);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {!result ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
                Register Edge Node
              </h2>
              <button onClick={handleClose} className="p-1 rounded-lg transition-colors" style={{ color: "var(--color-text-muted)" }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
                  Node Name *
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Armory-Kiosk-Alpha"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  id="input-node-name"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
                  Location
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., Building A, Floor 2"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  id="input-node-location"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--color-text-muted)" }}>
                  Tier
                </label>
                <select
                  className="input-field"
                  value={tier}
                  onChange={(e) => setTier(e.target.value as "standard" | "priority" | "admin")}
                  id="select-node-tier"
                >
                  <option value="standard">Standard</option>
                  <option value="priority">Priority</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ background: "#ef444418", color: "var(--color-danger)" }}>
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" className="btn-secondary flex-1" onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={isSubmitting} id="btn-register-submit">
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "#0a0e14", borderTopColor: "transparent" }} />
                  ) : (
                    "Register"
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ color: "var(--color-success)" }}>
                ✓ Node Registered
              </h2>
              <button onClick={handleClose} className="p-1 rounded-lg transition-colors" style={{ color: "var(--color-text-muted)" }}>
                <X size={20} />
              </button>
            </div>

            <div className="px-3 py-2 rounded-lg mb-4 flex items-start gap-2 text-sm" style={{ background: "#f59e0b18", color: "var(--color-warning)" }}>
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>Save these credentials now! They will <strong>never</strong> be shown again.</span>
            </div>

            <div className="space-y-3">
              <CredentialField
                label="Node ID"
                value={result.node_id}
                onCopy={() => copyToClipboard(result.node_id, "node_id")}
                copied={copiedField === "node_id"}
              />
              <CredentialField
                label="API Key"
                value={result.api_key}
                onCopy={() => copyToClipboard(result.api_key, "api_key")}
                copied={copiedField === "api_key"}
              />
              <CredentialField
                label="HMAC Secret"
                value={result.secret}
                onCopy={() => copyToClipboard(result.secret, "secret")}
                copied={copiedField === "secret"}
              />
            </div>

            <button onClick={handleClose} className="btn-primary w-full mt-6" id="btn-register-done">
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function CredentialField({
  label,
  value,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </p>
      <div className="flex items-center gap-2">
        <code
          className="flex-1 px-3 py-2 rounded-lg text-xs break-all"
          style={{
            background: "var(--color-bg-input)",
            border: "1px solid var(--color-border)",
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-primary)",
          }}
        >
          {value}
        </code>
        <button
          onClick={onCopy}
          className="p-2 rounded-lg transition-colors shrink-0"
          style={{
            background: copied ? "#22c55e18" : "var(--color-bg-input)",
            color: copied ? "var(--color-success)" : "var(--color-text-muted)",
            border: "1px solid var(--color-border)",
          }}
          title="Copy"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}
