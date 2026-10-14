"use client";

import { useState } from "react";

type Message = {
  text: string;
  sender: "user" | "bot";
};

const quickPrompts = [
  "Summarize this idea in 3 bullets",
  "Give me a creative title for this project",
  "Help me plan a productive day",
  "Explain this in simple terms",
]

export default function Chat() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hi! I’m Smart Chat. Ask me anything and I’ll help you turn your ideas into clear answers.",
      sender: "bot",
    },
  ]);

  const handleSubmit = async (e : React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const userMessage: Message = { text: prompt, sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setPrompt("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from the server.");
      }

      const data = await response.json();
      const botMessage: Message = { text: data.text, sender: "bot" };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: "Sorry, an error occurred.", sender: "bot" },
      ]);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>Smart Chat</h1>


      <div style={{ border: "1px solid #ccc", padding: "10px", height: "400px", overflowY: "scroll", marginBottom: "10px" }}>

        {messages.map((message, index) => (
          <div key={index} style={{ textAlign: message.sender === "user" ? "right" : "left", marginBottom: "10px" }}>
            <strong>{message.sender === "user" ? "You" : "Smart Chat"}:</strong> {message.text}
          </div>
        ))}

      </div>

      {loading && <div style={{ textAlign: "center", marginBottom: "10px" }}>Loading...</div>}
      
      <form onSubmit={handleSubmit} style={{ display: "flex", marginBottom: "10px" }}>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: "10px", marginRight: "10px" }}
        />
        <button type="submit" style={{ padding: "10px" }}>Send</button>

      </form>
       

    </div>
  );
  
}