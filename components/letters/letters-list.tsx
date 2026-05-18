'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Letter = {
  id: string
  title: string
  content: string
  letter_date: string | null
  created_at: string
}

export function LettersList({ letters }: { letters: Letter[] }) {
  const supabase = createClient()
  const router = useRouter()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editLetterDate, setEditLetterDate] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  function startEditing(letter: Letter) {
    setEditingId(letter.id)
    setEditTitle(letter.title)
    setEditContent(letter.content)
    setEditLetterDate(letter.letter_date || '')
    setError('')
  }

  function cancelEditing() {
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
    setEditLetterDate('')
    setError('')
  }

  async function handleUpdate(letterId: string) {
    if (!editTitle.trim()) {
      setError('O título da carta não pode ficar vazio.')
      return
    }

    if (!editContent.trim()) {
      setError('O conteúdo da carta não pode ficar vazio.')
      return
    }

    try {
      setLoadingId(letterId)
      setError('')

      const { error } = await supabase
        .from('letters')
        .update({
          title: editTitle.trim(),
          content: editContent.trim(),
          letter_date: editLetterDate || null,
        })
        .eq('id', letterId)

      if (error) throw error

      cancelEditing()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar carta.')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDelete(letter: Letter) {
    const confirmed = window.confirm('Tem certeza que deseja excluir esta carta?')

    if (!confirmed) return

    try {
      setLoadingId(letter.id)
      setError('')

      const { error } = await supabase
        .from('letters')
        .delete()
        .eq('id', letter.id)

      if (error) throw error

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir carta.')
    } finally {
      setLoadingId(null)
    }
  }

  if (!letters.length) {
    return <div className="card">Nenhuma carta ainda.</div>
  }

  return (
    <div className="letters-container">
      {error ? (
        <div className="card" style={{ color: 'crimson' }}>
          {error}
        </div>
      ) : null}

      {letters.map((letter) => {
        const editing = editingId === letter.id
        const loading = loadingId === letter.id

        return (
          <article key={letter.id} className="letter-note card">
            {editing ? (
              <div className="grid">
                <input
                  className="input-field"
                  type="text"
                  placeholder="Título da carta"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />

                <input
                  className="input-field"
                  type="date"
                  value={editLetterDate}
                  onChange={(e) => setEditLetterDate(e.target.value)}
                />

                <textarea
                  className="textarea-field"
                  placeholder="Escreva sua carta..."
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />

                <div className="crud-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={loading}
                    onClick={() => handleUpdate(letter.id)}
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
                <span className="letter-date">
                  {letter.letter_date
                    ? new Date(`${letter.letter_date}T00:00:00`).toLocaleDateString('pt-BR')
                    : 'Sem data'}
                </span>

                <h3>{letter.title}</h3>

                <p style={{ whiteSpace: 'pre-wrap' }}>{letter.content}</p>

                <div className="crud-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={loading}
                    onClick={() => startEditing(letter)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="btn-delete"
                    disabled={loading}
                    onClick={() => handleDelete(letter)}
                  >
                    {loading ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </>
            )}
          </article>
        )
      })}
    </div>
  )
}