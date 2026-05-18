'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Soundtrack = {
  id: string
  song_url: string
  description: string | null
  created_at: string
} | null

export function SoundtrackCard({
  userId,
  initialSoundtrack,
}: {
  userId: string
  initialSoundtrack: Soundtrack
}) {
  const router = useRouter()
  const supabase = createClient()

  const [songUrl, setSongUrl] = useState(initialSoundtrack?.song_url || '')
  const [description, setDescription] = useState(initialSoundtrack?.description || '')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function handleSave() {
    if (!songUrl.trim()) {
      setError('Adicione um link de música.')
      return
    }

    try {
      setLoading(true)
      setError('')
      setMessage('')

      if (initialSoundtrack?.id) {
        const { error } = await supabase
          .from('soundtracks')
          .update({
            song_url: songUrl.trim(),
            description: description.trim() || null,
          })
          .eq('id', initialSoundtrack.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('soundtracks').insert({
          user_id: userId,
          song_url: songUrl.trim(),
          description: description.trim() || null,
        })

        if (error) throw error
      }

      setMessage('Trilha sonora salva com sucesso.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar música.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!initialSoundtrack?.id) return

    const confirmed = window.confirm('Tem certeza que deseja remover esta trilha sonora?')

    if (!confirmed) return

    try {
      setDeleting(true)
      setError('')
      setMessage('')

      const { error } = await supabase
        .from('soundtracks')
        .delete()
        .eq('id', initialSoundtrack.id)

      if (error) throw error

      setSongUrl('')
      setDescription('')
      setMessage('Trilha sonora removida.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover música.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="section">
      <h2 className="section-title">Nossa Trilha Sonora</h2>

      <div className="music-player card">
        <div className="player-info">
          <p className="song-title">Nossa Música Especial</p>

          <div className="grid">
            <input
              type="text"
              className="input-field"
              placeholder="Cole aqui o link do Spotify ou YouTube"
              value={songUrl}
              onChange={(e) => setSongUrl(e.target.value)}
            />

            <textarea
              className="textarea-field"
              placeholder="Por que esta música é especial?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
            {message ? <p style={{ color: 'green' }}>{message}</p> : null}

            <div className="crud-actions">
              <button
                type="button"
                className="btn-primary"
                onClick={handleSave}
                disabled={loading || deleting}
              >
                {loading ? 'Salvando...' : initialSoundtrack ? 'Salvar alterações' : 'Salvar Música'}
              </button>

              {initialSoundtrack ? (
                <button
                  type="button"
                  className="btn-delete"
                  onClick={handleDelete}
                  disabled={loading || deleting}
                >
                  {deleting ? 'Removendo...' : 'Remover'}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="spotify-placeholder">
          {songUrl ? (
            <div className="soundtrack-preview">
              <p>Link salvo:</p>

              <a
                href={songUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
              >
                Abrir música
              </a>

              {description ? (
                <p className="song-desc" style={{ marginTop: 16 }}>
                  {description}
                </p>
              ) : null}
            </div>
          ) : (
            <p>Aqui aparecerá sua música quando você adicionar um link.</p>
          )}
        </div>
      </div>
    </section>
  )
}