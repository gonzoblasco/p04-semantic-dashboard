import { redirect } from 'next/navigation'
import { getSession } from '@/lib/actions/writing'
import { Editor } from '@/components/editor/Editor'

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { data: session } = await getSession(id)

  if (!session) {
    redirect('/dashboard')
  }

  return <Editor session={session} />
}
