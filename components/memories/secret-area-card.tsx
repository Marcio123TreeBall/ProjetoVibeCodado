'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SecretAreaCard({
  userId,
  initialHasSecret,
  initialUpdatedAt,
}: {
  userId: string
  initialHasSecret: boolean
  initialUpdatedAt: string | null
}) {
  const router = useRouter()

  const [hasSecret, setHasSecret] = useState(initialHasSecret)
  const [open, setOpen] = useState(false)
  const [authorized, setAuthorized] = useState(false)

  const [password, setPassword] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [content, setContent] = useState('')

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function closeModal() {
    setOpen(false)
    setAuthorized(false)
    setPassword('')
    setCurrentPassword('')
    setNewPassword('')
    setContent('')
    setError('')
    setMessage('')
  }

  async function handleUnlock() {
    if (!password.trim()) {
      setError('Digite a palavra-chave.')
      return
    }

    try {
      setLoading(true)
      setError('')
      setMessage('')

      const response = await fetch('/api/secret/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao desbloquear segredo.')
      }

      setAuthorized(true)
      setCurrentPassword(password)
      setNewPassword(password)
      setContent(result.content || '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao desbloquear segredo.')
    } finally {
      setLoading(false)
    }
  }

  function handleCreateMode() {
    setAuthorized(true)
    setNewPassword('')
    setContent('')
    setError('')
    setMessage('')
  }

  async function handleSave() {
    if (!newPassword.trim()) {
      setError('Defina uma palavra-chave.')
      return
    }

    try {
      setLoading(true)
      setError('')
      setMessage('')

      const response = await fetch('/api/secret/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: hasSecret ? currentPassword : null,
          newPassword,
          content,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar segredo.')
      }

      setHasSecret(true)
      setCurrentPassword(newPassword)
      setPassword(newPassword)
      setMessage('Segredo salvo com segurança.')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar segredo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    const passwordToUse = currentPassword || password

    if (!passwordToUse.trim()) {
      setError('Digite a palavra-chave para remover.')
      return
    }

    const confirmed = window.confirm('Tem certeza que deseja remover a página secreta?')
    if (!confirmed) return

    try {
      setDeleting(true)
      setError('')
      setMessage('')

      const response = await fetch('/api/secret/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: passwordToUse,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao remover segredo.')
      }

      setHasSecret(false)
      closeModal()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover segredo.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="section">
      <h2 className="section-title">Página Secreta</h2>

      <div className="secret-area card">
        <p>
          {hasSecret
            ? 'Há algo escondido aqui...'
            : 'Nenhuma página secreta foi criada ainda.'}
        </p>

        {hasSecret && initialUpdatedAt ? (
          <p style={{ opacity: 0.7, fontSize: '0.9rem', marginTop: 8 }}>
            Última atualização:{' '}
            {new Date(initialUpdatedAt).toLocaleDateString('pt-BR')}
          </p>
        ) : null}

        <button className="btn-secondary" onClick={() => setOpen(true)}>
          {hasSecret ? 'Desbloquear' : 'Criar página secreta'}
        </button>
      </div>

      {open ? (
        <div className="modal">
          <div className="modal-content card">
            <span className="close-modal" onClick={closeModal}>
              &times;
            </span>

            <h3>Área Reservada</h3>

            {!authorized ? (
              <div id="password-area">
                {hasSecret ? (
                  <>
                    <p>Digite a palavra-chave:</p>

                    <input
                      type="password"
                      className="input-field"
                      placeholder="..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                    <button
                      className="btn-primary"
                      onClick={handleUnlock}
                      disabled={loading}
                    >
                      {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                  </>
                ) : (
                  <>
                    <p>Nenhum segredo existe ainda.</p>

                    <button className="btn-primary" onClick={handleCreateMode}>
                      Criar agora
                    </button>
                  </>
                )}

                {error ? (
                  <p style={{ color: 'crimson', marginTop: 12 }}>
                    {error}
                  </p>
                ) : null}
              </div>
            ) : (
              <div id="secret-content">
                <h4>Para seus olhos apenas</h4>

                <div className="grid">
                  <input
                    type="password"
                    className="input-field"
                    placeholder="Nova palavra-chave"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />

                  <textarea
                    className="textarea-field"
                    placeholder="Escreva aqui seus segredos mais profundos..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />

                  {content ? (
                    <div id="secret-display">
                      {content}
                    </div>
                  ) : null}

                  {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
                  {message ? <p style={{ color: 'green' }}>{message}</p> : null}

                  <div className="crud-actions">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleSave}
                      disabled={loading || deleting}
                    >
                      {loading ? 'Salvando...' : 'Salvar segredo'}
                    </button>

                    {hasSecret ? (
                      <button
                        type="button"
                        className="btn-delete"
                        onClick={handleDelete}
                        disabled={loading || deleting}
                      >
                        {deleting ? 'Removendo...' : 'Remover'}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  )
}