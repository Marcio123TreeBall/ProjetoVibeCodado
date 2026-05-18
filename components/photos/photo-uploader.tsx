'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function PhotoUploader({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const [file, setFile] = useState<File | null>(null)
  const [description, setDescription] = useState('')
  const [takenAt, setTakenAt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!file) {
      setError('Selecione uma imagem.')
      return
    }

    if (!description.trim()) {
      setError('Adicione uma descrição para a foto.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const photoId = crypto.randomUUID()
      const fileExt = file.name.split('.').pop() || 'jpg'
      const filePath = `${userId}/photos/${photoId}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('user-media')
        .upload(filePath, file, {
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { error: dbError } = await supabase.from('photos').insert({
        id: photoId,
        user_id: userId,
        description: description.trim(),
        taken_at: takenAt || null,
        image_path: filePath,
      })

      if (dbError) throw dbError

      setDescription('')
      setTakenAt('')
      setFile(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar foto.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>Adicionar foto</h2>

      <div className="gallery-controls">
        <input
          className="input-field"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
        />

        <input
          className="input-field"
          type="text"
          placeholder="Descrição da foto"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <input
          className="input-field"
          type="date"
          value={takenAt}
          onChange={(e) => setTakenAt(e.target.value)}
        />

        <button className="btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : 'Adicionar foto'}
        </button>
      </div>

      {error ? <p style={{ color: 'crimson', textAlign: 'center' }}>{error}</p> : null}
    </form>
  )
}