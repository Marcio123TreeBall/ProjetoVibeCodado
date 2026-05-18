import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const { currentPassword, newPassword, content } = await request.json()

    if (!newPassword) {
      return NextResponse.json(
        { error: 'Defina uma palavra-chave.' },
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

    const { data: existingSecret, error: findError } = await admin
      .from('secret_notes')
      .select('id, password_hash')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .maybeSingle()

    if (findError) {
      return NextResponse.json(
        { error: findError.message },
        { status: 500 }
      )
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    if (!existingSecret) {
      const { error } = await admin.from('secret_notes').insert({
        user_id: user.id,
        password_hash: passwordHash,
        content: content?.trim() || null,
      })

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    }

    const currentPasswordIsValid = await bcrypt.compare(
      currentPassword || '',
      existingSecret.password_hash
    )

    if (!currentPasswordIsValid) {
      return NextResponse.json(
        { error: 'Palavra-chave atual incorreta.' },
        { status: 403 }
      )
    }

    const { error } = await admin
      .from('secret_notes')
      .update({
        password_hash: passwordHash,
        content: content?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingSecret.id)
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
  console.error('Erro em /api/secret/save:', err)

  return NextResponse.json(
    {
      error:
        err instanceof Error
          ? err.message
          : 'Erro ao salvar segredo.',
    },
    { status: 500 }
  )
}
}