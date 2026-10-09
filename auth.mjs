import {scryptSync,createHmac,timingSafeEqual,createHash} from 'node:crypto';
export const cookieName='bunker_admin';
export function verifyPassword(password,hash=process.env.ADMIN_PASSWORD_HASH) {
 try {const [scheme,salt,digest]=hash.split(':');if(scheme!=='scrypt'||!/^[a-f0-9]{32}$/.test(salt)||!/^[a-f0-9]{128}$/.test(digest))return false;
 return timingSafeEqual(scryptSync(password,salt,64),Buffer.from(digest,'hex'));}catch{return false;}
}
function secret(){const value=process.env.SESSION_SECRET;if(!value||value.length<32)throw new Error('Session secret missing');return value;}
function version(){return createHash('sha256').update(process.env.ADMIN_PASSWORD_HASH||'').digest('hex');}
export function createSession(now=Date.now()){const payload=Buffer.from(JSON.stringify({expires:now+8*60*60*1000,version:version()})).toString('base64url');return payload+'.'+createHmac('sha256',secret()).update(payload).digest('base64url');}
export function verifySession(token,now=Date.now()) {try{if(!token||token.length>1000)return false;const [payload,sig,...extra]=token.split('.');if(extra.length||!sig)return false;const expected=createHmac('sha256',secret()).update(payload).digest();const actual=Buffer.from(sig,'base64url');if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return false;const data=JSON.parse(Buffer.from(payload,'base64url').toString());return typeof data.expires==='number'&&data.expires>now&&data.expires<=now+8*60*60*1000&&data.version===version();}catch{return false;}}
export function requestSession(request){const cookie=request.headers.get('cookie')||'';const value=cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='))?.slice(cookieName.length+1);return verifySession(value);}
export function sessionCookie(token,maxAge=28800){return `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${process.env.NODE_ENV==='production'?'; Secure':''}`;}
