const CAT_LABEL={lightstick:'LIGHTSTICK',phone:'PHONE',binocular:'BINOCULAR',other:'SUPPORT'};
const CAT_ICON={lightstick:'💡',phone:'📱',binocular:'🔭',other:'📸'};
const CAT_NAME={lightstick:'手燈',phone:'拍攝手機',binocular:'望遠鏡',other:'其他應援'};

const REGIONS=[
  '台北市','新北市','桃園市','台中市','台南市','高雄市','基隆市','新竹市','嘉義市',
  '新竹縣','苗栗縣','彰化縣','南投縣','雲林縣','嘉義縣','屏東縣','宜蘭縣','花蓮縣',
  '台東縣','澎湖縣','金門縣','連江縣',
];

async function fetchProducts(){
  const {data,error}=await supabaseClient.from('products').select('*').order('created_at',{ascending:true});
  if(error){console.error(error);return[];}
  return data;
}

async function fetchProduct(id){
  const {data,error}=await supabaseClient.from('products').select('*').eq('id',id).maybeSingle();
  if(error){console.error(error);return null;}
  return data;
}

async function fetchAllListings(){
  const {data,error}=await supabaseClient.from('listings').select('*');
  if(error){console.error(error);return[];}
  return data;
}

async function fetchListings(productId){
  const {data,error}=await supabaseClient.from('listings').select('*').eq('product_id',productId);
  if(error){console.error(error);return[];}
  return data;
}

function summarize(listings){
  const prices=listings.map(l=>l.price);
  const regions=[...new Set(listings.map(l=>l.region))];
  return{count:listings.length,minPrice:prices.length?Math.min(...prices):null,regions};
}

async function insertProduct({cat,title,description}){
  const{data:{user}}=await supabaseClient.auth.getUser();
  const{data,error}=await supabaseClient.from('products').insert({
    cat,icon:CAT_ICON[cat],label:CAT_LABEL[cat],title,description,created_by:user.id,
  }).select().single();
  if(error)throw error;
  return data;
}

async function insertListing({productId,region,price,deposit,meta,contact}){
  const{data:{user}}=await supabaseClient.auth.getUser();
  const{data,error}=await supabaseClient.from('listings').insert({
    product_id:productId,region,price,deposit,meta,contact,created_by:user.id,
  }).select().single();
  if(error)throw error;
  return data;
}

async function insertInquiry({listingId,name,contact,wantedDate,message}){
  const{data:{user}}=await supabaseClient.auth.getUser();
  const{error}=await supabaseClient.from('inquiries').insert({
    listing_id:listingId,name,contact,wanted_date:wantedDate||null,message,created_by:user.id,
  });
  if(error)throw error;
}
