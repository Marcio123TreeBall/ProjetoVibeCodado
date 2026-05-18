'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function PoemUploader({ userId }: { userId: string }) {
  const router = useRouter()
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!content.trim()) {
      setError('Escreva o poema.')
      return
    }

    try {
      setLoading(true)
      setError('')

      const poemId = crypto.randomUUID()
      let imagePath: string | null = null

      if (file) {
        const fileExt = file.name.split('.').pop() || 'jpg'
        const filePath = `${userId}/poems/${poemId}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('user-media')
          .upload(filePath, file, { upsert: false })

        if (uploadError) {
          throw uploadError
        }

        imagePath = filePath
      }

      const { error: dbError } = await supabase.from('poems').insert({
        id: poemId,
        user_id: userId,
        title: title || null,
        content,
        image_path: imagePath,
      })

      if (dbError) {
        throw dbError
      }

      setTitle('')
      setContent('')
      setFile(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar poema.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h2>Adicionar poema</h2>
      <div className="grid">
        <input
          className="input"
          type="text"
          placeholder="Título (opcional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="textarea"
          placeholder="Escreva seu poema..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />

        <input
          className="input"
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}

        <button className="button" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar poema'}
        </button>
      </div>
    </form>
  )
}