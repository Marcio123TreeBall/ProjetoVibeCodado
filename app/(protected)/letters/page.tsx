import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LetterForm } from '@/components/letters/letter-form'
import { LettersList } from '@/components/letters/letters-list'
import { NowMessageCard } from '@/components/letters/now-message-card'
import { LikesCard } from '@/components/letters/likes-card'
import { ThoughtsCard } from '@/components/letters/thoughts-card'

export default async function LettersPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    redirect('/login')
  }

  const [
    { data: letters, error: lettersError },
    { data: nowMessages, error: nowError },
    { data: likes, error: likesError },
    { data: thoughts, error: thoughtsError },
  ] = await Promise.all([
    supabase
      .from('letters')
      .select('id, title, content, letter_date, created_at')
      .order('created_at', { ascending: false }),

    supabase
      .from('now_messages')
      .select('id, content, created_at')
      .order('created_at', { ascending: false })
      .limit(1),

    supabase
      .from('likes')
      .select('id, content, created_at')
      .order('created_at', { ascending: false }),

    supabase
      .from('thoughts')
      .select('id, content, created_at')
      .order('created_at', { ascending: false }),
  ])

  const error = lettersError || nowError || likesError || thoughtsError
  if (error) {
    throw new Error(error.message)
  }

  return (
    <main className="container">
      <section className="section">
        <h2 className="section-title">Cartas e Recados</h2>
        <div className="grid" style={{ gap: 24 }}>
          <LetterForm userId={auth.user.id} />
          <LettersList letters={letters ?? []} />
        </div>
      </section>

      <NowMessageCard
        userId={auth.user.id}
        initialMessage={nowMessages?.[0] ?? null}
      />

      <LikesCard
        userId={auth.user.id}
        initialLikes={likes ?? []}
      />

      <ThoughtsCard
        userId={auth.user.id}
        initialThoughts={thoughts ?? []}
      />
    </main>
  )
}