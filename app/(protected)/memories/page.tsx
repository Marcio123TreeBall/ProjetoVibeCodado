import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MemoryForm } from '@/components/memories/memory-form'
import { MemoriesList } from '@/components/memories/memories-list'
import { SoundtrackCard } from '@/components/memories/soundtrack-card'
import { SecretAreaCard } from '@/components/memories/secret-area-card'

type SecretInfo = {
  has_secret: boolean
  updated_at: string | null
} | null

export default async function MemoriesPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    redirect('/login')
  }

  const [
    { data: memories, error: memoriesError },
    { data: soundtrack, error: soundtrackError },
    { data: secretMeta, error: secretError },
  ] = await Promise.all([
    supabase
      .from('memories')
      .select('id, title, description, memory_date, created_at')
      .order('memory_date', { ascending: false }),

    supabase
      .from('soundtracks')
      .select('id, song_url, description, created_at')
      .order('created_at', { ascending: false })
      .limit(1),

    supabase
      .rpc('get_secret_note_meta')
      .maybeSingle(),
  ])

  const error = memoriesError || soundtrackError || secretError

  if (error) {
    throw new Error(error.message)
  }

  const secretInfo = secretMeta as SecretInfo

  return (
    <main className="container">
      <section className="section">
        <h2 className="section-title">Nossa Linha do Tempo</h2>

        <div className="grid" style={{ gap: 24 }}>
          <MemoryForm userId={auth.user.id} />
          <MemoriesList memories={memories ?? []} />
        </div>
      </section>

      <SoundtrackCard
        userId={auth.user.id}
        initialSoundtrack={soundtrack?.[0] ?? null}
      />

      <SecretAreaCard
        userId={auth.user.id}
        initialHasSecret={secretInfo?.has_secret ?? false}
        initialUpdatedAt={secretInfo?.updated_at ?? null}
      />
    </main>
  )
}