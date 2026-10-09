import {createHash} from 'node:crypto';
import {createSession,sessionCookie,verifyPassword} from '@/lib/auth.mjs';
import {execute} from '@/lib/database.mjs';
import {sameOrigin,fail} from '@/lib/store';
export const runtime='nodejs';
export async function POST(request:Request){try{
 if(!sameOrigin(request))return Response.json({error:'Невірний запит'},{status:403});
 const body=await request.json();if(typeof body.password!=='string'||body.password.length>256)return Response.json({error:'Невірний пароль'},{status:400});
 const window=Math.floor(Date.now()/900000);const ip=request.headers.get('x-forwarded-for')?.split(',')[0].trim()||'unknown';
 for(const [key,limit] of [['global',30],[createHash('sha256').update(ip).digest('hex'),5]] as const){
 const {rows}=await execute('INSERT INTO login_limits(id,window,attempts) VALUES(?,?,1) ON CONFLICT(id) DO UPDATE SET attempts=CASE WHEN login_limits.window=excluded.window THEN login_limits.attempts+1 ELSE 1 END,window=excluded.window RETURNING attempts',[key,window]);
 if(rows[0].attempts>limit)return Response.json({error:'Забагато спроб. Спробуйте через 15 хвилин.'},{status:429});}
 if(!verifyPassword(body.password))return Response.json({error:'Невірний пароль'},{status:401});
 return Response.json({ok:true},{headers:{'Set-Cookie':sessionCookie(createSession()),'Cache-Control':'no-store'}});
 }catch(e){return fail(e)}}
