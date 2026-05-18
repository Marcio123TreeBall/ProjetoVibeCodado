import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PhotoUploader } from '@/components/photos/photo-uploader'
import { PhotoGallery } from '@/components/photos/photo-gallery'

export default async function PhotosPage() {
  const supabase = await createClient()
  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    redirect('/login')
  }

  const { data: photos, error } = await supabase
    .from('photos')
    .select('id, description, taken_at, image_path, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return (
    <main className="container">
      <h1>Nossa Galeria</h1>
      <div className="grid" style={{ gap: 24 }}>
        <PhotoUploader userId={auth.user.id} />
        <PhotoGallery photos={photos ?? []} />
      </div>
    </main>
  )
}