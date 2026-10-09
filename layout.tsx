import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Бункер Паб · Меню',description:'Меню Бункер Паб. Фірмові бургери, дошки, коктейлі, список вибраного, акції та події.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="uk"><body>{children}</body></html>}
