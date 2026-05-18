'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Profile = {
  id: string
  display_name: string | null
  bio: string | null
  avatar_path: string | null
  surprise_photo_path: string | null
  relationship_start_date?: string | null
} | null

export function ProfileForm({
  userId,
  initialProfile,
}: {
  userId: string
  initialProfile: Profile
}) {
  const supabase = createClient()
  const router = useRouter()

  const [displayName, setDisplayName] = useState(initialProfile?.display_name || '')
  const [bio, setBio] = useState(initialProfile?.bio || '')
  const [relationshipStartDate, setRelationshipStartDate] = useState(
    initialProfile?.relationship_start_date || ''
  )

  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [removeAvatar, setRemoveAvatar] = useState(false)
  const [surpriseFile, setSurpriseFile] = useState<File | null>(null)
  const [surprisePreview, setSurprisePreview] = useState<string | null>(null)
  const [surpriseUrl, setSurpriseUrl] = useState<string | null>(null)
  const [removeSurprisePhoto, setRemoveSurprisePhoto] = useState(false)

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    let objectUrl: string | null = null

    async function loadAvatar() {
      if (!initialProfile?.avatar_path) return

      const { data, error } = await supabase.storage
        .from('avatars')
        .createSignedUrl(initialProfile.avatar_path, 60 * 60)

      if (!error && data?.signedUrl) {
        setAvatarUrl(data.signedUrl)
      }

      if (initialProfile?.surprise_photo_path) {
        const { data, error } = await supabase.storage
       .from('user-media')
       .createSignedUrl(initialProfile.surprise_photo_path, 60 * 60)

      if (!error && data?.signedUrl) {
        setSurpriseUrl(data.signedUrl)
        }
      }
    }

    loadAvatar()

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [initialProfile?.avatar_path, supabase])

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    setAvatarFile(file)
    setRemoveAvatar(false)

    if (file) {
      const preview = URL.createObjectURL(file)
      setAvatarPreview(preview)
    }
  }

  function handleRemoveAvatar() {
    setAvatarFile(null)
    setAvatarPreview(null)
    setAvatarUrl(null)
    setRemoveAvatar(true)
  }

  function handleSurprisePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
  const file = e.target.files?.[0] || null
  setSurpriseFile(file)
  setRemoveSurprisePhoto(false)

  if (file) {
    const preview = URL.createObjectURL(file)
    setSurprisePreview(preview)
  }
}

function handleRemoveSurprisePhoto() {
  setSurpriseFile(null)
  setSurprisePreview(null)
  setSurpriseUrl(null)
  setRemoveSurprisePhoto(true)
}
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      setLoading(true)
      setError('')
      setMessage('')

      let avatarPath = initialProfile?.avatar_path || null
      let surprisePhotoPath = initialProfile?.surprise_photo_path || null

      if (removeAvatar && initialProfile?.avatar_path) {
        await supabase.storage.from('avatars').remove([initialProfile.avatar_path])
        avatarPath = null
      }

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop() || 'png'
        const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true })

        if (uploadError) throw uploadError

        if (initialProfile?.avatar_path) {
          await supabase.storage.from('avatars').remove([initialProfile.avatar_path])
        }

        avatarPath = filePath

        let surprisePhotoPath = initialProfile?.surprise_photo_path || null


}

if (removeSurprisePhoto && initialProfile?.surprise_photo_path) {
  await supabase.storage
    .from('user-media')
    .remove([initialProfile.surprise_photo_path])

  surprisePhotoPath = null
  
if (surpriseFile) {
  const fileExt = surpriseFile.name.split('.').pop() || 'jpg'
  const filePath = `${userId}/surprise/surprise-${Date.now()}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('user-media')
    .upload(filePath, surpriseFile, {
      upsert: false,
    })

      if (uploadError) throw uploadError
    
      if (initialProfile?.surprise_photo_path) {
        await supabase.storage
          .from('user-media')
          .remove([initialProfile.surprise_photo_path])
      }
    
      surprisePhotoPath = filePath
        }
      }

      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        display_name: displayName,
        bio,
        relationship_start_date: relationshipStartDate || null,
        avatar_path: avatarPath,
        surprise_photo_path: surprisePhotoPath,
      })

      if (error) throw error

      setMessage('Perfil atualizado com sucesso.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil.')
    } finally {
      setLoading(false)
    }
  }

  const finalAvatar = avatarPreview || avatarUrl
  const initial = displayName?.trim()?.charAt(0)?.toUpperCase() || '♡'

  return (
    <form onSubmit={handleSubmit} className="card profile-form-card">
      <div className="grid">
        <div className="profile-avatar-section">
          <div className="profile-avatar-preview">
            {finalAvatar ? (
              <img
                src={finalAvatar}
                className="profile-avatar-image"
                alt="Foto de perfil"
              />
            ) : (
              <div className="profile-avatar-fallback">{initial}</div>
            )}
          </div>

          <div className="profile-avatar-actions">
            <div className="profile-avatar-buttons">
              <label className="profile-avatar-button">
                {finalAvatar ? 'Mudar foto' : 'Adicionar foto'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  hidden
                />
              </label>

              {finalAvatar ? (
                <button
                  type="button"
                  className="profile-avatar-remove"
                  onClick={handleRemoveAvatar}
                >
                  Remover foto
                </button>
              ) : null}
            </div>

            <span className="profile-avatar-help">
              Essa imagem será exibida no seu perfil e na navbar.
            </span>
          </div>
        </div>

        <input
          className="input-field"
          type="text"
          placeholder="Nome"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />

        <textarea
          className="textarea-field"
          placeholder="Escreva algo..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <div className="card" style={{ padding: '1rem' }}>
          <label style={{ marginBottom: 8, display: 'block' }}>
            Data do relacionamento
          </label>

          <input
            className="input-field"
            type="date"
            value={relationshipStartDate}
            onChange={(e) => setRelationshipStartDate(e.target.value)}
          />
        </div>

        {error && <p style={{ color: 'crimson' }}>{error}</p>}
        {message && <p style={{ color: 'green' }}>{message}</p>}

        <button className="btn-primary" disabled={loading}>
          {loading ? 'Salvando...' : 'Salvar perfil'}
        </button>

        <details className="hidden-profile-settings">
  <summary>Configurações especiais</summary>

  <div className="hidden-profile-content">
    <h3>Foto surpresa</h3>

    <p>
      Essa foto não aparece na galeria. Ela pode aparecer raramente quando clicar em
      “Me mostra algo”.
    </p>

    <div className="surprise-photo-box">
      {surprisePreview || surpriseUrl ? (
        <img
          src={surprisePreview || surpriseUrl || ''}
          alt="Foto surpresa"
          className="surprise-photo-preview"
        />
      ) : (
        <div className="surprise-photo-placeholder">
          Nenhuma foto surpresa adicionada.
        </div>
      )}

      <div className="profile-avatar-buttons">
        <label className="profile-avatar-button">
          {surprisePreview || surpriseUrl ? 'Trocar foto surpresa' : 'Adicionar foto surpresa'}
          <input
            type="file"
            accept="image/*"
            onChange={handleSurprisePhotoChange}
            hidden
          />
        </label>

        {surprisePreview || surpriseUrl ? (
          <button
            type="button"
            className="profile-avatar-remove"
            onClick={handleRemoveSurprisePhoto}
          >
            Remover foto surpresa
          </button>
        ) : null}
      </div>
    </div>
  </div>
</details>
      </div>
    </form>
  )
}