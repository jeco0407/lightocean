export const metadata = {
  title: '品牌故事｜光遇 LUMEET',
  description: '因光而遇,因熱愛相聚。Lumeet 光遇——結合 Lumi(光)與 Meet(相遇),讓每一支應援手燈都能在粉絲之間傳遞下去。',
  openGraph: {
    title: '品牌故事｜光遇 LUMEET',
    description: '因光而遇,因熱愛相聚。Lumeet 光遇——結合 Lumi(光)與 Meet(相遇),讓每一支應援手燈都能在粉絲之間傳遞下去。',
    images: ['/hero.png'],
    url: '/about',
  },
  twitter: { card: 'summary_large_image' },
};

export default function AboutPage() {
  return (
    <>
      <div className="wrap breadcrumb"><a href="/">首頁</a> / 品牌故事</div>

      <header className="story-hero">
        <div className="wrap">
          <div className="kicker">BRAND STORY</div>
          <h1>因光而遇,因熱愛相聚。</h1>
        </div>
      </header>

      <section style={{ paddingTop: 0 }}>
        <div className="wrap story-body">
          <p className="lede">每一場演唱會,都是一場因熱愛而相聚的旅程。</p>

          <p>然而,對許多粉絲而言,一支應援手燈並不只是演唱會的周邊商品,更是與偶像共同創造回憶、與全場粉絲一起點亮舞台的重要象徵。但並不是每個人都擁有專屬手燈,也不是每支手燈都只屬於一次演出。</p>

          <p><span className="brand-mark">Lumeet 光遇</span> 因此誕生。</p>

          <p>Lumeet 結合 <b>Lumi(Light)</b> 與 <b>Meet(相遇)</b>,代表「因光而相遇」。我們相信,每一道光都不該被閒置,每一次應援都值得被延續。</p>

          <p>透過安全、便利的租借媒合平台,擁有手燈的人可以分享手中的光,正在尋找手燈的人也能更輕鬆參與每一場演唱會。當一支手燈在不同粉絲之間傳遞,它承載的不只是光,更是期待、感動與共同的回憶。</p>

          <p>在 Lumeet,我們希望串聯每一位熱愛音樂與舞台的人,讓手燈不只是照亮舞台,也成為連結彼此的橋樑。</p>

          <p className="story-slogan">因光而遇,因熱愛相聚。</p>

          <div style={{ textAlign: 'center', paddingTop: 10 }}>
            <a className="btn" href="/items">瀏覽可租物品</a>
          </div>
        </div>
      </section>
    </>
  );
}
