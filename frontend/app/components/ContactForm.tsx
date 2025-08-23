'use client'
import { useState } from "react";
import '../styles/ContactForm.scss';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type ContactFormProps = {
  title?: string;
  description?: string;
  buttonText?: string;
  successMessage?: string;
  placeholder?: string;
};

export default function ContactForm({
  title = "Dejte nám zpětnou vazbu",
  description = "Napište nám, co byste na stránce vylepšili, co vám chybí nebo jakýkoliv nápad na zlepšení. Každý podnět nám pomáhá posouvat platformu dál.",
  buttonText = "Odeslat zpětnou vazbu",
  successMessage = "Děkujeme za vaši zpětnou vazbu! 👍",
  placeholder = "Vaše zpráva, nápad nebo připomínka"
}: ContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const res = await fetch(`${API_URL}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message, website: "" }),
    });

    if (res.ok) {
      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error || "Zprávu se nepodařilo odeslat. Zkuste to prosím později.");
    }
    setLoading(false);
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <h2>{title}</h2>
      {description && <div className="contact-form__desc">{description}</div>}
      <input
        type="text"
        placeholder="Vaše jméno"
        value={name}
        onChange={e => setName(e.target.value)}
        required
        disabled={loading}
      />
      <input
        type="email"
        placeholder="Váš e-mail"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        disabled={loading}
      />
      <textarea
        placeholder={placeholder}
        value={message}
        onChange={e => setMessage(e.target.value)}
        required
        rows={5}
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Odesílám..." : buttonText}
      </button>
      {success && <div className="contact-form__success">{successMessage}</div>}
      {error && <div className="contact-form__error">{error}</div>}
    </form>
  );
}