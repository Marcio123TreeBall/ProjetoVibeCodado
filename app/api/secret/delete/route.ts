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

    const { data: secret, error: findError } = await admin
      .from('secret_notes')
      .select('id, password_hash')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .maybeSingle()

    if (findError) {
      return NextResponse.json({ error: findError.message }, { status: 500 })
    }

    if (!secret) {
      return NextResponse.json({ success: true })
    }

    const isValid = await bcrypt.compare(password, secret.password_hash)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Palavra-chave incorreta.' },
        { status: 403 }
      )
    }

    const { error } = await admin
      .from('secret_notes')
      .delete()
      .eq('id', secret.id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Erro ao remover segredo.' },
      { status: 500 }
    )
  }
}