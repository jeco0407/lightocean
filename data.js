const CAT_LABEL={lightstick:'LIGHTSTICK',phone:'PHONE',binocular:'BINOCULAR',other:'SUPPORT'};
const CAT_ICON={lightstick:'💡',phone:'📱',binocular:'🔭',other:'📸'};
const CAT_NAME={lightstick:'手燈',phone:'拍攝手機',binocular:'望遠鏡',other:'其他應援'};

const REGIONS=[
  '台北市','新北市','桃園市','台中市','台南市','高雄市','基隆市','新竹市','嘉義市',
  '新竹縣','苗栗縣','彰化縣','南投縣','雲林縣','嘉義縣','屏東縣','宜蘭縣','花蓮縣',
  '台東縣','澎湖縣','金門縣','連江縣',
];

const GENDERS=[{value:'female',label:'女性'},{value:'male',label:'男性'},{value:'other',label:'其他'},{value:'undisclosed',label:'不透露'}];

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

async function insertProduct({cat,title,description,imageUrl}){
  const{data:{user}}=await supabaseClient.auth.getUser();
  const{data,error}=await supabaseClient.from('products').insert({
    cat,icon:CAT_ICON[cat],label:CAT_LABEL[cat],title,description,image_url:imageUrl||null,created_by:user.id,
  }).select().single();
  if(error)throw error;
  return data;
}

async function insertListing({productId,region,price,deposit,meta,contact,imageUrl}){
  const{data:{user}}=await supabaseClient.auth.getUser();
  const{data,error}=await supabaseClient.from('listings').insert({
    product_id:productId,region,price,deposit,meta,contact,image_url:imageUrl||null,created_by:user.id,
  }).select().single();
  if(error)throw error;
  return data;
}

async function updateProductImage(productId,imageUrl){
  const{error}=await supabaseClient.from('products').update({image_url:imageUrl}).eq('id',productId);
  if(error)throw error;
}

async function insertInquiry({listingId,name,contact,wantedDate,message}){
  const{data:{user}}=await supabaseClient.auth.getUser();
  const{error}=await supabaseClient.from('inquiries').insert({
    listing_id:listingId,name,contact,wanted_date:wantedDate||null,message,created_by:user.id,
  });
  if(error)throw error;
}

async function fetchProfile(userId){
  const{data,error}=await supabaseClient.from('profiles').select('*').eq('id',userId).maybeSingle();
  if(error){console.error(error);return null;}
  return data;
}

async function upsertProfile({displayName,avatar,homeRegion,birthDate,gender}){
  const{data:{user}}=await supabaseClient.auth.getUser();
  const{data,error}=await supabaseClient.from('profiles').upsert({
    id:user.id,display_name:displayName,avatar,home_region:homeRegion,
    birth_date:birthDate||null,gender:gender||null,updated_at:new Date().toISOString(),
  }).select().single();
  if(error)throw error;
  return data;
}

async function uploadAvatar(file){
  const{data:{user}}=await supabaseClient.auth.getUser();
  const path=`${user.id}/avatar`;
  const{error}=await supabaseClient.storage.from('avatars').upload(path,file,{upsert:true,cacheControl:'3600'});
  if(error)throw error;
  const{data}=supabaseClient.storage.from('avatars').getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

/* folder is 'products' or 'listings', just for tidy storage organisation */
async function uploadPhoto(file,folder){
  const{data:{user}}=await supabaseClient.auth.getUser();
  const ext=(file.name.split('.').pop()||'jpg').toLowerCase();
  const path=`${user.id}/${folder}/${Date.now()}.${ext}`;
  const{error}=await supabaseClient.storage.from('photos').upload(path,file,{cacheControl:'3600'});
  if(error)throw error;
  const{data}=supabaseClient.storage.from('photos').getPublicUrl(path);
  return data.publicUrl;
}

async function fetchMyListings(userId){
  const{data,error}=await supabaseClient.from('listings')
    .select('*, products(title,label,icon,image_url)')
    .eq('created_by',userId)
    .order('created_at',{ascending:false});
  if(error){console.error(error);return[];}
  return data;
}

async function deleteListing(id){
  const{error}=await supabaseClient.from('listings').delete().eq('id',id);
  if(error)throw error;
}

async function fetchMyInquiries(userId){
  const{data,error}=await supabaseClient.from('inquiries')
    .select('*, listings(region,price,products(title))')
    .eq('created_by',userId)
    .order('created_at',{ascending:false});
  if(error){console.error(error);return[];}
  return data;
}

async function fetchReceivedInquiries(userId){
  const{data,error}=await supabaseClient.from('inquiries')
    .select('*, listings!inner(region,price,created_by,products(title))')
    .eq('listings.created_by',userId)
    .order('created_at',{ascending:false});
  if(error){console.error(error);return[];}
  return data;
}
