"use client";
import { useEffect, useState } from "react";

type Settings = {
  provider: "ollama" | "lmstudio";
  endpoint: string;
  model: string;
  temperature: number;
  top_p: number;
  max_tokens: number;
  system: string;
  apiKey?: string;
};

export default function SettingsDrawer({
  open,
  onClose,
  settings,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onChange: (s: Settings) => void;
}) {
  const [local, setLocal] = useState<Settings>(settings);
  useEffect(() => setLocal(settings), [settings, open]);

  function apply() {
    onChange(local);
    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: "100vh",
        width: open ? 360 : 0,
        background: "white",
        borderLeft: "1px solid #eee",
        transition: "width 0.2s ease",
        overflow: "hidden",
        boxShadow: open ? "-8px 0 16px rgba(0,0,0,0.08)" : "none",
        padding: open ? 16 : 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0 }}>Settings</h3>
        <button onClick={onClose}>Close</button>
      </div>
      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        <label>
          <div>Provider</div>
          <select
            value={local.provider}
            onChange={(e) => {
              const provider = e.target.value as Settings["provider"];
              const endpoint =
                provider === "ollama" ? "http://localhost:11434/api/chat" : "http://localhost:1234/v1/chat/completions";
              setLocal({ ...local, provider, endpoint });
            }}
          >
            <option value="ollama">Ollama</option>
            <option value="lmstudio">LM Studio</option>
          </select>
        </label>
        <label>
          <div>Endpoint URL</div>
          <input
            value={local.endpoint}
            onChange={(e) => setLocal({ ...local, endpoint: e.target.value })}
            placeholder="http://localhost:11434/api/chat"
            style={{ width: "100%" }}
          />
        </label>
        <label>
          <div>Model</div>
          <input
            value={local.model}
            onChange={(e) => setLocal({ ...local, model: e.target.value })}
            placeholder="llama3.1:8b"
            style={{ width: "100%" }}
          />
        </label>
        {local.provider === "lmstudio" && (
          <label>
            <div>API Key (optional)</div>
            <input
              value={local.apiKey || ""}
              onChange={(e) => setLocal({ ...local, apiKey: e.target.value })}
              placeholder="lm-studio"
              style={{ width: "100%" }}
            />
          </label>
        )}
        <label>
          <div>System Prompt</div>
          <textarea
            value={local.system}
            onChange={(e) => setLocal({ ...local, system: e.target.value })}
            rows={3}
            style={{ width: "100%" }}
          />
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <label>
            <div>Temperature</div>
            <input
              type="number"
              step="0.05"
              value={local.temperature}
              onChange={(e) => setLocal({ ...local, temperature: parseFloat(e.target.value) })}
            />
          </label>
          <label>
            <div>Top P</div>
            <input
              type="number"
              step="0.05"
              value={local.top_p}
              onChange={(e) => setLocal({ ...local, top_p: parseFloat(e.target.value) })}
            />
          </label>
          <label>
            <div>Max Tokens</div>
            <input
              type="number"
              step="1"
              value={local.max_tokens}
              onChange={(e) => setLocal({ ...local, max_tokens: parseInt(e.target.value || "0", 10) })}
            />
          </label>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button onClick={apply}>Apply</button>
          <button
            onClick={() => {
              const cleared: Settings = {
                provider: "ollama",
                endpoint: "http://localhost:11434/api/chat",
                model: "llama3.1:8b",
                temperature: 0.7,
                top_p: 0.95,
                max_tokens: 512,
                system: "You are a helpful assistant.",
              };
              setLocal(cleared);
              onChange(cleared);
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

