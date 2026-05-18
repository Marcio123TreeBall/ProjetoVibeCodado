'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Thought = {
  id: string
  content: string
}

export function ThoughtsCard({
  userId,
  initialThoughts,
}: {
  userId: string
  initialThoughts: Thought[]
}) {
  const router = useRouter()
  const supabase = createClient()

  const [content, setContent] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleAdd() {
    if (!content.trim()) {
      setError('Escreva um pensamento antes de adicionar.')
      return
    }

    try {
      setLoadingId('new')
      setError('')

      const { error } = await supabase.from('thoughts').insert({
        user_id: userId,
        content: content.trim(),
      })

      if (error) throw error

      setContent('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar pensamento.')
    } finally {
      setLoadingId(null)
    }
  }

  function startEditing(item: Thought) {
    setEditingId(item.id)
    setEditContent(item.content)
    setError('')
  }

  function cancelEditing() {
    setEditingId(null)
    setEditContent('')
    setError('')
  }

  async function handleUpdate(id: string) {
    if (!editContent.trim()) {
      setError('O pensamento não pode ficar vazio.')
      return
    }

    try {
      setLoadingId(id)
      setError('')

      const { error } = await supabase
        .from('thoughts')
        .update({ content: editContent.trim() })
        .eq('id', id)

      if (error) throw error

      cancelEditing()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar pensamento.')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm('Tem certeza que deseja excluir este pensamento?')
    if (!confirmed) return

    try {
      setLoadingId(id)
      setError('')

      const { error } = await supabase.from('thoughts').delete().eq('id', id)

      if (error) throw error

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir pensamento.')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <section className="section">
      <h2 className="section-title">Pensamentos Espontâneos</h2>

      <div className="thoughts-section card">
        <div className="extra-form-row">
          <input
            className="input-field"
            type="text"
            placeholder="Lembrei de você quando..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button
            type="button"
            className="btn-primary"
            onClick={handleAdd}
            disabled={loadingId === 'new'}
          >
            {loadingId === 'new' ? 'Adicionando...' : 'Adicionar'}
          </button>
        </div>

        {error ? <p style={{ color: 'crimson', marginTop: 12 }}>{error}</p> : null}

        <div className="thoughts-list">
          {initialThoughts.map((item) => {
            const editing = editingId === item.id
            const loading = loadingId === item.id

            return (
              <div key={item.id} className="thought-bubble">
                {editing ? (
                  <div className="extra-edit-row">
                    <input
                      className="input-field"
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />

                    <div className="crud-actions">
                      <button
                        type="button"
                        className="btn-primary"
                        disabled={loading}
                        onClick={() => handleUpdate(item.id)}
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
                    <p>{item.content}</p>

                    <div className="thought-actions">
                      <button
                        type="button"
                        className="thought-action-button"
                        disabled={loading}
                        onClick={() => startEditing(item)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="thought-action-button thought-action-danger"
                        disabled={loading}
                        onClick={() => handleDelete(item.id)}
                      >
                        {loading ? '...' : 'Excluir'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}