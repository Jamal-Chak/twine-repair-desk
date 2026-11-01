export const SERVICES=['Appliance repair','Generator service','Plumbing repair','General maintenance'] as const;
export const STATUSES=['New','Contacted','Closed'] as const;
export type Status=typeof STATUSES[number];
export class HttpError extends Error {constructor(public status:number,message:string){super(message)}}
const field=(v:unknown,name:string,min:number,max:number)=>{if(typeof v!=='string')throw new HttpError(400,`${name} is required.`);const s=v.trim();if(s.length<min||s.length>max||/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(s))throw new HttpError(400,`${name} must be ${min}-${max} characters.`);return s};
export function validateEnquiry(b: unknown) {
  if (!b || typeof b !== 'object' || Array.isArray(b)) throw new HttpError(400, 'Invalid request.');
  const data = b as Record<string, unknown>;
  const id = field(data.id, 'Request reference', 36, 36);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) throw new HttpError(400, 'Invalid request reference.');
  const name = field(data.name, 'Name', 2, 80), phone = field(data.phone, 'Phone', 7, 25), email = field(data.email, 'Email', 3, 120).toLowerCase(), area = field(data.area, 'Area', 2, 80), description = field(data.description, 'Description', 10, 2000);
  if (!/^[+\d ()-]+$/.test(phone) || phone.replace(/\D/g, '').length < 7) throw new HttpError(400, 'Enter a valid phone number.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Enter a valid email address.');
  if (typeof data.service !== 'string' || !SERVICES.includes(data.service as typeof SERVICES[number])) throw new HttpError(400, 'Select a valid service.');
  if (data.consent !== true) throw new HttpError(400, 'Please acknowledge how your enquiry details will be used.');
  if (data.website) throw new HttpError(400, 'Unable to accept this request.');
  return { id, name, phone, email, area, description, service: data.service };
}
export function validateUpdate(b: unknown) {
  if (!b || typeof b !== 'object' || Array.isArray(b)) throw new HttpError(400, 'Invalid record version.');
  const data = b as Record<string, unknown>;
  if (typeof data.version !== 'number' || !Number.isInteger(data.version) || data.version < 1) throw new HttpError(400, 'Invalid record version.');
  if (typeof data.status !== 'string' && data.status !== undefined) throw new HttpError(400, 'Invalid status.');
  if (data.status !== undefined && !STATUSES.includes(data.status as Status)) throw new HttpError(400, 'Invalid status.');
  const note = data.note === undefined ? '' : field(data.note, 'Note', 1, 2000);
  if (!data.status && !note) throw new HttpError(400, 'Provide a status or note.');
  return { version: data.version, status: data.status as Status | undefined, note };
}
export function csvCell(v:unknown){let s=String(v??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'}
