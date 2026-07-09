const CAT_LABEL={lightstick:'LIGHTSTICK',phone:'PHONE',binocular:'BINOCULAR',other:'SUPPORT'};
const CAT_ICON={lightstick:'💡',phone:'📱',binocular:'🔭',other:'📸'};
const CAT_NAME={lightstick:'手燈',phone:'拍攝手機',binocular:'望遠鏡',other:'其他應援'};

const PRODUCTS=[
  {id:'p1',cat:'lightstick',icon:'🩷',label:'LIGHTSTICK',title:'ARMY BOMB Ver.4 SE 官方手燈',desc:'BTS 官方應援手燈,支援中控連動。'},
  {id:'p2',cat:'lightstick',icon:'🖤',label:'LIGHTSTICK',title:'BLACKPINK 官方手燈 Ver.2(槌槌棒)',desc:'BLACKPINK 官方應援手燈。'},
  {id:'p3',cat:'lightstick',icon:'💚',label:'LIGHTSTICK',title:'NCT 官方手燈 Ver.2',desc:'NCT 官方應援手燈。'},
  {id:'p4',cat:'phone',icon:'📱',label:'PHONE',title:'iPhone 16 Pro Max 256G(拍攝用)',desc:'高畫質演唱會拍攝用手機。'},
  {id:'p5',cat:'phone',icon:'📱',label:'PHONE',title:'Galaxy S25 Ultra 10 倍光學變焦',desc:'長焦拍攝首選,適合遠距離座位。'},
  {id:'p6',cat:'binocular',icon:'🔭',label:'BINOCULAR',title:'Nikon ACULON 10x21 演唱會望遠鏡',desc:'輕便型演唱會望遠鏡。'},
  {id:'p7',cat:'binocular',icon:'🔭',label:'BINOCULAR',title:'Vixen 6x21 防手震 山頂位救星',desc:'防手震設計,適合山頂視角。'},
  {id:'p8',cat:'other',icon:'📸',label:'SUPPORT',title:'GoPro 13 + 胸掛(場外應援記錄)',desc:'場外應援側錄裝備。'},
];

const LISTINGS=[
  {id:'l1',productId:'p1',region:'北部',price:350,deposit:1500,meta:'台北面交/店到店・可解綁定',contact:'IG @fan_taipei'},
  {id:'l2',productId:'p1',region:'中部',price:330,deposit:1400,meta:'台中高鐵站面交・已解綁定',contact:'LINE ID: lightfan_tc'},
  {id:'l3',productId:'p2',region:'南部',price:300,deposit:1200,meta:'高雄面交優先・附電池',contact:'IG @pink_lover_kh'},
  {id:'l4',productId:'p3',region:'中部',price:320,deposit:1300,meta:'台中高鐵站面交',contact:'LINE ID: nct_zen'},
  {id:'l5',productId:'p4',region:'北部',price:1200,deposit:15000,meta:'限雙證件・已重置',contact:'Email: phone.rental@example.com'},
  {id:'l6',productId:'p5',region:'南部',price:1100,deposit:15000,meta:'高雄面交・附三腳架轉接',contact:'IG @s25_rental'},
  {id:'l7',productId:'p6',region:'南部',price:150,deposit:800,meta:'可店到店・附收納袋',contact:'LINE ID: nikon_lover'},
  {id:'l8',productId:'p7',region:'北部',price:400,deposit:2000,meta:'板橋面交',contact:'IG @vixen_binoc'},
  {id:'l9',productId:'p8',region:'中部',price:600,deposit:6000,meta:'限面交',contact:'IG @gopro_support'},
];

function listingsFor(productId){
  return LISTINGS.filter(l=>l.productId===productId);
}
function productSummary(product){
  const ls=listingsFor(product.id);
  const prices=ls.map(l=>l.price);
  const regions=[...new Set(ls.map(l=>l.region))];
  return {count:ls.length,minPrice:prices.length?Math.min(...prices):null,regions};
}
