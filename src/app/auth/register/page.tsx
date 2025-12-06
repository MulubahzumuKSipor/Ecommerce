'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import styles from '@/app/ui/styles/register.module.css'
import Link from 'next/link'

interface FormState {
  username: string
  email: string
  phone: string
  password: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>({
    username: '',
    email: '',
    phone: '',
    password: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Registration failed')

      // Show success message and clear form
      setMessage('Registration successful! Check your email to verify your account.')
      setForm({ username: '', email: '', phone: '', password: '' })

      // Optional: redirect after a few seconds
      setTimeout(() => {
        router.push('/auth/resend')
      }, 4000)

    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.registerCard}>
        <h1 className={styles.title}>Create Your Account</h1>

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
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
            className={styles.input}
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            required
            className={styles.input}
            autoComplete="email"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number (Optional)"
            value={form.phone}
            onChange={handleChange}
            className={styles.input}
            // phone is marked as required in the user's JSX, but optional in placeholder - removed 'required' here for better UX
          />
          <input
            type="password"
            name="password"
            placeholder="Password (Min. 8 characters)"
            value={form.password}
            onChange={handleChange}
            required
            className={styles.input}
            autoComplete="new-password"
          />

          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? (
              <span className={styles.loadingState}>
                <Loader2 className={styles.spinner} size={20} />
                Registering...
              </span>
            ) : (
              'Register'
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className={styles.footerLink}>
            <p>Already have an account? <Link href="/auth/login">Login here</Link></p>
        </div>
      </div>
    </div>
  )
}