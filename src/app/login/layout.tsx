export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen grid grid-rows-1 w-full bg-zinc-100">
      {children}
    </main>
  )
}
