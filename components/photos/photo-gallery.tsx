'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Photo = {
  id: string
  description: string
  taken_at: string | null
  image_path: string
  created_at: string
}

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const supabase = createClient()
  const router = useRouter()

  const [urls, setUrls] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDescription, setEditDescription] = useState('')
  const [editTakenAt, setEditTakenAt] = useState('')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadUrls() {
      const entries = await Promise.all(
        photos.map(async (photo) => {
          const { data, error } = await supabase.storage
            .from('user-media')
            .createSignedUrl(photo.image_path, 60 * 10)

          if (error || !data?.signedUrl) return [photo.id, ''] as const

          return [photo.id, data.signedUrl] as const
        })
      )

      setUrls(Object.fromEntries(entries))
    }

    loadUrls()
  }, [photos, supabase])

  function startEditing(photo: Photo) {
    setEditingId(photo.id)
    setEditDescription(photo.description)
    setEditTakenAt(photo.taken_at || '')
    setError('')
  }

  function cancelEditing() {
    setEditingId(null)
    setEditDescription('')
    setEditTakenAt('')
    setError('')
  }

  async function handleUpdate(photoId: string) {
    if (!editDescription.trim()) {
      setError('A descrição da foto não pode ficar vazia.')
      return
    }

    try {
      setLoadingId(photoId)
      setError('')

      const { error } = await supabase
        .from('photos')
        .update({
          description: editDescription.trim(),
          taken_at: editTakenAt || null,
        })
        .eq('id', photoId)

      if (error) throw error

      cancelEditing()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar foto.')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDelete(photo: Photo) {
    const confirmed = window.confirm('Tem certeza que deseja excluir esta foto?')

    if (!confirmed) return

    try {
      setLoadingId(photo.id)
      setError('')

      const { error: storageError } = await supabase.storage
        .from('user-media')
        .remove([photo.image_path])

      if (storageError) throw storageError

      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photo.id)

      if (dbError) throw dbError

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir foto.')
    } finally {
      setLoadingId(null)
    }
  }

  if (!photos.length) {
    return <div className="card">Nenhuma foto ainda.</div>
  }

  return (
    <div className="gallery-wrapper">
      {error ? (
        <div className="card" style={{ color: 'crimson' }}>
          {error}
        </div>
      ) : null}

      <div className="gallery-grid">
        {photos.map((photo) => {
          const editing = editingId === photo.id
          const loading = loadingId === photo.id

          return (
            <article key={photo.id} className="gallery-item card">
              {urls[photo.id] ? (
                <img
                  src={urls[photo.id]}
                  alt={photo.description}
                  className="photo-img"
                />
              ) : (
                <div className="photo-loading-placeholder">
                  Carregando imagem...
                </div>
              )}

              {editing ? (
                <div className="grid">
                  <input
                    className="input-field"
                    type="text"
                    placeholder="Descrição da foto"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />

                  <input
                    className="input-field"
                    type="date"
                    value={editTakenAt}
                    onChange={(e) => setEditTakenAt(e.target.value)}
                  />

                  <div className="crud-actions">
                    <button
                      type="button"
                      className="btn-primary"
                      disabled={loading}
                      onClick={() => handleUpdate(photo.id)}
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
                  <div className="photo-info">
                    <p className="photo-desc">{photo.description}</p>
                    <span className="photo-date">
                      {photo.taken_at
                        ? new Date(`${photo.taken_at}T00:00:00`).toLocaleDateString('pt-BR')
                        : 'Sem data'}
                    </span>
                  </div>

                  <div className="crud-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      disabled={loading}
                      onClick={() => startEditing(photo)}
                    >
                      Editar
                    </button>

                    <button
                      type="button"
                      className="btn-delete"
                      disabled={loading}
                      onClick={() => handleDelete(photo)}
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
    </div>
  )
}