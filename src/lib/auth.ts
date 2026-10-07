import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
export const adminCookie='lorent_admin';
function key(){const secret=process.env.ADMIN_SESSION_SECRET;if(!secret||secret.length<32)throw new Error('ADMIN_SESSION_SECRET must be at least 32 characters');return new TextEncoder().encode(secret);}
export async function issueAdminToken(email:string){return new SignJWT({role:'admin'}).setProtectedHeader({alg:'HS256'}).setSubject(email).setIssuedAt().setExpirationTime('8h').sign(key());}
export async function currentAdmin(){try{const token=(await cookies()).get(adminCookie)?.value;if(!token)return null;const {payload}=await jwtVerify(token,key());return payload.role==='admin'&&typeof payload.sub==='string'?payload.sub:null;}catch{return null;}}
