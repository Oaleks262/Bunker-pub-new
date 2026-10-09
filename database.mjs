export async function execute(sql,args=[]) {
 const url=process.env.TURSO_DATABASE_URL?.replace(/^libsql:/,'https:');
 if(!url||!process.env.TURSO_AUTH_TOKEN)throw new Error('Database configuration missing');
 const values=args.map(value=>value===null?{type:'null'}:typeof value==='number'?{type:Number.isInteger(value)?'integer':'float',value:Number.isInteger(value)?String(value):value}:{type:'text',value:String(value)});
 const response=await fetch(`${url.replace(/\/$/,'')}/v2/pipeline`,{method:'POST',headers:{Authorization:`Bearer ${process.env.TURSO_AUTH_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({requests:[{type:'execute',stmt:{sql,args:values,want_rows:true}},{type:'close'}]}),cache:'no-store',signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw new Error(`Database HTTP ${response.status}`);
 const body=await response.json();const first=body.results?.[0];
 if(first?.type!=='ok'||!first.response?.result)throw new Error('Database statement failed');
 const result=first.response.result;
 const rows=result.rows.map(row=>Object.fromEntries(row.map((cell,i)=>[result.cols[i].name,cell.type==='null'?null:cell.type==='integer'||cell.type==='float'?Number(cell.value):cell.value])));
 return {rows,changes:result.affected_row_count};
}
