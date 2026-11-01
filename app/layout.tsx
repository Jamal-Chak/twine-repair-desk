import type {Metadata} from 'next';
import Link from 'next/link';
import './globals.css';
export const metadata:Metadata={title:'Repair Desk | TwineEngine',description:'Submit and manage service enquiries.',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><header><Link className="brand" href="/"><span className="mark">↗</span><span>Repair Desk<small>BY TWINEENGINE</small></span></Link><nav><Link href="/">Submit an enquiry</Link><Link href="/admin">Staff dashboard</Link></nav><span className="pill">Pilot workspace</span></header>{children}<footer><span>TwineEngine · Enquiries, organised.</span><Link href="/privacy">Privacy &amp; data</Link><Link href="/demo/index.html">Fictional demo</Link></footer></body></html>}
