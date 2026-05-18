import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="container">
      <div className="card">
        <h1>Meu Amor</h1>
        <p>Projeto conectado com Supabase.</p>

        <div className="grid" style={{ marginTop: 16 }}>
          <Link href="/login">Login</Link>
          <Link href="/register">Criar conta</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/profile">Perfil</Link>
          <Link href="/photos">Fotos</Link>
          <Link href="/poems">Poemas</Link>
          <Link href="/letters">Cartas</Link>
          <Link href="/memories">Memórias</Link>
        </div>
      </div>
    </main>
  )
}