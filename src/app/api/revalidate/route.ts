import { revalidatePath, revalidateTag } from 'next/cache'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const secret = body?.secret
    if (!secret || secret !== process.env.REVALIDATE_SECRET) {
      return new Response(JSON.stringify({ ok: false, message: 'Invalid secret' }), { status: 401 })
    }

    const paths: string[] = []
    if (body?.path) paths.push(body.path)
    if (Array.isArray(body?.paths)) paths.push(...body.paths)

    for (const p of paths) {
      try {
        revalidatePath(p)
      } catch (err) {
        console.warn('revalidatePath failed for', p, err)
      }
    }

    if (body?.tag) {
      try {
        revalidateTag(body.tag)
      } catch (err) {
        console.warn('revalidateTag failed for', body.tag, err)
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, message: err?.message || String(err) }), { status: 500 })
  }
}

export const runtime = 'nodejs'
