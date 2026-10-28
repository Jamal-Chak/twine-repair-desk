import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Repair Desk | TwineEngine',description:'Submit and manage service enquiries.',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><header><a className="brand" href="/"><span className="mark">↗</span><span>Repair Desk<small>BY TWINEENGINE</small></span></a><nav><a href="/">Submit an enquiry</a><a href="/admin">Staff dashboard</a></nav><span className="pill">Pilot workspace</span></header>{children}<footer><span>TwineEngine · Enquiries, organised.</span><a href="/privacy">Privacy &amp; data</a><a href="/demo/index.html">Fictional demo</a></footer></body></html>}
