import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json(
        { error: 'Digite a palavra-chave.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Não autenticado.' },
        { status: 401 }
      )
    }

    const admin = createAdminClient()

    const { data: secret, error } = await admin
      .from('secret_notes')
      .select('id, password_hash, content')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!secret) {
      return NextResponse.json(
        { error: 'Nenhum segredo encontrado.' },
        { status: 404 }
      )
    }

    const isValid = await bcrypt.compare(password, secret.password_hash)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Palavra-chave incorreta.' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      id: secret.id,
      content: secret.content ?? '',
    })
  } catch {
    return NextResponse.json(
      { error: 'Erro ao desbloquear segredo.' },
      { status: 500 }
    )
  }
}