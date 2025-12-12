'use client'
import { useState } from 'react'
import styles from '@/app/ui/styles/resend.module.css'
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react' // Added icons

export default function ResendVerificationPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setError(null)

    try {
      const res = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to resend email')

      setMessage(data.message || 'Verification email successfully sent! Please check your inbox.')
      setEmail('') // reset input
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.resendCard}> {/* Card wrapper for styling consistency */}
        <h1 className={styles.title}>
            <Mail size={32} style={{ marginRight: 10, color: 'var(--primary-color)' }} />
            Resend Verification Email
        </h1>

        {/* --- Message Area --- */}
        {message && (
          <p className={styles.message}>
            <CheckCircle size={18} style={{ marginRight: 8 }} />
            {message}
          </p>
        )}
        {error && (
          <p className={styles.error}>
            <XCircle size={18} style={{ marginRight: 8 }} />
            {error}
          </p>
        )}

        {/* --- Form --- */}
        <p className={styles.instruction}>
            Enter the email address you used for registration and we will send you a new verification link.
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
            autoComplete="email"
          />
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? (
              <span className={styles.loadingState}>
                <Loader2 className={styles.spinner} size={20} />
                Sending...
              </span>
            ) : (
              'Resend Email'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className={styles.footerLink}>
            <p><a href="/auth/login">Return to Login</a></p>
        </div>
      </div>
    </div>
  )
}