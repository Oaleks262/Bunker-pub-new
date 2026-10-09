import {sessionCookie} from '@/lib/auth.mjs';
import {sameOrigin} from '@/lib/store';
export async function POST(request:Request){if(!sameOrigin(request))return Response.json({error:'Невірний запит'},{status:403});return Response.json({ok:true},{headers:{'Set-Cookie':sessionCookie('',0),'Cache-Control':'no-store'}});}
