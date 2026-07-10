import { SpeedInsights } from '@vercel/speed-insights/next';
import Masthead from '../components/Masthead';
import Footer from '../components/Footer';

export const metadata = {
  metadataBase: new URL('https://lightocean.vercel.app'),
  title: '光遇 LUMEET',
  description: '演唱會應援手燈、拍攝手機租借媒合平台。粉絲之間互相出租,讓每一支燈都不缺席燈海。',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Noto+Serif+TC:wght@600;900&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <Masthead />
        <div className="issue-line">FANS-TO-FANS RENTAL JOURNAL — VOL.01 / 2026</div>
        {children}
        <Footer />
        <SpeedInsights />
      </body>
    </html>
  );
}
