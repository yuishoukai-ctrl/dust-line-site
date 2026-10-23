export const motorradShizuoka = {
  slug: 'motorrad-shizuoka',
  path: '/shops/motorrad-shizuoka/',
  name: 'モトラッド静岡',
  englishName: 'Motorrad Shizuoka',
  category: 'BMW Motorrad 正規ディーラー',
  region: '静岡県・静岡市',
  headline: 'BMWの話も、次の林道の話も。',
  description: '静岡市駿河区のBMW Motorrad正規ディーラー、モトラッド静岡。ショールームの写真とともに、GSの楽しみ方や試乗の相談、店舗情報を紹介します。',
  postcode: '422-8058',
  address: '静岡県静岡市駿河区中原805-40',
  telephone: '054-283-1112',
  telephoneHref: 'tel:0542831112',
  hours: '10:00〜18:00',
  serviceReception: '17:00まで',
  closed: '毎週火曜日・水曜日',
  website: 'https://www.bmw-motorrad.jp/motorrad-shizuoka/ja/home.html',
  instagram: 'https://www.instagram.com/motorrad_shizuoka/',
  blog: 'https://motorradshizuoka2025.blog.fc2.com/',
  map: 'https://www.google.com/maps/search/?api=1&query=モトラッド静岡%20静岡市駿河区中原805-40',
  checkedDate: '2026-10-15',
  checkedDateLabel: '2026年10月15日',
}

export const shopPhotoPath = (name, width = 1280) => `shops/motorrad-shizuoka/${name}-${width}.webp`

export const hotelAz = {
  slug: 'hotel-az',
  path: '/shops/hotel-az/',
  name: 'HOTEL AZ',
  category: '宿泊先紹介',
  headline: '旅の拠点に、HOTEL AZ。',
  description: '九州を中心に各地へ展開するHOTEL AZ。提供写真とともに客室・朝食・料金条件・予約方法を紹介。ツーリングや遠征の宿選びに。',
  website: 'https://www.az-hotel.com/',
  hotelList: 'https://www.az-hotel.com/list/',
  services: 'https://www.az-hotel.com/service/',
  discount: 'https://www.az-hotel.com/pointcard/',
  checkedDate: '2026-10-23',
  checkedDateLabel: '2026年10月23日',
}

export const hotelAzPhotos = {
  wajiro: { width: 1668, height: 1252, widths: [640, 1280, 1668] },
  single: { width: 3900, height: 2600, widths: [640, 1280, 1920] },
  twin: { width: 3900, height: 2600, widths: [640, 1280, 1920] },
  breakfast: { width: 3900, height: 2600, widths: [640, 1280, 1920] },
  restaurant: { width: 4000, height: 2668, widths: [640, 1280, 1920] },
  ainan: { width: 4000, height: 2250, widths: [640, 1280, 1920] },
  miki: { width: 5472, height: 3648, widths: [640, 1280, 1920] },
}

export const hotelAzPhotoPath = (name, width = 1280) => `shops/hotel-az/${name}-${width}.webp`
