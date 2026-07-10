export const CAT_LABEL = { lightstick: 'LIGHTSTICK', phone: 'PHONE', binocular: 'BINOCULAR', other: 'SUPPORT' };
export const CAT_ICON = { lightstick: '💡', phone: '📱', binocular: '🔭', other: '📸' };
export const CAT_NAME = { lightstick: '手燈', phone: '拍攝手機', binocular: '望遠鏡', other: '其他' };

export const REGIONS = [
  '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市', '基隆市', '新竹市', '嘉義市',
  '新竹縣', '苗栗縣', '彰化縣', '南投縣', '雲林縣', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣',
  '台東縣', '澎湖縣', '金門縣', '連江縣',
];

export const GENDERS = [
  { value: 'female', label: '女性' },
  { value: 'male', label: '男性' },
  { value: 'other', label: '其他' },
  { value: 'undisclosed', label: '不透露' },
];

export const INQUIRY_STATUS_LABEL = { pending: '待確認', confirmed: '已確認租借', completed: '已完成租借', cancelled: '已婉拒' };

export function summarize(listings) {
  const prices = listings.map(l => l.price);
  const regions = [...new Set(listings.map(l => l.region))];
  return { count: listings.length, minPrice: prices.length ? Math.min(...prices) : null, regions };
}
