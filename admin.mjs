import {randomBytes,scryptSync} from 'node:crypto';
import {createInterface} from 'node:readline/promises';
const rl=createInterface({input:process.stdin,output:process.stdout});
const password=await rl.question('Новий пароль адміністратора (мінімум 12 символів; введення видиме): ');rl.close();
if(password.length<12||password.length>256)throw new Error('Пароль повинен містити від 12 до 256 символів');
const salt=randomBytes(16).toString('hex');
console.log(`ADMIN_PASSWORD_HASH=scrypt:${salt}:${scryptSync(password,salt,64).toString('hex')}`);
console.log(`SESSION_SECRET=${randomBytes(32).toString('hex')}`);
