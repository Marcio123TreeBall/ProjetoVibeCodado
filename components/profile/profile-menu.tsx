'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { User, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function ProfileMenu() {
  const [open, setOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string>('')
  const [loadingAvatar, setLoadingAvatar] = useState(true)

  const menuRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    async function loadProfile() {
      setLoadingAvatar(true)
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoadingAvatar(false)
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('avatar_path, display_name')
        .eq('id', user.id)
        .maybeSingle()

      if (error || !profile) {
        setLoadingAvatar(false)
        return
      }

      setDisplayName(profile.display_name || '')

      if (profile.avatar_path) {
        const { data, error: signedUrlError } = await supabase.storage
          .from('avatars')
          .createSignedUrl(profile.avatar_path, 60 * 60)

        if (!signedUrlError && data?.signedUrl) {
          setAvatarUrl(data.signedUrl)
        } else {
          setAvatarUrl(null)
        }
      } else {
        setAvatarUrl(null)
      }

      setLoadingAvatar(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    loadProfile()

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/login')
    router.refresh()
  }

  const initial = displayName?.trim()?.charAt(0)?.toUpperCase() || '♡'

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        type="button"
        className="profile-icon"
        aria-label="Abrir menu de perfil"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {loadingAvatar ? (
          <div className="avatar-skeleton" />
        ) : avatarUrl ? (
          <img src={avatarUrl} alt="Avatar do perfil" className="avatar-img" />
        ) : (
          <div className="avatar-initial">{initial}</div>
        )}
      </button>

      {open ? (
        <div className="profile-menu__dropdown">
          <Link
            href="/profile"
            className="profile-menu__item"
            onClick={() => setOpen(false)}
          >
            <User size={16} />
            <span>Meu perfil</span>
          </Link>

          <button
            type="button"
            className="profile-menu__item profile-menu__logout"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Sair da conta</span>
          </button>
        </div>
      ) : null}
    </div>
  )
}