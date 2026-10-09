import { execute } from './database.mjs';
import { requestSession } from './auth.mjs';
import { initialMenu, Item } from './menu';
export function db(){return {prepare(sql:string){let args:unknown[]=[];return {bind(...values:unknown[]){args=values;return this},async all<T>(){const result=await execute(sql,args);return {results:result.rows as T[]}},async run(){const result=await execute(sql,args);return {meta:{changes:result.changes}}}}}};}
export async function menu():Promise<Item[]> {const {results}=await db().prepare('SELECT id,payload FROM menu_edits').all<{id:string,payload:string}>(); const edits=new Map(results.map(x=>[x.id,JSON.parse(x.payload)])); const merged=initialMenu.map(x=>edits.get(x.id)||x); for(const [id,x] of edits)if(!initialMenu.some(i=>i.id===id))merged.push(x); return merged;}
export async function isStaff(request:Request){return requestSession(request);}
export function sameOrigin(request:Request){const origin=request.headers.get('origin'); return origin===new URL(request.url).origin;}
export function fail(error:unknown){console.error('Bunker API',error);return Response.json({error:'Сервіс тимчасово недоступний. Ваші дані збережені у формі. Спробуйте ще раз.'},{status:503});}
