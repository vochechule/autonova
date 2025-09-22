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
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({}); // ✅ Field-specific errors

  // ✅ Client-side validation
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!name.trim()) {
      errors.name = "Jméno je povinné";
    } else if (name.trim().length < 2) {
      errors.name = "Jméno musí mít alespoň 2 znaky";
    }
    
    if (!email.trim()) {
      errors.email = "E-mail je povinný";
    } else if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      errors.email = "Neplatný formát e-mailu";
    }
    
    if (!message.trim()) {
      errors.message = "Zpráva je povinná";
    } else if (message.trim().length < 5) {
      errors.message = "Zpráva musí mít alespoň 5 znaků";
    } else if (message.trim().length > 5000) {
      errors.message = "Zpráva je příliš dlouhá (max 5000 znaků)";
    }
    
    return errors;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    // ✅ Client-side validation first
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim(), website: "" }),
      });

      if (res.ok) {
        setSuccess(true);
        setName("");
        setEmail("");
        setMessage("");
        setError(null);
        setFieldErrors({});
        
        // ✅ Auto-hide success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } else {
        // ✅ Enhanced error handling
        const data = await res.json().catch(() => null);
        
        // Handle different HTTP status codes
        if (res.status === 429) {
          setError("Příliš mnoho požadavků. Zkuste to prosím za chvíli.");
        } else if (res.status === 400) {
          // Handle validation errors from server
          if (data?.message) {
            if (Array.isArray(data.message)) {
              setError(data.message.join(', '));
            } else {
              setError(data.message);
            }
          } else {
            setError("Neplatná data ve formuláři. Zkontrolujte všechna pole.");
          }
        } else if (res.status === 500) {
          setError("Chyba serveru. Zkuste to prosím později nebo nás kontaktujte přímo.");
        } else if (res.status >= 500) {
          setError("Server momentálně není dostupný. Zkuste to prosím později.");
        } else {
          setError(data?.message || "Zprávu se nepodařilo odeslat. Zkuste to prosím později.");
        }
      }
    } catch (networkError) {
      // ✅ Handle network errors
      console.error('Network error:', networkError);
      setError("Chyba připojení. Zkontrolujte internetové připojení a zkuste to znovu.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Clear field error when user starts typing
  const handleFieldChange = (field: string, value: string, setter: (value: string) => void) => {
    setter(value);
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    if (error) setError(null); // Clear general error when user makes changes
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <h2>{title}</h2>
      {description && <div className="contact-form__desc">{description}</div>}
      
      {/* ✅ Name field with error handling */}
      <div className="contact-form__field">
        <input
          type="text"
          placeholder="Vaše jméno"
          value={name}
          onChange={e => handleFieldChange('name', e.target.value, setName)}
          required
          disabled={loading}
          className={fieldErrors.name ? 'error' : ''}
          maxLength={100}
        />
        {fieldErrors.name && <div className="contact-form__field-error">{fieldErrors.name}</div>}
      </div>
      
      {/* ✅ Email field with error handling */}
      <div className="contact-form__field">
        <input
          type="email"
          placeholder="Váš e-mail"
          value={email}
          onChange={e => handleFieldChange('email', e.target.value, setEmail)}
          required
          disabled={loading}
          className={fieldErrors.email ? 'error' : ''}
          maxLength={254}
        />
        {fieldErrors.email && <div className="contact-form__field-error">{fieldErrors.email}</div>}
      </div>
      
      {/* ✅ Message field with error handling and character counter */}
      <div className="contact-form__field">
        <textarea
          placeholder={placeholder}
          value={message}
          onChange={e => handleFieldChange('message', e.target.value, setMessage)}
          required
          rows={5}
          disabled={loading}
          className={fieldErrors.message ? 'error' : ''}
          maxLength={5000}
        />
        <div className="contact-form__message-footer">
          <div className="contact-form__char-counter">
            {message.length}/5000 znaků
          </div>
          {fieldErrors.message && <div className="contact-form__field-error">{fieldErrors.message}</div>}
        </div>
      </div>
      
      <button type="submit" disabled={loading || Object.keys(fieldErrors).length > 0}>
        {loading ? "Odesílám..." : buttonText}
      </button>
      
      {/* ✅ Enhanced success and error messages */}
      {success && (
        <div className="contact-form__success">
          <div className="contact-form__success-icon">✅</div>
          {successMessage}
        </div>
      )}
      {error && (
        <div className="contact-form__error">
          <div className="contact-form__error-icon">⚠️</div>
          {error}
        </div>
      )}
    </form>
  );
}