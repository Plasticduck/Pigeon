import Link from "next/link";
import LoginButton from "@/components/LoginButton";

export default function Home() {
  return (
    <main className="landing-container">
      <div style={{ position: "absolute", top: "2rem", left: "2rem", fontWeight: 700, fontSize: "1.5rem" }}>
        Piegon<span style={{ color: "var(--text-secondary)" }}>.</span>
      </div>
      <h1 className="landing-title">Your inbox, reimagined.</h1>
      <p className="landing-subtitle">
        Piegon connects directly to your Gmail to give you a smart, modular, and beautiful email experience. No pricing. Open source. Fully yours.
      </p>
      <LoginButton />
    </main>
  );
}
