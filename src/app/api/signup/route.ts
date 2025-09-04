import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcrypt'

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json() as { email: string; password: string; name?: string }
        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
        }
        const normalizedEmail = email.trim().toLowerCase()
        const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
        if (existing) {
            return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
        }
        const passwordHash = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({ data: { email: normalizedEmail, name: name ?? null, passwordHash } })
        return NextResponse.json({ id: user.id, email: user.email, name: user.name }, { status: 201 })
    } catch (e) {
        console.error(e)
        return NextResponse.json({ error: 'Signup failed' }, { status: 500 })
    }
}