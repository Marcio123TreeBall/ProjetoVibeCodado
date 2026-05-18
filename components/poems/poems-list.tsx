'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Poem = {
  id: string
  title: string | null
  content: string
  image_path: string | null
  created_at: string
}

export function PoemsList({ poems }: { poems: Poem[] }) {
  const supabase = createClient()
  const router = useRouter()

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [urls, setUrls] = useState<Record<string, string>>({})
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadUrls() {
      const withImage = poems.filter((poem) => poem.image_path)

      const entries = await Promise.all(
        withImage.map(async (poem) => {
          const { data, error } = await supabase.storage
            .from('user-media')
            .createSignedUrl(poem.image_path as string, 60 * 10)

          if (error || !data?.signedUrl) return [poem.id, ''] as const

          return [poem.id, data.signedUrl] as const
        })
      )

      setUrls(Object.fromEntries(entries))
    }

    loadUrls()
  }, [poems, supabase])

  function startEditing(poem: Poem) {
    setEditingId(poem.id)
    setEditTitle(poem.title || '')
    setEditContent(poem.content)
    setError('')
  }

  function cancelEditing() {
    setEditingId(null)
    setEditTitle('')
    setEditContent('')
    setError('')
  }

  async function handleUpdate(poemId: string) {
    if (!editContent.trim()) {
      setError('O conteúdo do poema não pode ficar vazio.')
      return
    }

    try {
      setLoadingId(poemId)
      setError('')

      const { error } = await supabase
        .from('poems')
        .update({
          title: editTitle.trim() || null,
          content: editContent.trim(),
        })
        .eq('id', poemId)

      if (error) throw error

      cancelEditing()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar poema.')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDelete(poem: Poem) {
    const confirmed = window.confirm('Tem certeza que deseja excluir este poema?')

    if (!confirmed) return

    try {
      setLoadingId(poem.id)
      setError('')

      if (poem.image_path) {
        await supabase.storage
          .from('user-media')
          .remove([poem.image_path])
      }

      const { error } = await supabase
        .from('poems')
        .delete()
        .eq('id', poem.id)

      if (error) throw error

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir poema.')
    } finally {
      setLoadingId(null)
    }
  }

  if (!poems.length) {
    return <div className="card">Nenhum poema ainda.</div>
  }

  return (
    <div className="poems-container">
      {error ? (
        <div className="card" style={{ color: 'crimson' }}>
          {error}
        </div>
      ) : null}

      {poems.map((poem) => {
        const expanded = expandedId === poem.id
        const editing = editingId === poem.id
        const loading = loadingId === poem.id

        return (
          <article key={poem.id} className="card poem-card">
            {editing ? (
              <div className="grid">
                <input
                  className="input-field"
                  type="text"
                  placeholder="Título"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />

                <textarea
                  className="textarea-field"
                  placeholder="Escreva seu poema..."
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />

                <div className="crud-actions">
                  <button
                    className="btn-primary"
                    type="button"
                    disabled={loading}
                    onClick={() => handleUpdate(poem.id)}
                  >
                    {loading ? 'Salvando...' : 'Salvar alterações'}
                  </button>

                  <button
                    className="btn-secondary"
                    type="button"
                    disabled={loading}
                    onClick={cancelEditing}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                {poem.title ? <h3>{poem.title}</h3> : null}

                <p style={{ whiteSpace: 'pre-wrap' }}>{poem.content}</p>

                {poem.image_path ? (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() =>
                      setExpandedId(expanded ? null : poem.id)
                    }
                  >
                    {expanded ? 'Ocultar imagem' : 'Ver imagem'}
                  </button>
                ) : null}

                {poem.image_path && expanded && urls[poem.id] ? (
                  <img
                    src={urls[poem.id]}
                    alt={poem.title || 'Imagem do poema'}
                    className="poem-expanded-image"
                  />
                ) : null}

                <div className="crud-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={loading}
                    onClick={() => startEditing(poem)}
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    className="btn-delete"
                    disabled={loading}
                    onClick={() => handleDelete(poem)}
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