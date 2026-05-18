'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function MemoryForm({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [memoryDate, setMemoryDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!memoryDate) {
      setError('Escolha uma data para a memória.')
      return
    }

    if (!title.trim()) {
      setError('Adicione um título para a memória.')
      return
    }

    if (!description.trim()) {
      setError('Descreva essa memória.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const { error } = await supabase.from('memories').insert({
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        memory_date: memoryDate,
      })

      if (error) throw error

      setTitle('')
      setDescription('')
      setMemoryDate('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar memória.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card memory-form-card">
      <h2>Nova memória</h2>

      <div className="timeline-controls">
        <input
          className="input-field"
          type="date"
          value={memoryDate}
          onChange={(e) => setMemoryDate(e.target.value)}
          required
        />

        <input
          className="input-field"
          type="text"
          placeholder="Título do momento"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          className="textarea-field"
          placeholder="Descreva este momento especial..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}

        <button className="btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : 'Adicionar Memória'}
        </button>
      </div>
    </form>
  )
}