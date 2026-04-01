import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSessions, createSession } from '@/lib/actions/writing'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function handleCreateSession() {
  'use server'
  const { data, error } = await createSession('Sin título')
  if (error || !data) return
  redirect(`/dashboard/${data.id}`)
}

export default async function DashboardPage() {
  const { data: sessions } = await getSessions()

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mis sesiones</h1>
        <form action={handleCreateSession}>
          <Button type="submit">Nueva sesión</Button>
        </form>
      </div>

      {!sessions || sessions.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center text-muted-foreground">
          <p className="text-lg">No tenés sesiones todavía.</p>
          <form action={handleCreateSession}>
            <Button type="submit">Crear primera sesión</Button>
          </form>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {sessions.map((session) => (
            <li key={session.id}>
              <Link href={`/dashboard/${session.id}`} className="block">
                <Card className="transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base">{session.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground">
                    Actualizado:{' '}
                    {new Date(session.updated_at).toLocaleString('es-AR', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
