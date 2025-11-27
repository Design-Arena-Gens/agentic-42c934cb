\"use client\";
import { useEffect, useRef } from \"react\";

type Message = { role: \"user\" | \"assistant\"; content: string };

export default function MessageList({ messages }: { messages: Message[] }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: \"smooth\" });
  }, [messages]);
  return (
    <div
      ref={ref}
      style={{
        border: \"1px solid #ddd\",
        borderRadius: 8,
        padding: 12,
        height: 420,
        overflowY: \"auto\",
        background: \"#fafafa\",
      }}
    >
      {messages.length === 0 ? (
        <div style={{ color: \"#777\" }}>Start the conversation?</div>
      ) : (
        messages.map((m, i) => (
          <div
            key={i}
            style={{
              marginBottom: 12,
              display: \"flex\",
              justifyContent: m.role === \"user\" ? \"flex-end\" : \"flex-start\",
            }}
          >
            <div
              style={{
                maxWidth: \"80%\",
                whiteSpace: \"pre-wrap\",
                padding: \"8px 12px\",
                borderRadius: 12,
                background: m.role === \"user\" ? \"#2563eb\" : \"#e5e7eb\",
                color: m.role === \"user\" ? \"white\" : \"#111827\",
              }}
            >
              {m.content}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

