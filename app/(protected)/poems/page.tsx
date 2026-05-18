import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PoemUploader } from '@/components/poems/poem-uploader'
import { PoemsList } from '@/components/poems/poems-list'

export default async function PoemsPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    redirect('/login')
  }

  const { data: poems, error } = await supabase
    .from('poems')
    .select('id, title, content, image_path, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (
    <main className="container">
      <h1>Poemas</h1>
      <div className="grid" style={{ gap: 24 }}>
        <PoemUploader userId={auth.user.id} />
        <PoemsList poems={poems ?? []} />
      </div>
    </main>
  )
}