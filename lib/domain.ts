export const SERVICES=['Appliance repair','Generator service','Plumbing repair','General maintenance'] as const;
export const STATUSES=['New','Contacted','Closed'] as const;
export type Status=typeof STATUSES[number];
export class HttpError extends Error {constructor(public status:number,message:string){super(message)}}
const field=(v:unknown,name:string,min:number,max:number)=>{if(typeof v!=='string')throw new HttpError(400,`${name} is required.`);const s=v.trim();if(s.length<min||s.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s))throw new HttpError(400,`${name} must be ${min}-${max} characters.`);return s};
export function validateEnquiry(b:any){
 if(!b||typeof b!=='object'||Array.isArray(b))throw new HttpError(400,'Invalid request.');
 const id=field(b.id,'Request reference',36,36);if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))throw new HttpError(400,'Invalid request reference.');
 const name=field(b.name,'Name',2,80),phone=field(b.phone,'Phone',7,25),email=field(b.email,'Email',3,120).toLowerCase(),area=field(b.area,'Area',2,80),description=field(b.description,'Description',10,2000);
 if(!/^[+\d ()-]+$/.test(phone)||phone.replace(/\D/g,'').length<7)throw new HttpError(400,'Enter a valid phone number.');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new HttpError(400,'Enter a valid email address.');
 if(!SERVICES.includes(b.service))throw new HttpError(400,'Select a valid service.');
 if(b.consent!==true)throw new HttpError(400,'Please acknowledge how your enquiry details will be used.');
 if(b.website)throw new HttpError(400,'Unable to accept this request.');
 return {id,name,phone,email,area,description,service:b.service};
}
export function validateUpdate(b:any){if(!b||!Number.isInteger(b.version)||b.version<1)throw new HttpError(400,'Invalid record version.');if(b.status!==undefined&&!STATUSES.includes(b.status))throw new HttpError(400,'Invalid status.');const note=b.note===undefined?'':field(b.note,'Note',1,2000);if(!b.status&&!note)throw new HttpError(400,'Provide a status or note.');return {version:b.version,status:b.status as Status|undefined,note}}
export function csvCell(v:unknown){let s=String(v??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'}
