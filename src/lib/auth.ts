import { getServerSession } from 'next-auth'
export async function getSession() {
    return getServerSession()
}