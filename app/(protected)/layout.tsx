import Link from 'next/link'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { ProfileMenu } from '@/components/profile/profile-menu'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <nav className="site-nav">
        <Link href="/dashboard" className="site-nav__brand">
          Especial
        </Link>

        <div className="site-nav__links">
          <Link href="/photos">Fotos</Link>
          <Link href="/poems">Poemas</Link>
          <Link href="/letters">Cartas</Link>
          <Link href="/memories">Memórias</Link>
        </div>

        <div className="site-nav__actions">
          <ThemeToggle />
          <ProfileMenu />
        </div>
      </nav>

      <main className="container">{children}</main>

      <footer className="site-footer">
        <p>Feito com carinho para alguém especial ♥</p>
      </footer>
    </>
  )
}