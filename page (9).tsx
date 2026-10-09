import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cookieName, verifySession } from '@/lib/auth.mjs';
import Login from './login';
export const dynamic='force-dynamic';
export default async function Page(){if(verifySession((await cookies()).get(cookieName)?.value))redirect('/admin');return <Login/>}
