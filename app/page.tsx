import Lightfall from "@/components/lightfallComp";
import Image from "next/image";



export default function Home() {
  return (
    <main style={{ width: "100%", height: "100vh", position: "relative" }}>
      <Lightfall
        colors={['#A6C8FF', '#5227FF', '#FF9FFC']}
        backgroundColor="#0A29FF"
        speed={0.2}
        streakCount={1}
        streakWidth={1}
        streakLength={1}
        glow={1}
        density={0.6}
        twinkle={1}
        zoom={2}
        backgroundGlow={1}
        opacity={1}
        mouseInteraction={false}
        mouseStrength={0.5}
        mouseRadius={1}
      />


      <header
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "1.25rem clamp(1.25rem, 4vw, 3rem)",
        }}
      >
        <a
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.40rem",
            color: "#ffffff",
            fontSize: "1.15rem",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            textDecoration: "none",
          }}
        >
          <span
            style={{
              display: "grid",
              width: "2rem",
              height: "2rem",
              placeItems: "center",
              borderRadius: "0.7rem",
              filter: "drop-shadow(0 0 0.5rem rgba(255, 255, 255, 0.3))",
              fontSize: "1rem",
            }}
          >
            <Image src="/Union.png" alt="Union" width={20} height={20} />
          </span>
          Smart Chat
        </a>
        <nav style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
          <a
            href="/login"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white no-underline transition-all duration-200 hover:bg-white/10 hover:text-violet-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200 active:scale-95"
          >
            Log in
          </a>
          <a
            href="/signup"
            className="rounded-xl border border-white/25 bg-white/15 px-4 py-2.5 text-sm font-bold text-white no-underline backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-white/55 hover:bg-white/25 hover:shadow-[0_8px_24px_rgba(124,58,237,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200 active:translate-y-0 active:scale-95"
          >
            Sign up
          </a>
        </nav>
      </header>

      <section
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "1.35rem",
          padding: "2rem",
          color: "#ffffff",
          textAlign: "center",
          zIndex: 1,
        }}
      >
        <p
          style={{
            margin: 0,
            padding: "0.65rem 1rem",
            border: "1px solid rgba(255, 255, 255, 0.16)",
            borderRadius: "999px",
            background: "rgba(255, 255, 255, 0.08)",
            color: "#c4b5fd",
            fontSize: "0.8rem",
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          Your intelligent AI companion
        </p>
        <h1
          style={{
            maxWidth: "760px",
            margin: 0,
            fontSize: "clamp(2.75rem, 8vw, 6rem)",
            lineHeight: 1,
            letterSpacing: "-0.05em",
          }}
        >
          Meet your smarter way to chat.
        </h1>
        <p
          style={{
            maxWidth: "600px",
            margin: 0,
            color: "rgba(255, 255, 255, 0.78)",
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            lineHeight: 1.7,
          }}
        >
          Smart Chat helps you turn ideas into answers, plans, and possibilities
          through natural, helpful conversations powered by the Gemini API.
        </p>
        



        <a
          href="/about"
          className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-bold text-white no-underline transition-all duration-200 hover:bg-violet-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-200 active:scale-95"
        >
          let's talk
        </a>
        <p 
          style={{
            maxWidth: "600px",
            margin: 0,
            padding: "0.85rem 1.15rem",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "1rem",
            background: "rgba(15, 23, 42, 0.38)",
            color: "rgba(255, 255, 255, 0.86)",
            fontSize: "clamp(0.85rem, 1.5vw, 1rem)",
            lineHeight: 1.6,
            boxShadow: "0 12px 30px rgba(0, 0, 0, 0.18)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          <strong style={{ color: "#c4b5fd" }}>Note:</strong> Without an
          account, you can use the chat up to 5 times. Please sign up for
          unlimited access.
        </p>
      </section>
    </main>
  );
}
