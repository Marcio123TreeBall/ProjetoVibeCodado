'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type NowMessage = {
  id: string
  content: string
  created_at: string
} | null

export function NowMessageCard({
  userId,
  initialMessage,
}: {
  userId: string
  initialMessage: NowMessage
}) {
  const router = useRouter()
  const supabase = createClient()

  const [content, setContent] = useState(initialMessage?.content || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    if (!content.trim()) return

    try {
      setLoading(true)
      setError('')

      if (initialMessage?.id) {
        const { error } = await supabase
          .from('now_messages')
          .update({ content })
          .eq('id', initialMessage.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from('now_messages').insert({
          user_id: userId,
          content,
        })

        if (error) throw error
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar pensamento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section">
      <h2 className="section-title">Se eu pudesse te dizer agora...</h2>

      <div className="now-message card">
        <textarea
          className="textarea-field"
          placeholder="Seus pensamentos espontâneos..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div style={{ marginTop: 16 }}>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Pensamento'}
          </button>
        </div>

        {error ? <p style={{ color: 'crimson', marginTop: 12 }}>{error}</p> : null}

        {content ? <div className="now-display">{content}</div> : null}
      </div>
    </section>
  )
}