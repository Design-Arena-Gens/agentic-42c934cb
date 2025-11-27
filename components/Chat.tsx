\"use client\";
import { useEffect, useRef, useState } from \"react\";
import MessageList from \"./MessageList\";
import SettingsDrawer from \"./SettingsDrawer\";
import VoiceControls from \"./VoiceControls\";

type Message = { role: \"user\" | \"assistant\"; content: string };

type Settings = {
  provider: \"ollama\" | \"lmstudio\";
  endpoint: string;
  model: string;
  temperature: number;
  top_p: number;
  max_tokens: number;
  system: string;
  apiKey?: string;
};

const DEFAULTS: Settings = {
  provider: \"ollama\",
  endpoint: \"\",
  model: \"llama3.1:8b\",
  temperature: 0.7,
  top_p: 0.95,
  max_tokens: 512,
  system: \"You are a helpful assistant.\",
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState(\"\");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [settings, setSettings] = useState<Settings>(() => {
    const raw = typeof window !== \"undefined\" ? localStorage.getItem(\"settings\") : null;
    return raw ? JSON.parse(raw) : DEFAULTS;
  });

  useEffect(() => {
    localStorage.setItem(\"settings\", JSON.stringify(settings));
  }, [settings]);

  const controllerRef = useRef<AbortController | null>(null);

  async function sendMessage(text?: string) {
    const content = (text ?? input).trim();
    if (!content) return;
    setInput(\"\");
    const newMessages = [...messages, { role: \"user\", content }];
    setMessages(newMessages);

    const providerEndpoint =
      settings.provider === \"ollama\"
        ? settings.endpoint || \"http://localhost:11434/api/chat\"
        : settings.endpoint || \"http://localhost:1234/v1/chat/completions\";

    const payload = {
      provider: settings.provider,
      endpoint: settings.endpoint || undefined,
      model: settings.model,
      temperature: settings.temperature,
      top_p: settings.top_p,
      max_tokens: settings.max_tokens,
      system: settings.system,
      messages: newMessages,
      stream: true,
      apiKey: settings.apiKey,
    };

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setMessages(curr => [...curr, { role: \"assistant\", content: \"\" }]);

    const res = await fetch(\"/api/chat\", {
      method: \"POST\",
      headers: { \"Content-Type\": \"application/json\" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok || !res.body) {
      const text = await res.text();
      setMessages(curr => {
        const updated = [...curr];
        updated[updated.length - 1] = { role: \"assistant\", content: `Error: ${text}` };
        return updated;
      });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let partial = \"\";
    // both providers stream directly; we simply append chunks
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      partial += chunk;
      setMessages(curr => {
        const updated = [...curr];
        updated[updated.length - 1] = { role: \"assistant\", content: partial };
        return updated;
      });
    }
  }

  function stop() {
    controllerRef.current?.abort();
  }

  function onTranscript(text: string) {
    setInput(text);
  }

  function speak(text: string) {
    if (typeof window === \"undefined\") return;
    const u = new SpeechSynthesisUtterance(text);
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }

  useEffect(() => {
    if (!speaking && messages.length && messages[messages.length - 1].role === \"assistant\") {
      const content = messages[messages.length - 1].content;
      if (content) {
        // Auto-speak last assistant message if voice is active; controlled in VoiceControls
      }
    }
  }, [messages, speaking]);

  return (
    <div>
      <div style={{ display: \"flex\", gap: 8, marginBottom: 12 }}>
        <button onClick={() => setSettingsOpen(true)}>Settings</button>
        <button onClick={() => setMessages([])}>Clear</button>
      </div>
      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={setSettings}
      />
      <MessageList messages={messages} />
      <div style={{ display: \"flex\", gap: 8, marginTop: 12 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === \"Enter\" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder=\"Type a message...\"
          style={{ flex: 1, padding: 8 }}
        />
        <button onClick={() => sendMessage()} disabled={!input.trim()}>Send</button>
        <button onClick={stop}>Stop</button>
        <VoiceControls onTranscript={onTranscript} />
      </div>
      <div style={{ marginTop: 8 }}>
        <button
          onClick={() => {
            const last = messages.filter(m => m.role === \"assistant\").at(-1)?.content;
            if (last) speak(last);
          }}
        >
          Speak last reply
        </button>
      </div>
    </div>
  );
}

