export const metadata = {
  title: '找不到頁面｜光遇 LUMEET',
};

export default function NotFound() {
  return (
    <div className="wrap" style={{ padding: '70px 0', textAlign: 'center' }}>
      <p className="sec-sub" style={{ paddingLeft: 0 }}>找不到這個頁面,它可能已經下架或網址有誤。</p>
      <a className="btn" href="/items">回到找租借頁面</a>
    </div>
  );
}
