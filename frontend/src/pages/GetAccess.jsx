import { useState } from 'react'
import { Link } from 'react-router-dom'

const API_BASE = 'https://getaccess-server.onrender.com'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const LOGO_URL =
  'https://images.squarespace-cdn.com/content/v1/567069c3d82d5e5d015ccbac/2afb843a-f350-4f60-9f62-4f1908394688/blackvraarlogo.webp?format=1500w'

function validateName(value) {
  const t = (value ?? '').trim()
  if (!t) return 'Name is required'
  return null
}

function validateEmail(value) {
  const t = (value ?? '').trim()
  if (!t) return 'Email is required'
  if (!EMAIL_REGEX.test(t)) return 'Please enter a valid email address'
  return null
}

function AccessIllustration() {
  return (
    <div className="flex items-center justify-center w-full h-full min-h-[280px] ">
      <img
            src={"/hero.png"}
            className='h-full'
            alt="VR/AR Association"
          />
    </div>
  )
}

function GetAccess() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const nameErr = validateName(name)
    if (nameErr) {
      setError(nameErr)
      return
    }
    const emailErr = validateEmail(email)
    if (emailErr) {
      setError(emailErr)
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }
      setSuccess(data.message ?? 'Access request sent!')
      setName('')
      setEmail('')
    } catch (err) {
      setError(err.message ?? 'Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-2 bg-white border-b border-gray-200 shadow-sm">
        <Link to="/getAccess" className="flex items-center gap-3">
          <img
            src={LOGO_URL}
            alt="VR/AR Association"
            className="h-20 w-auto object-contain"
          />
        
        </Link>
        <a
          href="https://members.thevrara.com/member-inquries/"
          target="_blank"
          className="rounded-lg bg-[#12a1e2] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d8abb] transition-colors"
        >
          Join Now
        </a>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Get Access
            </h1>
            <p className="text-gray-500 text-lg">
              Enter your details below to request access.
            </p>
          </div>

          {/* Dark card: form + illustration */}
          <div className="rounded-2xl bg-[#1f2937] shadow-[0_8px_30px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col lg:flex-row min-h-[420px]">
            {/* Form */}
            <div className="flex-1 p-8 sm:p-10 flex flex-col justify-center">
              <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setError('')
                      setSuccess('')
                    }}
                    placeholder="Enter your name"
                    autoComplete="given-name"
                    disabled={submitting}
                    className="w-full rounded-lg bg-white px-4 py-3 text-gray-900 placeholder-gray-400 border-0 focus:ring-2 focus:ring-[#12a1e2] focus:outline-hidden disabled:opacity-50 transition-shadow"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                      setSuccess('')
                    }}
                    placeholder="Enter your email"
                    autoComplete="email"
                    disabled={submitting}
                    className="w-full rounded-lg bg-white px-4 py-3 text-gray-900 placeholder-gray-400 border-0 focus:ring-2 focus:ring-[#12a1e2] focus:outline-hidden disabled:opacity-50 transition-shadow"
                  />
                </div>
                {error && (
                  <p role="alert" className="text-sm text-red-400">
                    {error}
                  </p>
                )}
                {success && (
                  <p role="status" className="text-sm text-emerald-400">
                    {success}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-[#12a1e2] py-3 text-base font-medium text-white hover:bg-[#0d8abb] focus:ring-2 focus:ring-[#12a1e2] focus:ring-offset-2 focus:ring-offset-[#1f2937] focus:outline-hidden disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Requesting…' : 'Get Access'}
                </button>
              </form>
            </div>

            {/* Illustration */}
            <div className="flex-1 flex items-center justify-center bg-[#111827] lg:max-w-[50%]">
              <AccessIllustration />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default GetAccess
