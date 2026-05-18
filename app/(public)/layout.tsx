import { ThemeToggle } from '@/components/theme/theme-toggle'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px' }}>
        <ThemeToggle />
      </div>
      {children}
    </>
  )
}