'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Memory = {
  id: string
  title: string
  description: string
  memory_date: string
  created_at: string
}

export function MemoriesList({ memories }: { memories: Memory[] }) {
  const supabase = createClient()
  const router = useRouter()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editMemoryDate, setEditMemoryDate] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  function startEditing(memory: Memory) {
    setEditingId(memory.id)
    setEditTitle(memory.title)
    setEditDescription(memory.description)
    setEditMemoryDate(memory.memory_date)
    setError('')
  }

  function cancelEditing() {
    setEditingId(null)
    setEditTitle('')
    setEditDescription('')
    setEditMemoryDate('')
    setError('')
  }

  async function handleUpdate(memoryId: string) {
    if (!editTitle.trim()) {
      setError('O título da memória não pode ficar vazio.')
      return
    }

    if (!editDescription.trim()) {
      setError('A descrição da memória não pode ficar vazia.')
      return
    }

    if (!editMemoryDate) {
      setError('A data da memória é obrigatória.')
      return
    }

    try {
      setLoadingId(memoryId)
      setError('')

      const { error } = await supabase
        .from('memories')
        .update({
          title: editTitle.trim(),
          description: editDescription.trim(),
          memory_date: editMemoryDate,
        })
        .eq('id', memoryId)

      if (error) throw error

      cancelEditing()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar memória.')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDelete(memory: Memory) {
    const confirmed = window.confirm('Tem certeza que deseja excluir esta memória?')

    if (!confirmed) return

    try {
      setLoadingId(memory.id)
      setError('')

      const { error } = await supabase
        .from('memories')
        .delete()
        .eq('id', memory.id)

      if (error) throw error

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir memória.')
    } finally {
      setLoadingId(null)
    }
  }

  if (!memories.length) {
    return <div className="card">Nenhuma memória ainda.</div>
  }

  return (
    <div className="timeline">
      {error ? (
        <div className="card" style={{ color: 'crimson', marginBottom: 24 }}>
          {error}
        </div>
      ) : null}

      {memories.map((memory) => {
        const editing = editingId === memory.id
        const loading = loadingId === memory.id

        return (
          <article key={memory.id} className="timeline-item">
            <div className="timeline-dot" />

            <div className="timeline-content card">
              {editing ? (
                <div className="grid">
                  <input
                    className="input-field"
                    type="date"
                    value={editMemoryDate}
                    onChange={(e) => setEditMemoryDate(e.target.value)}
                    required
                  />

                  <input
                    className="input-field"
                    type="text"
                    placeholder="Título da memória"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />

                  <textarea
                    className="textarea-field"
                    placeholder="Descreva essa memória..."
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    required
                  />

                  <div className="crud-actions">
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={loading}
                      onClick={() => handleUpdate(memory.id)}
                    >
                      {loading ? 'Salvando...' : 'Salvar'}
                    </button>

                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={loading}
                      onClick={cancelEditing}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="timeline-date">
                    {new Date(`${memory.memory_date}T00:00:00`).toLocaleDateString('pt-BR')}
                  </span>

                  <h4>{memory.title}</h4>

                  <p style={{ whiteSpace: 'pre-wrap' }}>{memory.description}</p>

                  <div className="crud-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={loading}
                      onClick={() => startEditing(memory)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="btn-delete"
                      disabled={loading}
                      onClick={() => handleDelete(memory)}
                    >
                      {loading ? 'Excluindo...' : 'Excluir'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </article>
        )
      })}
    </div>
  )
}