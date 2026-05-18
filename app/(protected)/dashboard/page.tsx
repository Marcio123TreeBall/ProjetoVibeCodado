import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardHero } from '@/components/dashboard/dashboard-hero'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    redirect('/login')
  }

  const [
    { data: photos },
    { data: profile },
  ] = await Promise.all([
    supabase
      .from('photos')
      .select('id, description, image_path')
      .order('created_at', { ascending: false })
      .limit(20),

    supabase
      .from('profiles')
      .select('display_name, relationship_start_date')
      .eq('id', auth.user.id)
      .maybeSingle(),
  ])

  const randomItems = [
    ...(photos ?? []).map((photo) => ({
      type: 'Foto',
      text: photo.description || 'Uma foto especial',
      href: `/photos/${photo.id}`,
    })),
  ]

  return (
    <main>
      <DashboardHero
        displayName={profile?.display_name || auth.user.email || 'você'}
        startDate={profile?.relationship_start_date ?? null}
        randomItems={randomItems}
      />

      <section className="quick-links">
        <h2>Explore</h2>

        <div className="links-grid">
          <Link href="/photos" className="link-card card">
            <span className="link-icon">📷</span>
            <span className="link-text">Nossa Galeria</span>
          </Link>

          <Link href="/poems" className="link-card card">
            <span className="link-icon">✍️</span>
            <span className="link-text">Poemas</span>
          </Link>

          <Link href="/letters" className="link-card card">
            <span className="link-icon">💌</span>
            <span className="link-text">Cartas</span>
          </Link>

          <Link href="/memories" className="link-card card">
            <span className="link-icon">⏳</span>
            <span className="link-text">Memórias</span>
          </Link>
        </div>
      </section>
    </main>
  )
}