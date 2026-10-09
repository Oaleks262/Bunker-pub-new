import { menu, fail } from '@/lib/store';
export async function GET(){try{return Response.json({items:(await menu()).filter(x=>!x.hidden)},{headers:{'Cache-Control':'no-store'}})}catch(e){return fail(e)}}
