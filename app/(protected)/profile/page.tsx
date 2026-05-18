import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from '@/components/profile/profile-form'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    redirect('/login')
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, display_name, bio, avatar_path, surprise_photo_path, relationship_start_date, created_at')
    .eq('id', auth.user.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return (
    <main className="container">
      <h1 className="section-title">Meu perfil</h1>

      <div className="grid" style={{ maxWidth: 720, margin: '0 auto' }}>
        <ProfileForm
          userId={auth.user.id}
          initialProfile={profile}
        />
      </div>
    </main>
  )
}