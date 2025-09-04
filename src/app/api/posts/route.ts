import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET() {
    const posts = await prisma.post.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json(posts)
}

export async function POST(req: Request) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await req.json()
    if (!body?.title) {
        return NextResponse.json({ error: 'title required' }, { status: 400 })
    }
    const post = await prisma.post.create({
        data: {
            title: body.title,
            content: body.content ?? null,
            published: body.published ?? false,
            authorId: (session.user as any).id,
        },
    })
    return NextResponse.json(post, { status: 201 })
}