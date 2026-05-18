'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const currentTheme = savedTheme || 'light'

    setTheme(currentTheme)

    document.body.classList.remove('light-mode', 'dark-mode')
    document.body.classList.add(currentTheme === 'dark' ? 'dark-mode' : 'light-mode')
  }, [])

  function toggleTheme() {
    const newTheme = theme === 'light' ? 'dark' : 'light'

    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)

    document.body.classList.remove('light-mode', 'dark-mode')
    document.body.classList.add(newTheme === 'dark' ? 'dark-mode' : 'light-mode')
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label="Alternar tema"
      title="Alternar tema"
    >
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}