import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function PhotoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()

  const { data: auth } = await supabase.auth.getUser()

  if (!auth.user) {
    redirect('/login')
  }

  const { data: photo, error } = await supabase
    .from('photos')
    .select('id, description, taken_at, image_path')
    .eq('id', id)
    .eq('user_id', auth.user.id)
    .maybeSingle()

  if (error || !photo) {
    notFound()
  }

  const { data: signedUrlData } = await supabase.storage
    .from('user-media')
    .createSignedUrl(photo.image_path, 60 * 10)

  return (
    <main className="container">
      <section className="section photo-detail-section">
        <Link href="/dashboard" className="btn-secondary">
          Voltar
        </Link>

        <div className="card photo-detail-card">
          {signedUrlData?.signedUrl ? (
            <img
              src={signedUrlData.signedUrl}
              alt={photo.description}
              className="photo-detail-image"
            />
          ) : (
            <div className="photo-loading-placeholder">
              Não foi possível carregar a imagem.
            </div>
          )}

          <div className="photo-detail-info">
            <h1>{photo.description}</h1>

            <p>
              {photo.taken_at
                ? new Date(`${photo.taken_at}T00:00:00`).toLocaleDateString('pt-BR')
                : 'Sem data'}
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}