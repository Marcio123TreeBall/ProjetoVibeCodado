'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function LetterForm({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [letterDate, setLetterDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!title.trim()) {
      setError('Adicione um título para a carta.')
      return
    }

    if (!content.trim()) {
      setError('Escreva o conteúdo da carta.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const { error } = await supabase.from('letters').insert({
        user_id: userId,
        title: title.trim(),
        content: content.trim(),
        letter_date: letterDate || null,
      })

      if (error) throw error

      setTitle('')
      setContent('')
      setLetterDate('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar carta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card letter-form-card">
      <h2>Nova carta</h2>

      <div className="letter-controls">
        <input
          className="input-field"
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          className="input-field"
          type="date"
          value={letterDate}
          onChange={(e) => setLetterDate(e.target.value)}
        />

        <textarea
          className="textarea-field"
          placeholder="Escreva sua carta..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}

        <button className="btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar carta'}
        </button>
      </div>
    </form>
  )
}