import { createClient } from '@/lib/supabase/server'

export default async function TestPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')

  return (
    <main style={{ padding: 24 }}>
      <h1>Teste Supabase</h1>
      <pre>{JSON.stringify({ data, error }, null, 2)}</pre>
    </main>
  )
}