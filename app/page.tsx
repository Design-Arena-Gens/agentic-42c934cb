import Chat from "@components/Chat";

export default function Page() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
        Agentic Local Chat
      </h1>
      <p style={{ color: "#555", marginBottom: 16 }}>
        Connect to local Ollama or LM Studio models. Toggle voice, configure settings, and chat in real-time.
      </p>
      <Chat />
    </main>
  );
}

