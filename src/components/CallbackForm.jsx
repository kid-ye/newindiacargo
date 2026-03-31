import { useState } from 'react';
import emailjs from '@emailjs/browser';
import { EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY } from '../config';

export default function CallbackForm({ formClassName = 'auth-form', btnClassName = 'auth-submit', errorClassName = 'auth-error', successContent }) {
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    const f = e.target;
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        name: f.from_name.value,
        phone: f.contact_no.value,
        email: f.from_email.value,
        message: f.message.value,
        time: new Date().toLocaleString(),
      }, EMAILJS_PUBLIC_KEY);
      setStatus('success');
      f.reset();
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') return successContent ?? <p className="callback-success">Thanks! We'll get back to you soon.</p>;

  return (
    <form className={formClassName} onSubmit={handleSubmit}>
      <input type="text" name="from_name" placeholder="Full Name" required />
      <input type="tel" name="contact_no" placeholder="Contact Number" required />
      <input type="email" name="from_email" placeholder="Email" required />
      <textarea name="message" placeholder="Message" rows="4" required />
      {status === 'error' && <p className={errorClassName}>Something went wrong. Please try again.</p>}
      <button type="submit" className={btnClassName} disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending...' : 'Submit'}
      </button>
    </form>
  );
}
