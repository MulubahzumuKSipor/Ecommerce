"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import styles from "@/app/ui/styles/contact.module.css";

export default function ContactUsPage() {
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");

    if (!name || !email || !message) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      // Example: submit to your API endpoint
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Thank you! Your message has been sent.");
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
      } else {
        setError(data.message || "Failed to send message.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while sending your message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>Get in Touch</h1>
        <p className={styles.heroSubtitle}>
          We’d love to hear from you. Whether you have a question, feedback, or want to collaborate, our team is here to help.
        </p>
      </section>

      {/* Contact Info */}
      <section className={styles.infoSection}>
        <div className={styles.infoCard}>
          <h3>Email</h3>
          <p>sipormulubah@outlook.com</p>
        </div>
        <div className={styles.infoCard}>
          <h3>Phone</h3>
          <p>+231-886-678786</p>
        </div>
        <div className={styles.infoCard}>
          <h3>Address</h3>
          <p>Liberian Learning Center, 78C3+MFF, Mills Center, Liberia</p>
        </div>
        <div className={styles.infoCard}>
          <h3>Follow Us</h3>
          <p>
            <a href="https://www.linkedin.com/in/mulubahzumu-kemmeh-sipor-526a74197/" target="_blank">LinkedIn</a> |
            <a href="https://app.daily.dev/mulubahzumukemmehsipor" target="_blank">Daily Dev</a> |
            <a href="https://github.com/MulubahzumuKSipor" target="_blank">Github</a>
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className={styles.formSection}>
        <div className={styles.formContainer}>
          <h2>Send Us a Message</h2>
          {success && <div className={styles.successMessage}>{success}</div>}
          {error && <div className={styles.errorMessage}>{error}</div>}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className={styles.field}>
              <label>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>

            <div className={styles.field}>
              <label>Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Inquiry Subject"
              />
            </div>

            <div className={styles.field}>
              <label>Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message..."
                rows={5}
                required
              />
            </div>

            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      </section>

      {/* Optional Map Section */}
      <section className={styles.mapSection}>
        <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d466.8773008573339!2d-10.696064609968674!3d6.271536329283255!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2s!4v1765329283035!5m2!1sen!2s"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </section>

    </div>
  );
}
