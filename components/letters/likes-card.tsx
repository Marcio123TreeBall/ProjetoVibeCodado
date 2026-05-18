'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Like = {
  id: string
  content: string
}

export function LikesCard({
  userId,
  initialLikes,
}: {
  userId: string
  initialLikes: Like[]
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
      setError('Escreva algo antes de adicionar.')
      return
    }

    try {
      setError('')
      setLoadingId('new')

      const { error } = await supabase.from('likes').insert({
        user_id: userId,
        content: content.trim(),
      })

      if (error) throw error

      setContent('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar item.')
    } finally {
      setLoadingId(null)
    }
  }

  function startEditing(item: Like) {
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
      setError('O texto não pode ficar vazio.')
      return
    }

    try {
      setLoadingId(id)
      setError('')

      const { error } = await supabase
        .from('likes')
        .update({ content: editContent.trim() })
        .eq('id', id)

      if (error) throw error

      cancelEditing()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar item.')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm('Tem certeza que deseja excluir este item?')
    if (!confirmed) return

    try {
      setLoadingId(id)
      setError('')

      const { error } = await supabase.from('likes').delete().eq('id', id)

      if (error) throw error

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir item.')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <section className="section">
      <h2 className="section-title">Pequenas Coisas que Amo</h2>

      <div className="likes-section card">
        <div className="extra-form-row">
          <input
            className="input-field"
            type="text"
            placeholder="Adicione algo que você ama..."
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

        <ul className="likes-list">
          {initialLikes.map((item) => {
            const editing = editingId === item.id
            const loading = loadingId === item.id

            return (
              <li key={item.id}>
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
                  <div className="extra-list-item">
                    <span>{item.content}</span>

                    <div className="extra-list-actions">
                      <button
                        type="button"
                        className="btn-secondary btn-small"
                        disabled={loading}
                        onClick={() => startEditing(item)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="btn-delete btn-small"
                        disabled={loading}
                        onClick={() => handleDelete(item.id)}
                      >
                        {loading ? '...' : 'Excluir'}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}