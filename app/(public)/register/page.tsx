'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const supabase = createClient()
  const router = useRouter()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser()
      if (data.user) {
        router.push('/dashboard')
      }
    }

    checkUser()
  }, [router, supabase])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setMessage('Conta criada com sucesso. Verifique seu e-mail.')
    setLoading(false)
  }

  return (
    <main className="login-container">
      <form onSubmit={handleRegister} className="login-card">
        <h2>Criar conta</h2>

        <input
          className="input-field"
          type="text"
          placeholder="Nome"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />

        <input
          className="input-field"
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          className="input-field"
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
        {message ? <p style={{ color: 'green' }}>{message}</p> : null}

        <div className="login-actions">
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </div>

        <p className="login-footer">
          Já tem conta?{' '}
          <Link href="/login" style={{ color: 'var(--accent-light)' }}>
            Entrar
          </Link>
        </p>
      </form>
    </main>
  )
}