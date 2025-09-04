import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const now = await prisma.$queryRaw<{ now: Date }[]>`select now()`
    return NextResponse.json({ status: 'ok', dbTime: now[0]?.now })
}