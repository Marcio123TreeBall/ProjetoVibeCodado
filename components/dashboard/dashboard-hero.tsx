'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type RandomItem = {
  type: string
  text: string
  href: string
}

const quotes = [
  '“Algumas memórias aquecem o coração só de existir.”',
  '“Existem pessoas que transformam o comum em especial.”',
  '“O amor mora nos detalhes mais simples.”',
  '“Entre tantas coisas bonitas, você continua sendo minha favorita.”',
  '“Que este cantinho guarde tudo aquilo que o coração não quer esquecer.”',
  '“Tem dias que só lembrar de você já deixa tudo melhor.”',
]

const affectionateMessages = [
  'Só passando para lembrar que você é uma das melhores partes da minha vida.',
  'Tem coisas que não precisam de motivo para serem especiais. Você é uma delas.',
  'Hoje eu só queria te lembrar o quanto você é importante para mim.',
  'Alguns dias ficam mais bonitos só porque você existe neles.',
  'Você é aquele tipo de lembrança que deixa o coração mais calmo.',
  'Entre tantas coisas no mundo, você continua sendo uma das minhas favoritas.',
  'Espero que esse cantinho te faça sorrir um pouquinho hoje.',
  'Você merece carinho até nos detalhes mais simples.',
  'Se eu pudesse guardar um sentimento em um lugar, seria aqui.',
  'Às vezes, tudo que eu queria era te lembrar do quanto você é especial.',
  'Esse refúgio existe porque algumas pessoas merecem ser lembradas com amor.',
  'Que essa pequena surpresa deixe seu dia um pouco mais leve.',
]

export function DashboardHero({
  displayName,
  startDate,
  randomItems,
}: {
  displayName: string
  startDate: string | null
  randomItems: RandomItem[]
}) {
  const router = useRouter()

  const [timerText, setTimerText] = useState(
    'Adicione uma data no perfil para começar o contador.'
  )
  const [randomResult, setRandomResult] = useState<RandomItem | null>(null)

  const quote = useMemo(() => {
    const day = new Date().getDate()
    return quotes[day % quotes.length]
  }, [])

  useEffect(() => {
    if (!startDate) {
      setTimerText('Adicione uma data no perfil para começar o contador.')
      return
    }

    function updateTimer() {
      const start = new Date(`${startDate}T00:00:00`).getTime()
      const now = new Date().getTime()
      const diff = now - start

      if (diff < 0) {
        setTimerText('A data escolhida ainda não chegou.')
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((diff / (1000 * 60)) % 60)
      const seconds = Math.floor((diff / 1000) % 60)

      setTimerText(
        `${days} dias, ${hours} horas, ${minutes} minutos e ${seconds} segundos`
      )
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [startDate])

  function handleRandom() {
    const photos = randomItems.filter((item) => item.type === 'Foto')
    const shouldOpenPhoto = Math.floor(Math.random() * 12) === 0

    if (shouldOpenPhoto && photos.length > 0) {
      const randomPhoto = photos[Math.floor(Math.random() * photos.length)]
      router.push(randomPhoto.href)
      return
    }

    const randomMessage =
      affectionateMessages[Math.floor(Math.random() * affectionateMessages.length)]

    setRandomResult({
      type: 'Mensagem',
      text: randomMessage,
      href: '#',
    })
  }

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <h1>
            Bem-vindo(a), {displayName}, ao cantinho onde nossas memórias vivem
            com carinho
          </h1>

          <p className="daily-quote">{quote}</p>

          <div className="counter-container">
            <p className="counter-label">Estamos juntos há:</p>

            <div className="timer">{timerText}</div>

            <div className="dashboard-date-box">
              {startDate ? (
                <p className="dashboard-date-text">
                  Data escolhida:{' '}
                  <strong>
                    {new Date(`${startDate}T00:00:00`).toLocaleDateString(
                      'pt-BR'
                    )}
                  </strong>
                </p>
              ) : (
                <p className="dashboard-date-text">
                  Nenhuma data adicionada ainda.
                </p>
              )}
            </div>

            <div className="dashboard-date-action">
              <Link href="/profile" className="btn-secondary">
                {startDate ? 'Alterar data' : 'Adicionar data'}
              </Link>
            </div>
          </div>

          <div className="cta-buttons">
            <Link href="/profile" className="btn-primary">
              Conhecer Você
            </Link>

            <button type="button" className="btn-secondary" onClick={handleRandom}>
              Me mostra algo
            </button>
          </div>
        </div>
      </section>

      {randomResult ? (
        <div className="random-display fade-in">
          <strong>{randomResult.type}:</strong>{' '}
          <span>{randomResult.text}</span>
        </div>
      ) : null}
    </>
  )
}