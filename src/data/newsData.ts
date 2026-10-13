import { NewsArticle, Category, WeatherInfo, TrendingTopic, PollData, EditorialPiece, VideoNews, PhotoStory, SiteSettings, TickerSettings, EditorialUser, EditorialStaffMember, OfficialContacts, TransportSchedule } from '../types';
import { DEFAULT_SEO_SETTINGS } from '../utils/seoEngine';
import { DEFAULT_SEM_SETTINGS } from '../utils/semEngine';

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'Semua Berita', slug: 'all', iconName: 'Flame', description: 'Kumpulan seluruh warta terkini' },
  { id: 'politik', name: 'Politik', slug: 'politik', iconName: 'Landmark', description: 'Kabar politik, hukum, dan kebijakan nasional' },
  { id: 'olahraga', name: 'Olahraga', slug: 'olahraga', iconName: 'Trophy', description: 'Sepak bola, bulutangkis, dan arena olahraga global' },
  { id: 'kriminal', name: 'Kriminal', slug: 'kriminal', iconName: 'ShieldAlert', description: 'Kasus hukum, kriminalitas, ketertiban, dan keamanan' },
  { id: 'ekonomi', name: 'Ekonomi', slug: 'ekonomi', iconName: 'TrendingUp', description: 'Pasar modal, investasi, perbankan, dan perkembangan ekonomi' },
  { id: 'daerah', name: 'Daerah', slug: 'daerah', iconName: 'MapPin', description: 'Warta berita daerah dan info nusantara' },
  { id: 'lain-lain', name: 'Lain-lain', slug: 'lain-lain', iconName: 'Sparkles', description: 'Aneka ragam kabar menarik lainnya' },
  { id: 'akpersi', name: 'Akpersi', slug: 'akpersi', iconName: 'GraduationCap', description: 'Informasi dan warta seputar Asosiasi Akademisi & Praktisi Pers Indonesia' },
  { id: 'laporan warga', name: 'Lapor Warga', slug: 'laporan-warga', iconName: 'MessageSquare', description: 'Aduan dan laporan langsung dari masyarakat' },
  { id: 'box redaksi', name: 'Box Redaksi', slug: 'box-redaksi', iconName: 'Mail', description: 'Informasi resmi dari dewan redaksi, tim jurnalis, dan kebijakan media' },
  { id: 'legalitas', name: 'Legalitas', slug: 'legalitas', iconName: 'FileCheck', description: 'Dokumen hukum dan pedoman penyelenggaraan ARUN NEWS.' },
  { id: 'transportasi', name: 'Transportasi', slug: 'transportasi', iconName: 'Train', description: 'Perkembangan rute, tol, dan angkutan publik' },
];

export const WEATHER_CITIES: WeatherInfo[] = [
  { city: 'Jakarta', temp: 31, condition: 'Cerah Berawan', humidity: 72, icon: 'SunMedium' },
  { city: 'Surabaya', temp: 33, condition: 'Cerah Terik', humidity: 65, icon: 'Sun' },
  { city: 'Bandung', temp: 24, condition: 'Hujan Ringan', humidity: 85, icon: 'CloudRain' },
  { city: 'IKN Nusantara', temp: 29, condition: 'Berawan Sejuk', humidity: 78, icon: 'CloudSun' },
  { city: 'Denpasar', temp: 30, condition: 'Cerah Tropis', humidity: 70, icon: 'Sun' },
  { city: 'Medan', temp: 31, condition: 'Hujan Petir', humidity: 88, icon: 'CloudLightning' },
  { city: 'Makassar', temp: 32, condition: 'Cerah Berawan', humidity: 74, icon: 'SunMedium' },
];

export const TRENDING_TOPICS: TrendingTopic[] = [
  { id: '1', tag: '#EkonomiKreatif', postsCount: '142.5K Warta', category: 'Ekonomi' },
  { id: '2', tag: '#AkpersiPeduliPers', postsCount: '98.2K Warta', category: 'Akpersi' },
  { id: '3', tag: '#LaporBeritaAduan', postsCount: '76.1K Warta', category: 'Lapor Berita' },
  { id: '4', tag: '#LayananPersNasional', postsCount: '54.3K Warta', category: 'Layanan Kami' },
  { id: '5', tag: '#AkpersiKongres2026', postsCount: '39.8K Warta', category: 'Akpersi' },
  { id: '6', tag: '#InvestasiUMKMDigital', postsCount: '31.2K Warta', category: 'Ekonomi' },
];

export const INITIAL_POLL: PollData = {
  id: 'poll-01',
  question: 'Bagaimana penilaian Anda terhadap perluasan jaringan transportasi umum berbasis listrik di kota-kota besar Indonesia tahun ini?',
  description: 'Suara pembaca Arun News mengenai efektivitas integrasi bus listrik dan kereta perkotaan.',
  totalVotes: 3840,
  closedAt: '2026-08-20',
  options: [
    { id: 'opt-1', text: 'Sangat Puas, mobilitas jauh lebih cepat dan ramah lingkungan', votes: 2150 },
    { id: 'opt-2', text: 'Cukup Bagus, namun rute koridor perlu diperbanyak', votes: 1210 },
    { id: 'opt-3', text: 'Perlu Perbaikan, ketepatan waktu armada masih fluktuatif', votes: 340 },
    { id: 'opt-4', text: 'Belum Merasakan dampaknya secara langsung', votes: 140 },
  ],
};

export const EDITORIAL_PIECES: EditorialPiece[] = [
  {
    id: 'ed-1',
    title: 'Menatap Masa Depan Kemandirian Pangan Melalui Smart Farming Nusantara',
    quote: 'Teknologi sensor tanah berbasis satelit dan AI bukan lagi sekadar impian modern, melainkan kunci bertahan petani lokal menghadapi anomali cuaca global.',
    authorName: 'Prof. Dr. Hendra Danusubroto',
    authorRole: 'Pakar Agronomi & Peneliti Senior BRIN',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    date: '14 Agustus 2026',
    readTime: '5 mnt baca',
    articleId: 'art-4',
  },
  {
    id: 'ed-2',
    title: 'Transformasi Ruang Digital: Mengapa Kedaulatan Data Adalah Benteng Baru Kita',
    quote: 'Membangun infrastruktur pusat data berstandar hijau di dalam negeri bukan hanya soal teknologi, tapi pilar pertahanan kedaulatan informasi abad ke-21.',
    authorName: 'Dewi Anggraini, M.Sc.',
    authorRole: 'Direktur Kebijakan Siber & Digital Ethics',
    authorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    date: '13 Agustus 2026',
    readTime: '6 mnt baca',
    articleId: 'art-3',
  },
  {
    id: 'ed-3',
    title: 'Merawat Akar Budaya di Tengah Gelombang Globalisasi Musik Populer',
    quote: 'Gamelan dan ritme etnik yang dipadukan secara harmonis dengan synthesizer membuktikan tradisi tak pernah usang saat dirayakan dengan keberanian estetis.',
    authorName: 'Raden Bagus Prakoso',
    authorRole: 'Budayawan & Kurator Seni Kontemporer',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    date: '12 Agustus 2026',
    readTime: '4 mnt baca',
    articleId: 'art-6',
  },
];

export const VIDEO_NEWS: VideoNews[] = [
  {
    id: 'v-1',
    title: 'Eksklusif: Penampakan Progres PLTS Terapung Terbesar Asia Tenggara di Waduk Cirata',
    duration: '04:35',
    thumbnail: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
    views: '185K ditonton',
    publishedAt: '2 jam lalu',
    category: 'Ekonomi',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 'v-2',
    title: 'Momen Kemenangan Dramatis Timnas Garuda di Menit Terakhir Babak Tambahan',
    duration: '07:12',
    thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=600&q=80',
    views: '420K ditonton',
    publishedAt: '5 jam lalu',
    category: 'Akpersi',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    id: 'v-3',
    title: 'Bedah Teknologi Satelit Nusantara-5 yang Resmi Mengorbit di Titik Geostasioner',
    duration: '05:48',
    thumbnail: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=600&q=80',
    views: '96K ditonton',
    publishedAt: '12 jam lalu',
    category: 'Lapor Berita',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  },
  {
    id: 'v-4',
    title: 'Menelusuri Kawasan Konservasi Terumbu Karang Raja Ampat dengan Kamera Bawah Air 8K',
    duration: '08:20',
    thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    views: '310K ditonton',
    publishedAt: '1 hari lalu',
    category: 'Layanan Kami',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
];

export const PHOTO_STORIES: PhotoStory[] = [
  {
    id: 'ps-1',
    title: 'Geliat Pasar Terapung Lok Baintan: Tradisi Jual Beli di Atas Jukung yang Abadi',
    location: 'Banjarmasin, Kalimantan Selatan',
    photoCount: 14,
    imageUrl: 'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
    photographer: 'Aji Wicaksono / Antara Warta',
    date: '14 Agustus 2026',
  },
  {
    id: 'ps-2',
    title: 'Harmoni Megah di Puncak Candi Borobudur Saat Perayaan Purnama Sidhi',
    location: 'Magelang, Jawa Tengah',
    photoCount: 18,
    imageUrl: 'https://images.unsplash.com/photo-1598890777032-bde835ba27c2?auto=format&fit=crop&w=800&q=80',
    photographer: 'Bima Setyawan',
    date: '13 Agustus 2026',
  },
  {
    id: 'ps-3',
    title: 'Metropolis Hijau: Menelusuri Jalur Sepeda dan Koridor Hutan Kota Jakarta',
    location: 'DKI Jakarta',
    photoCount: 10,
    imageUrl: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&w=800&q=80',
    photographer: 'Nanda Putri',
    date: '12 Agustus 2026',
  },
];

export const INITIAL_ARTICLES: NewsArticle[] = [
  {
    id: 'art-1',
    title: 'Investasi Hijau dan Teknologi Ramah Lingkungan Jadi Motor Pertumbuhan Ekonomi Nasional Capai 5.6%',
    slug: 'investasi-hijau-teknologi-dorong-pertumbuhan-ekonomi-5-6-persen',
    excerpt: 'Laporan Badan Pusat Statistik (BPS) mencatatkan lonjakan ekspor produk olahan energi baru terbarukan serta manufaktur baterai kendaraan listrik menjadi penggerak utama kuartal ini.',
    content: 'Pertumbuhan ekonomi Indonesia pada kuartal kedua 2026 resmi menembus angka 5,6 persen secara tahunan (year-on-year), melampaui estimasi konsensus pasar keuangan internasional.',
    paragraphs: [
      'Pertumbuhan ekonomi Indonesia pada kuartal kedua 2026 resmi menembus angka 5,6 persen secara tahunan (year-on-year), melampaui proyeksi awal para analis keuangan regional. Kunci penggerak utama datang dari akselerasi hilirisasi industri berwawasan lingkungan dan adopsi masif teknologi digital pada sektor rantai pasok logistik nasional.',
      'Kepala Badan Pusat Statistik menyatakan bahwa kontribusi sektor industri pengolahan ramah lingkungan, termasuk komponen panel surya dan ekosistem baterai kendaraan listrik, melonjak signifikan sebesar 22,4 persen dibandingkan periode yang sama tahun lalu.',
      '"Kita menyaksikan pergeseran struktural yang positif, di mana investasi riil tidak lagi hanya bertumpu pada komoditas mentah, melainkan ekosistem manufaktur bernilai tambah tinggi yang ramah karbon," ujar Menteri Koordinator Bidang Perekonomian dalam taklimat media di Jakarta Pusat.',
      'Di sisi lain, konsumsi domestik masyarakat tetap kokoh berkat stabilitas harga bahan pangan pokok serta penyaluran bantuan produktif bagi 18 juta pelaku UMKM berbasis platform digital terintegrasi.',
      'Sektor pariwisata berkelanjutan di lima Destinasi Super Prioritas (DSP) juga mencatat rekor kunjungan wisatawan mancanegara tertinggi sejak era pascapandemi, dengan rata-rata lama tinggal meningkat hingga 8,4 hari per pelancong.'
    ],
    category: 'ekonomi',
    categoryLabel: 'Ekonomi',
    author: {
      name: 'Satria Pratama',
      role: 'Redaktur Senior Ekonomi Arun News',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '15 Menit Lalu • 14 Agustus 2026',
    readTime: '4 mnt baca',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Gedung-gedung finansial dan perkantoran modern di kawasan Sudirman-Thamrin, Jakarta.',
    views: 45280,
    likes: 1890,
    shares: 432,
    tags: ['Ekonomi Nasional', 'Investasi Hijau', 'BPS', 'Manufaktur', 'UMKM'],
    isHeadline: true,
    isTrending: true,
    trendingRank: 1,
    keyTakeaways: [
      'Pertumbuhan ekonomi Indonesia kuartal II 2026 mencapai 5,6% yoy, melampaui target konsensus.',
      'Hilirisasi industri baterai listrik dan teknologi rantai pasok berkontribusi naik 22,4%.',
      'Stabilitas konsumsi domestik ditopang oleh digitalisasi 18 juta pelaku UMKM nasional.',
      'Pariwisata berkelanjutan di 5 DSP mencatat rekor kunjungan wisatawan tertinggi.'
    ],
    comments: [
      {
        id: 'c-1',
        userName: 'Budi Santoso, MBA',
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80',
        content: 'Angka yang sangat menggembirakan. Yang terpenting adalah memastikan pemerataan dampak ekonomi ini dirasakan langsung oleh petani dan pelaku usaha mikro di pelosok.',
        timestamp: '10 menit lalu',
        likes: 42,
        isVerified: true
      },
      {
        id: 'c-2',
        userName: 'Rina Wijaya',
        userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80',
        content: 'Fokus pada hilirisasi hijau memang langkah yang tepat untuk daya saing jangka panjang. Semoga serapan tenaga kerja lokal terus meningkat!',
        timestamp: '5 menit lalu',
        likes: 18
      }
    ]
  },
  {
    id: 'art-2',
    title: 'Timnas Sepak Bola Indonesia Amankan Tiket Putaran Final Usai Menang Dramatis 2-1',
    slug: 'timnas-indonesia-amankan-tiket-putaran-final-menang-dramatis-2-1',
    excerpt: 'Gol spektakuler tendangan bebas di masa injury time mengunci kemenangan bersejarah Garuda di hadapan puluhan ribu suporter fanatik di Stadion Gelora Bung Karno.',
    content: 'Atmosfer bergemuruh mengguncang Stadion Utama Gelora Bung Karno (SUGBK) ketika wasit meniup peluit panjang tanda berakhirnya laga krusial babak kualifikasi.',
    paragraphs: [
      'Atmosfer bergemuruh mengguncang Stadion Utama Gelora Bung Karno (SUGBK) Jakarta ketika wasit meniup peluit panjang tanda berakhirnya laga kualifikasi putaran ketiga penentuan, memastikan langkah skuad Garuda menuju panggung sepak bola paling bergengsi dunia.',
      'Pertandingan berlangsung sengit sejak menit awal. Indonesia sempat tertinggal lebih dulu di babak pertama lewat skema serangan balik cepat lawan pada menit ke-34.',
      'Namun disiplin taktik dan daya juang tinggi ditunjukkan di paruh kedua. Striker muda bertalenta berhasil menyamakan kedudukan lewat sundulan tajam memanfaatkan umpan silang akurat dari sisi kiri lapangan pada menit ke-68.',
      'Puncak drama terjadi pada menit ke-90+3 saat gelandang serang andalan melepaskan sepakan bebas melengkung dari luar kotak penalti yang bersarang mulus di sudut atas gawang tanpa mampu dijangkau kiper lawan.',
      'Pelatih kepala menyatakan kebanggaannya atas mentalitas pantang menyerah anak asuhnya: "Para pemain membuktikan bahwa dengan kerja keras, disiplin, dan persatuan, impian jutaan rakyat Indonesia bisa kita wujudkan bersama."'
    ],
    category: 'akpersi',
    categoryLabel: 'Akpersi',
    author: {
      name: 'Reza Firmansyah',
      role: 'Koresponden Olahraga Nasional',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '35 Menit Lalu • 14 Agustus 2026',
    readTime: '3 mnt baca',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Sorak sorai puluhan ribu pendukung menyemarakkan stadion dengan bendera Merah Putih.',
    views: 68120,
    likes: 5410,
    shares: 1205,
    tags: ['Timnas Indonesia', 'Garuda Juara', 'SUGBK', 'Kualifikasi', 'Sepak Bola'],
    isBreaking: true,
    isTrending: true,
    trendingRank: 2,
    keyTakeaways: [
      'Timnas Indonesia menang dramatis 2-1 lewat gol menit ke-93.',
      'Tiket putaran final turnamen akbar resmi diamankan skuad Merah Putih.',
      'Stadion GBK dipadati lebih dari 75.000 pendukung dengan koreografi spektakuler.'
    ],
    comments: [
      {
        id: 'c-3',
        userName: 'Fajar Nugraha',
        userAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&q=80',
        content: 'Merinding luar biasa nonton langsung di tribun GBK! Gol tendangan bebas di menit akhir benar-benar magis!',
        timestamp: '20 menit lalu',
        likes: 95
      }
    ]
  },
  {
    id: 'art-3',
    title: 'Satelit Generasi Baru Nusantara Diluncurkan: Perluas Jaringan Internet 5G dan Pendidikan Daerah 3T',
    slug: 'satelit-generasi-baru-nusantara-perluas-internet-5g-pendidikan-3t',
    excerpt: 'Kapasitas transmisi data hingga 300 Gbps akan membuka akses telemedisin, sekolah daring gratis, dan digitalisasi administrasi desa di ribuan pulau terluar.',
    content: 'Wahana peluncur luar angkasa sukses menempatkan satelit komunikasi orbit geostasioner Nusantara-5 di slot orbit 113 derajat Bujur Timur.',
    paragraphs: [
      'Wahana peluncur antariksa berhasil menempatkan satelit komunikasi orbit geostasioner generasi mutakhir Nusantara-5 di titik koordinat 113 derajat Bujur Timur tepat pada pukul 04.15 WIB.',
      'Satelit dengan teknologi High Throughput Satellite (HTS) ini memiliki kapasitas transfer throughput mencapai 300 Gigabits per second (Gbps), menjadikannya satelit telekomunikasi terbesar yang pernah dioperasikan oleh konsorsium nasional.',
      'Menteri Komunikasi dan Digital menegaskan bahwa prioritas utama transmisi satelit ini adalah melayani fasilitas publik di wilayah Terdepan, Terluar, dan Tertinggal (3T).',
      '"Mulai bulan depan, lebih dari 15.000 titik sekolah dasar, puskesmas pembantu, dan pos perbatasan maritim akan terhubung dengan koneksi pita lebar berkecepatan tinggi tanpa dipungut biaya," ungkapnya.',
      'Kehadiran konektivitas ini diharapkan mampu memperkecil kesenjangan literasi digital serta membuka peluang ekonomi kreatif bagi generasi muda di seluruh pelosok tanah air.'
    ],
    category: 'akpersi',
    categoryLabel: 'Akpersi',
    author: {
      name: 'Nabila Arisanti',
      role: 'Editor Teknologi & Inovasi',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '1 Jam Lalu • 14 Agustus 2026',
    readTime: '5 mnt baca',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Ilustrasi satelit orbit bumi berkecepatan tinggi melayani kepulauan Nusantara.',
    views: 31400,
    likes: 1240,
    shares: 310,
    tags: ['Satelit', 'Internet 3T', 'Teknologi', 'Pendidikan Digital', 'Kemenkomdigi'],
    isEditorPick: true,
    isTrending: true,
    trendingRank: 3,
    keyTakeaways: [
      'Satelit Nusantara-5 berkapasitas 300 Gbps sukses mengorbit di 113 BT.',
      'Menyediakan konektivitas gratis bagi 15.000 sekolah dan fasilitas kesehatan di daerah 3T.',
      'Mendukung layanan telemedisin dan digitalisasi tata kelola desa kepulauan.'
    ],
    comments: []
  },
  {
    id: 'art-4',
    title: 'Modernisasi Pertanian Presisi: Petani Padi Nusantara Sukses Panen 10 Ton per Hektare Berkat IoT',
    slug: 'modernisasi-pertanian-presisi-petani-padi-panen-10-ton-per-hektare-iot',
    excerpt: 'Penerapan sensor kelembaban tanah otomatis, pemantauan drone multispektral, dan bibit tahan kekeringan membuktikan efisiensi biaya tanam hingga 35%.',
    content: 'Gabungan kelompok tani di lumbung padi Jawa Barat dan Sulawesi Selatan mencatat lonjakan produktivitas panen raya musim kedua tahun ini.',
    paragraphs: [
      'Gabungan kelompok tani (Gapoktan) modern di sentra lumbung padi nasional mencatatkan rekor produktivitas panen mencapai rata-rata 10,2 ton gabah kering panen per hektare, melonjak signifikan dari rata-rata sebelumnya sekitar 6,5 ton.',
      'Keberhasilan ini didorong oleh adopsi program pertanian presisi (smart agriculture) yang memadukan sensor IoT bawah tanah untuk mengukur nutrisi NPK secara real-time, sistem irigasi tetes pintar hemat air, serta pemindaian kesehatan tanaman menggunakan drone berkamera multispektral.',
      'Ketua Gapoktan menyatakan bahwa biaya operasional pupuk dan pestisida berkurang hingga 35 persen karena pemberian nutrisi dilakukan secara presisi sesuai kebutuhan spesifik titik lahan.',
      'Kementerian Pertanian kini menyiapkan replikasi model smart farming terpadu ini ke 50 kabupaten sentra pangan lainnya guna memperkuat ketahanan pangan nasional menghadapi tantangan El Nino berkepanjangan.'
    ],
    category: 'ekonomi',
    categoryLabel: 'Ekonomi',
    author: {
      name: 'Prof. Dr. Hendra Danusubroto',
      role: 'Kontributor Sains & Agronomi',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '2 Jam Lalu • 14 Agustus 2026',
    readTime: '4 mnt baca',
    imageUrl: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Hamparan sawah hijau subur menggunakan sistem irigasi pintar berbasis sensor otomatis.',
    views: 19800,
    likes: 870,
    shares: 245,
    tags: ['Smart Farming', 'Ketahanan Pangan', 'Pertanian Presisi', 'Petani Modern', 'Agronomi'],
    isEditorPick: true,
    isTrending: true,
    trendingRank: 4,
    keyTakeaways: [
      'Produktivitas padi melonjak hingga 10,2 ton per hektare dengan IoT.',
      'Penghematan biaya pupuk dan pestisida mencapai 35% berkat teknologi presisi.',
      'Kementan akan mereplikasi program ke 50 kabupaten sentra lumbung pangan nasional.'
    ],
    comments: []
  },
  {
    id: 'art-5',
    title: 'Transformasi Layanan Publik Digital: Pembuatan Paspor dan Izin Usaha Kini Tuntas dalam Hitungan Menit',
    slug: 'transformasi-layanan-publik-digital-paspor-dan-izin-usaha-instan',
    excerpt: 'Integrasi Single Sign-On kependudukan nasional dan verifikasi biometrik nir-antre mempercepat pelayanan publik tanpa birokrasi berbelit.',
    content: 'Portal Satu Data dan Pelayanan Terpadu Satu Pintu digital resmi diperluas ke 514 kabupaten/kota di seluruh Indonesia.',
    paragraphs: [
      'Pemerintah resmi merilis pembaruan ekosistem portal Satu Layanan Nasional yang mengintegrasikan lebih dari 40 jenis dokumen kependudukan, perpajakan, dan perizinan usaha dalam satu aplikasi seluler terpadu.',
      'Melalui integrasi data berbasis identitas kependudukan digital (IKD) dan teknologi verifikasi biometrik wajah terenkripsi, proses perpanjangan paspor, pengurusan izin usaha mikro, serta administrasi perpajakan kini dapat diselesaikan dalam waktu kurang dari 5 menit tanpa perlu datang ke kantor fisik.',
      'Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi menegaskan bahwa sistem baru ini mengeliminasi celah pungutan liar dan memangkas waktu tunggu warga hingga 80 persen.',
      'Tingkat kepuasan publik terhadap layanan digital ini dalam uji coba bulan pertama mencapai 94,2 persen berdasarkan survei lembaga independen.'
    ],
    category: 'legalitas',
    categoryLabel: 'Legalitas',
    author: {
      name: 'Dimas Wicaksono',
      role: 'Redaktur Biro Nasional & Pemerintahan',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '3 Jam Lalu • 14 Agustus 2026',
    readTime: '3 mnt baca',
    imageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Aktivitas pelayanan terpadu yang kini bertransformasi menjadi serba digital dan cepat.',
    views: 24500,
    likes: 980,
    shares: 180,
    tags: ['Layanan Publik', 'Birokrasi Bersih', 'Digitalisasi', 'IKD', 'Reformasi'],
    isTrending: true,
    trendingRank: 5,
    keyTakeaways: [
      'Integrasi identitas digital kependudukan mempercepat perizinan hingga < 5 menit.',
      'Diterapkan merata di 514 kabupaten dan kota seluruh Indonesia.',
      'Indeks kepuasan masyarakat terhadap layanan publik digital tembus 94,2%.'
    ],
    comments: []
  },
  {
    id: 'art-6',
    title: 'Batik Tulis Kontemporer Curi Perhatian di Pekan Mode Paris: Diplomasi Budaya Bernilai Tinggi',
    slug: 'batik-tulis-kontemporer-curi-perhatian-pekan-mode-paris-2026',
    excerpt: 'Koleksi busana berbahan pewarna alami karya desainer muda Yogyakarta dipuji kurator internasional atas filosofi keberlanjutan dan keanggunan motifnya.',
    content: 'Panggung perhelatan pekan mode internasional di Paris, Prancis, dikejutkan oleh gemuruh tepuk tangan saat koleksi bertajuk "Nafas Tirta" melangkah di atas runway.',
    paragraphs: [
      'Panggung perhelatan pekan mode bergengsi di Paris, Prancis, dikejutkan oleh apresiasi tinggi dari para kurator mode dunia saat koleksi adibusana bertajuk "Nafas Tirta" ditampilkan di atas runway.',
      'Koleksi tersebut memadukan motif klasik batik tulis pesisir dengan siluet arsitektural modern, seluruhnya diproduksi menggunakan 100 persen bahan pewarna alami yang diekstrak dari kulit kayu mangrove, daun tarum, dan kunyit.',
      'Desainer muda asal Yogyakarta bersama 40 perajin perempuan desa binaan berhasil membuktikan bahwa warisan leluhur Indonesia sangat relevan dengan tren mode dunia yang kini mengedepankan etika keberlanjutan (sustainable luxury).',
      'Sejumlah rumah mode Eropa dilaporkan langsung menjalin kesepakatan kolaborasi dan pemesanan kain batik eksklusif untuk koleksi musim gugur mendatang.'
    ],
    category: 'lain-lain',
    categoryLabel: 'Lain-lain',
    author: {
      name: 'Maya Lestari',
      role: 'Jurnalis Budaya & Gaya Hidup',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '4 Jam Lalu • 14 Agustus 2026',
    readTime: '4 mnt baca',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Karya adibusana batik tulis pewarna alami tampil anggun di atas panggung mode bergengsi.',
    views: 18700,
    likes: 1430,
    shares: 512,
    tags: ['Batik Nusantara', 'Paris Fashion', 'Budaya', 'Sustainable Fashion', 'Kreatif'],
    isEditorPick: true,
    keyTakeaways: [
      'Koleksi batik pewarna alami desainer lokal menuai pujian kurator mode internasional.',
      'Melibatkan 40 perajin perempuan desa dengan standar sustainable luxury.',
      'Membuka kontrak kolaborasi dagang kreatif dengan rumah mode Eropa.'
    ],
    comments: []
  },
  {
    id: 'art-7',
    title: 'KTT Iklim Global Sepakati Dana Aksi Hutan Tropis: Indonesia Dapat Alokasi US$ 1,2 Miliar',
    slug: 'ktt-iklim-global-sepakati-dana-aksi-hutan-tropis-alokasi-indonesia',
    excerpt: 'Keberhasilan menekan angka deforestasi ke titik terendah dalam 2 dekade diapresiasi dunia internasional melalui skema pembayaran berbasis kinerja karbon.',
    content: 'Delegasi negara-negara penandatangan konvensi iklim di Jenewa resmi menyetujui paket pendanaan konservasi dan restorasi ekosistem gambut tropis.',
    paragraphs: [
      'Konferensi Tingkat Tinggi (KTT) Aksi Iklim Global di Jenewa, Swiss, secara bulat menyetujui komitmen penyaluran dana restorasi ekosistem hutan tropis dan mangrove sebesar US$ 1,2 miliar (sekitar Rp 19,4 triliun) kepada Indonesia.',
      'Alokasi dana hibah berbasis kinerja (results-based payment) ini diberikan sebagai pengakuan atas konsistensi Indonesia dalam menurunkan laju deforestasi serta merehabilitasi lebih dari 600.000 hektare lahan gambut kritis selama tiga tahun terakhir.',
      'Menteri Lingkungan Hidup menyatakan bahwa dana tersebut akan disalurkan secara transparan langsung ke masyarakat adat dan komunitas penjaga hutan di Sumatra, Kalimantan, dan Papua melalui program perhutanan sosial.',
      '"Komitmen ini membuktikan bahwa perlindungan lingkungan dan kesejahteraan ekonomi masyarakat adat dapat berjalan beriringan secara bermartabat,"'
    ],
    category: 'ekonomi',
    categoryLabel: 'Ekonomi',
    author: {
      name: 'Bambang Soediro',
      role: 'Koresponden Hubungan Internasional',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '5 Jam Lalu • 14 Agustus 2026',
    readTime: '4 mnt baca',
    imageUrl: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Kawasan hutan hujan tropis dan kanopi rimbun yang menjadi paru-paru bumi di Kalimantan.',
    views: 15400,
    likes: 720,
    shares: 195,
    tags: ['KTT Iklim', 'Konservasi', 'Gambut', 'Diplomasi', 'Hutan Hujan'],
    keyTakeaways: [
      'Indonesia menerima dana kinerja iklim internasional US$ 1,2 miliar.',
      'Apresiasi dunia atas penurunan deforestasi dan pemulihan 600.000 ha gambut.',
      'Dana disalurkan langsung ke komunitas adat dan pengelola perhutanan sosial.'
    ],
    comments: []
  },
  {
    id: 'art-8',
    title: 'Ganda Putra Bulutangkis Indonesia Raih Gelar Juara di Turnamen Bergengsi All England',
    slug: 'ganda-putra-bulutangkis-indonesia-raih-gelar-juara-all-england',
    excerpt: 'Permainan taktis menyerang dan ketenangan di poin-poin kritis mengantarkan pasangan Merah Putih mengalahkan rival tangguh melalui rubber game sengit.',
    content: 'Pasangan ganda putra andalan Indonesia kembali mengibarkan bendera Merah Putih di podium tertinggi Utilita Arena Birmingham.',
    paragraphs: [
      'Pasangan ganda putra bulutangkis Indonesia kembali membuktikan dominasinya di kancah bulutangkis dunia dengan mengunci gelar juara turnamen bergengsi All England setelah bertarung sengit selama 78 menit.',
      'Menghadapi pasangan unggulan pertama asal Asia Timur, ganda Indonesia sempat kecolongan di gim pembuka 18-21. Namun perubahan pola permainan cepat di depan net dan smash tajam silang membalikkan keadaan di gim kedua dengan skor 21-16.',
      'Di gim penentu yang menguras fisik dan mental, ketenangan pasangan Indonesia di momen deuce 20-20 berbuah dua poin krusial lewat pengembalian netting tipis yang tak mampu dikembalikan lawan, mengakhiri laga dengan skor 22-20.',
      '"Kemenangan ini kami persembahkan untuk seluruh masyarakat Indonesia yang tiada henti mendoakan dan mendukung kami," ungkap sang kapten tim penuh haru di podium juara.'
    ],
    category: 'akpersi',
    categoryLabel: 'Akpersi',
    author: {
      name: 'Reza Firmansyah',
      role: 'Koresponden Olahraga Nasional',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '6 Jam Lalu • 14 Agustus 2026',
    readTime: '3 mnt baca',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Aksi smash tajam pemain bulutangkis Indonesia dalam pertandingan final yang memukau.',
    views: 28900,
    likes: 2150,
    shares: 640,
    tags: ['Bulutangkis', 'All England', 'Juara Dunia', 'Ganda Putra', 'PBSI'],
    keyTakeaways: [
      'Ganda putra Indonesia sukses menyabet gelar juara All England 2026.',
      'Menang rubber game sengit 18-21, 21-16, 22-20 atas unggulan utama.',
      'Memperpanjang rekor tradisi emas bulutangkis Indonesia di arena internasional.'
    ],
    comments: []
  },
  {
    id: 'art-9',
    title: 'Polda Metro Jaya Ungkap Kasus Sindikat Penipuan Transaksi Online Lintas Provinsi',
    slug: 'polda-metro-jaya-ungkap-kasus-sindikat-penipuan-transaksi-online',
    excerpt: 'Petugas mengamankan sepuluh tersangka dan menyita barang bukti komputer jinjing, puluhan telepon genggam, serta kartu identitas palsu yang digunakan untuk mengelabui korban.',
    content: 'Pihak kepolisian dari jajaran Direktorat Reserse Kriminal Khusus Polda Metro Jaya berhasil membongkar sindikat penipuan digital yang beroperasi lintas daerah.',
    paragraphs: [
      'Pihak kepolisian dari jajaran Direktorat Reserse Kriminal Khusus Polda Metro Jaya berhasil membongkar jaringan penipuan daring berskala besar dengan modus transaksi e-commerce fiktif yang merugikan masyarakat hingga miliaran rupiah.',
      'Kombes Pol mengutarakan bahwa sindikat ini memanipulasi ratusan rekening bank dan dompet digital menggunakan data kependudukan ilegal.',
      'Warga diimbau untuk selalu waspada saat melakukan transaksi daring dan hanya menggunakan platform resmi terpercaya.'
    ],
    category: 'laporan warga',
    categoryLabel: 'Laporan Warga',
    author: {
      name: 'Dimas Wicaksono',
      role: 'Redaktur Biro Kriminalitas',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '8 Jam Lalu • 14 Agustus 2026',
    readTime: '3 mnt baca',
    imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Garis pengaman polisi di sekitar lokasi pemeriksaan barang bukti kasus siber.',
    views: 12500,
    likes: 310,
    shares: 88,
    tags: ['Kriminal', 'Polda Metro', 'Penipuan Online', 'Siber', 'Polisi'],
    keyTakeaways: [
      'Kepolisian menangkap sindikat penipuan online lintas provinsi dengan kerugian miliaran.',
      'Menyita belasan komputer, puluhan ponsel pintar, dan kartu identitas palsu.'
    ],
    comments: []
  },
  {
    id: 'art-10',
    title: 'Warga Keluhkan Saluran Irigasi yang Tersumbat Sampah Plastik di Kawasan Pesisir',
    slug: 'warga-keluhkan-saluran-irigasi-tersumbat-sampah-plastik-pesisir',
    excerpt: 'Laporan warga mengenai genangan air berkepanjangan akibat sumbatan sampah padat di saluran drainase utama desa sepanjang satu kilometer.',
    content: 'Sejumlah warga di wilayah pesisir mengeluhkan kondisi drainase lingkungan yang mampet akibat tumpukan limbah botol plastik dan kemasan sachet.',
    paragraphs: [
      'Warga mengeluhkan tumpukan limbah rumah tangga yang menyumbat aliran sungai kecil penghubung persawahan ke laut, memicu genangan air hitam berbau menyengat setiap hujan tiba.',
      'Warga berinisiatif menggelar kerja bakti gotong royong akhir pekan ini sembari meminta dinas kebersihan setempat menyediakan tempat pembuangan akhir terpadu.'
    ],
    category: 'laporan warga',
    categoryLabel: 'Laporan Warga',
    author: {
      name: 'Maya Lestari',
      role: 'Jurnalis Warga & Komunitas',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '12 Jam Lalu • 14 Agustus 2026',
    readTime: '4 mnt baca',
    imageUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Aktivitas gotong royong warga membersihkan aliran air pemukiman.',
    views: 8900,
    likes: 420,
    shares: 112,
    tags: ['Laporan Warga', 'Irigasi Mampet', 'Sampah', 'Gotong Royong'],
    keyTakeaways: [
      'Saluran drainase pesisir tersumbat tumpukan sampah plastik sepanjang 1 kilometer.',
      'Warga memohon pengadaan tong sampah dan armada pengangkut dari dinas kebersihan.'
    ],
    comments: []
  },
  {
    id: 'art-11',
    title: 'Uji Coba Lintas Rel Terpadu (LRT) Jabodebek Fase Terbaru Resmi Dimulai Hari Ini',
    slug: 'uji-coba-lrt-jabodebek-fase-terbaru-resmi-dimulai-hari-ini',
    excerpt: 'Kehadiran rute baru ini ditargetkan mampu mengurai kemacetan parah di jalan-jalan protokol arteri ibu kota hingga tiga puluh persen.',
    content: 'Kementerian Perhubungan resmi membuka uji coba terbatas koridor baru LRT Jabodebek untuk masyarakat umum dengan tarif promo seribu rupiah.',
    paragraphs: [
      'Kementerian Perhubungan mengoperasikan uji coba koridor baru yang menghubungkan area perkantoran padat dengan stasiun integrasi terpadu MRT dan kereta komuter.',
      'Sistem kendali otomatis nir-masinis (Grade of Automation Level 3) berjalan lancar dalam pemantauan ketat ruang kontrol operasi.'
    ],
    category: 'transportasi',
    categoryLabel: 'Transportasi',
    author: {
      name: 'Satria Pratama',
      role: 'Reporter Transportasi',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '1 Hari Lalu • 13 Agustus 2026',
    readTime: '3 mnt baca',
    imageUrl: 'https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'LRT Jabodebek melintas anggun di atas jalur layang beton dengan latar gedung perkantoran.',
    views: 18400,
    likes: 920,
    shares: 240,
    tags: ['LRT Jabodebek', 'Transportasi Publik', 'Kemenhub', 'Infrastruktur'],
    keyTakeaways: [
      'Koridor baru LRT Jabodebek memulai masa uji coba operasional terbatas bagi warga.',
      'Menggunakan teknologi kendali otomatis GoA 3 nir-masinis.'
    ],
    comments: []
  },
  {
    id: 'art-12',
    title: 'Sponsor: Bank Indonesia Tawarkan Subsidi KPR Berbunga Rendah Bagi Generasi Muda',
    slug: 'sponsor-bank-indonesia-subsidi-kpr-berbunga-rendah-generasi-muda',
    excerpt: 'Kesempatan memiliki hunian impian bernuansa hijau dengan cicilan super ringan dan bebas biaya provisi khusus nasabah baru bulan ini.',
    content: 'Bank pembangunan nasional meluncurkan program pembiayaan kepemilikan rumah (KPR) bersubsidi dengan bunga flat lima persen selama sepuluh tahun.',
    paragraphs: [
      'Bank nasional menggandeng pengembang terkemuka meluncurkan perumahan berkonsep ramah lingkungan yang sangat terjangkau bagi para pasangan muda berpenghasilan menengah.',
      'Fasilitas umum lengkap seperti taman terbuka hijau, sistem pengelolaan limbah mandiri, dan akses dekat moda transportasi umum menjadi keunggulan utama.'
    ],
    category: 'ekonomi',
    categoryLabel: 'Ekonomi',
    author: {
      name: 'Redaksi Komersial',
      role: 'Divisi Iklan & Advertorial',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
    },
    publishedAt: '2 Hari Lalu • 12 Agustus 2026',
    readTime: '3 mnt baca',
    imageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80',
    imageCaption: 'Maket perumahan modern ramah lingkungan yang ditawarkan dalam promo subsidi.',
    views: 31000,
    likes: 120,
    shares: 45,
    tags: ['KPR Subsidi', 'Hunian Hijau', 'Promo Kemerdekaan', 'Advertorial'],
    keyTakeaways: [
      'Program KPR subsidi bunga flat 5% untuk membantu kepemilikan rumah generasi muda.',
      'Bebas biaya administrasi dan diskon provisi untuk pengajuan selama masa pameran.'
    ],
    comments: []
  }
];

export const INITIAL_EDITORIAL_BOARD: EditorialStaffMember[] = [
  {
    id: 'staff-1',
    name: 'Drs. H. Surya Pratama, M.Si.',
    position: 'Pemimpin Redaksi & Penanggung Jawab',
    phone: '+62 812-8899-0123',
    email: 'surya.pratama@arunnews.id',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    bio: 'Wartawan Utama Sertifikasi Dewan Pers RI, Pengalaman 22 Tahun Jurnalisme Investigasi & Media Siber.',
    pressCardNo: 'DP-2026-08129',
    isListedInBox: true
  },
  {
    id: 'staff-2',
    name: 'Bambang Wijaya, S.Sos.',
    position: 'Pemimpin Perusahaan / Direktur Utama',
    phone: '+62 811-9200-5544',
    email: 'bambang.w@arunnews.id',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    bio: 'Manajemen Media Digital & Strategi Tumbuh Ekosistem Pers Nasional Berkelanjutan.',
    pressCardNo: 'DP-2026-07741',
    isListedInBox: true
  },
  {
    id: 'staff-3',
    name: 'Siti Rahmawati, S.I.Kom.',
    position: 'Redaktur Pelaksana (Managing Editor)',
    phone: '+62 813-1122-3344',
    email: 'siti.rahmawati@arunnews.id',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    bio: 'Penanggung Jawab Desk Politik, Hukum, & Kebijakan Publik Nasional.',
    pressCardNo: 'DP-2026-09211',
    isListedInBox: true
  },
  {
    id: 'staff-4',
    name: 'Dr. M. Rehan Alatas, S.H., M.H.',
    position: 'Ombudsman Pers & Penasihat Hukum',
    phone: '+62 815-9988-7711',
    email: 'ombudsman@arunnews.id',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    bio: 'Pakar Hukum Tata Negara & Pengawas Independen Hak Jawab dan Etika Jurnalistik.',
    pressCardNo: 'DP-2026-01002',
    isListedInBox: true
  },
  {
    id: 'staff-5',
    name: 'Arya Gunawan, S.T.',
    position: 'Kepala Desk Teknik, AI & Multimedia',
    phone: '+62 817-4433-2211',
    email: 'arya.multimedia@arunnews.id',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    bio: 'Inovator Infrastruktur Digital & Pengembang Sistem Informasi Redaksi Berbasis AI.',
    pressCardNo: 'DP-2026-11892',
    isListedInBox: true
  },
  {
    id: 'staff-6',
    name: 'Dewi Anggraini, S.Hum.',
    position: 'Koordinator Jurnalisme Warga & Koresponden',
    phone: '+62 819-0011-2233',
    email: 'lapor.warga@arunnews.id',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    bio: 'Pengelola Desk Laporan Masyarakat, Verifikasi Sumber Lapangan, & Jaringan Daerah.',
    pressCardNo: 'DP-2026-14022',
    isListedInBox: true
  }
];

export const INITIAL_OFFICIAL_CONTACTS: OfficialContacts = {
  hotlineWhatsapp: '0895626941900',
  officePhone: '0895626941900',
  editorialEmail: 'redaksi@arunnews.id',
  advertisingEmail: 'iklan@arunnews.id',
  pressOmbudsmanEmail: 'ombudsman@arunnews.id',
  officeAddress: 'Gg gaya, pasar minggu, kec, pasar minggu, kota jakarta selatan, provinsi DKI JAKARTA, Indonesia',
  operatingHours: 'Senin - Minggu | 24 Jam Non-Stop (Layanan Redaksi & Hotline 24/7)',
  pressCouncilCode: 'Terdaftar Dewan Pers RI No. 892/DP/K/VIII/2026',
};

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  portalName: 'Arun News',
  portalTagline: 'Jembatan Informasi Nusantara',
  subTagline: 'Menghubungkan Nusantara dengan Berita Terpercaya & Berimbang',
  hotlinePhone: '0895626941900',
  editorialEmail: 'redaksi@arunnews.id',
  officeAddress: 'Gg gaya, pasar minggu, kec, pasar minggu, kota jakarta selatan, provinsi DKI JAKARTA, Indonesia',
  pressCouncilCode: 'Terdaftar Dewan Pers RI No. 892/DP/K/VIII/2026',
  showEmergencyBanner: false,
  emergencyBannerText: '🔴 PERINGATAN RESMI BMKG: Gelombang Pasang dan Hujan Lebat di Pesisir Selatan Jawa & Bali. Tetap Waspada!',
  socialLinks: {
    twitter: 'https://twitter.com',
    instagram: 'https://instagram.com',
    youtube: 'https://youtube.com',
    facebook: 'https://facebook.com',
    tiktok: 'https://tiktok.com',
  },
  editorialBoard: INITIAL_EDITORIAL_BOARD,
  officialContacts: INITIAL_OFFICIAL_CONTACTS,
  seoSettings: DEFAULT_SEO_SETTINGS,
  semSettings: DEFAULT_SEM_SETTINGS,
  loginThemeSettings: {
    layoutTemplate: 'classic_bento',
    colorTheme: 'sky_gold',
    fontFamily: 'plus_jakarta',
    customPrimaryColor: '#0c4a6e',
    customAccentColor: '#facc15',
    titleText: 'Masuk ke Meja Redaksi',
    subtitleText: 'Kelola seluruh rubrik, naskah berita, running ticker, jajak pendapat, dan modul portal berita Arun News dalam satu sistem terintegrasi.',
    badgeText: 'Otentikasi Staf Redaksi',
    loginButtonLabel: 'Buka Meja Redaksi',
    showQuickDemoAccounts: true,
    showDedicatedUrlNotice: true,
    backgroundPattern: 'gradient',
    customBgImageUrl: '',
    customLogoUrl: '',
    requireSecurityPin: false,
    securityPinCode: '123456',
    enable2FAAuthorization: false,
    sessionTimeoutMinutes: 60,
    maxFailedAttemptsAllowed: 5,
    requireEditorialAuthCheck: true,
  },
  portalThemeSettings: {
    colorTheme: 'sky_gold',
    primaryColor: '#0c4a6e',
    primaryDarkColor: '#082f49',
    accentColor: '#facc15',
    accentHoverColor: '#eab308',
    headerStyle: 'gradient_elegance',
    navbarStyle: 'classic_bar',
    fontFamily: 'plus_jakarta',
  },
  antiSpamSettings: {
    enabled: true,
    strictness: 'maksimal',
    autoFilterSpam: true,
    flagRepeatedText: true,
    blockHateSpeech: true,
    filterExternalLinks: true,
    requireCaptcha: false,
    rateLimitSeconds: 15,
    blacklistedKeywords: [
      'buzzer bayaran',
      'paslon sebelah panik',
      'dana haram',
      'rezim antek',
      'cebong',
      'kampret',
      'kadrun',
      'fufufafa',
      'slot gacor',
      'maxwin',
      'bocoran togel',
      'wa.me/',
      'bit.ly/',
      'pinjol cepat cair',
      'jual follower'
    ],
    trustedKeywords: [
      'menurut data',
      'berdasarkan laporan',
      'sudut pandang',
      'kebijakan publik',
      'regulasi',
      'fakta di lapangan'
    ],
    totalSpamBlocked: 429
  },
  moduleToggles: {
    showWeather: true,
    showTrending: true,
    showTicker: true,
    showSpotlightHero: true,
    showTrendingGrid: true,
    showEditorPick: true,
    showPoll: true,
    showQuiz: true,
    showVideoNews: true,
    showPhotoStories: true,
    showNewsletter: true,
    allowCitizenJournalism: true,
    enableAntiBuzzer: true,
    enableSeoSem: true,
    showEditorialBoard: true,
    showPedomanMediaSiber: true,
  },
};

export const INITIAL_TICKER_SETTINGS: TickerSettings = {
  isEnabled: true,
  mode: 'auto',
  customMessage: '🔴 ARUN NEWS EKSKLUSIF: Ikuti pembaruan berita terkini secara real-time dari seluruh koresponden nusantara.',
  speed: 'normal',
  theme: 'dark',
};

export const DEFAULT_EDITORIAL_USERS: EditorialUser[] = [
  {
    id: 'user-pemred',
    name: 'Bagus Setyawan, M.I.Kom.',
    email: 'pemred@arunnews.id',
    role: 'pemred',
    roleTitle: 'Pemimpin Redaksi / Chief Editor',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    department: 'Dewan Redaksi Pusat',
    lastLogin: 'Hari ini • 08:30 WIB'
  },
  {
    id: 'user-redpel',
    name: 'Anisa Citra Wardhani',
    email: 'editor@arunnews.id',
    role: 'redaktur_pelaksana',
    roleTitle: 'Redaktur Pelaksana (Managing Editor)',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    department: 'Meja Berita & Investigasi',
    lastLogin: 'Kemarin • 19:45 WIB'
  },
  {
    id: 'user-multimedia',
    name: 'Dimas Prasetyo',
    email: 'multimedia@arunnews.id',
    role: 'multimedia',
    roleTitle: 'Redaktur Visual & Multimedia',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    department: 'Divisi Foto & Video',
    lastLogin: '3 hari lalu'
  }
];

export const INITIAL_TRANSPORT_SCHEDULES: TransportSchedule[] = [
  {
    id: 'ts-1',
    mode: 'bus',
    operator: 'PO Sinar Jaya (Executive Class)',
    routeFrom: 'Jakarta (Terminal Pulo Gebang)',
    routeTo: 'Yogyakarta (Terminal Giwangan)',
    departureTime: '07:30 WIB',
    arrivalTime: '16:00 WIB',
    status: 'Tepat Waktu',
    priceInfo: 'Rp 210.000',
    notes: 'Jalur Tol Trans-Jawa via Kanci & Pejagan',
    updatedAt: 'Hari ini 08:00 WIB'
  },
  {
    id: 'ts-2',
    mode: 'bus',
    operator: 'PO Rosalia Indah (Double Decker)',
    routeFrom: 'Surabaya (Terminal Purabaya)',
    routeTo: 'Jakarta (Terminal Kampung Rambutan)',
    departureTime: '13:00 WIB',
    arrivalTime: '22:30 WIB',
    status: 'Boarding',
    priceInfo: 'Rp 350.000',
    notes: 'Pemberhentian rest area KM 379A',
    updatedAt: 'Hari ini 08:15 WIB'
  },
  {
    id: 'ts-3',
    mode: 'kereta',
    operator: 'PT KAI - KA Argo Bromo Anggrek',
    routeFrom: 'Jakarta (Stasiun Gambir)',
    routeTo: 'Surabaya (Stasiun Pasar Turi)',
    departureTime: '08:20 WIB',
    arrivalTime: '16:30 WIB',
    status: 'Dalam Perjalanan',
    priceInfo: 'Rp 650.000',
    notes: 'Jalur Utara Jawa - Bebas Hambatan',
    updatedAt: 'Hari ini 08:30 WIB'
  },
  {
    id: 'ts-4',
    mode: 'kereta',
    operator: 'PT KAI - KA Whoosh Cepat',
    routeFrom: 'Jakarta (Stasiun Halim)',
    routeTo: 'Bandung (Stasiun Tegalluar)',
    departureTime: '09:45 WIB',
    arrivalTime: '10:30 WIB',
    status: 'Tepat Waktu',
    priceInfo: 'Rp 250.000',
    notes: 'Termasuk feeder gratis Halim - Bandung Kota',
    updatedAt: 'Hari ini 08:45 WIB'
  },
  {
    id: 'ts-5',
    mode: 'pesawat',
    operator: 'Garuda Indonesia (GA-312)',
    routeFrom: 'Jakarta (CGK - Soekarno-Hatta)',
    routeTo: 'Surabaya (SUB - Juanda)',
    departureTime: '11:15 WIB',
    arrivalTime: '12:45 WIB',
    status: 'Tepat Waktu',
    priceInfo: 'Rp 1.450.000',
    notes: 'Terminal 3 Bandara Soekarno Hatta',
    updatedAt: 'Hari ini 09:00 WIB'
  },
  {
    id: 'ts-6',
    mode: 'pesawat',
    operator: 'Lion Air (JT-610)',
    routeFrom: 'Jakarta (CGK)',
    routeTo: 'Medan (KNO - Kualanamu)',
    departureTime: '14:00 WIB',
    arrivalTime: '16:15 WIB',
    status: 'Boarding',
    priceInfo: 'Rp 1.120.000',
    notes: 'Gate B4 Terminal 2F',
    updatedAt: 'Hari ini 09:10 WIB'
  },
  {
    id: 'ts-7',
    mode: 'kapal',
    operator: 'PT PELNI - KM Kelud',
    routeFrom: 'Jakarta (Tanjung Priok)',
    routeTo: 'Batam (Batu Ampar)',
    departureTime: '16:00 WIB',
    arrivalTime: 'Besok 18:00 WIB',
    status: 'Tepat Waktu',
    priceInfo: 'Rp 410.000',
    notes: 'Dermaga Penumpang Pelabuhan Tanjung Priok',
    updatedAt: 'Hari ini 09:20 WIB'
  },
  {
    id: 'ts-8',
    mode: 'kapal',
    operator: 'ASDP Indonesia Ferry - KMP Portlink',
    routeFrom: 'Merak (Dermaga Eksekutif)',
    routeTo: 'Bakauheni (Dermaga Eksekutif)',
    departureTime: '10:00 WIB',
    arrivalTime: '11:15 WIB',
    status: 'Dalam Perjalanan',
    priceInfo: 'Rp 65.000',
    notes: 'Jadwal rutin keberangkatan tiap 1 jam',
    updatedAt: 'Hari ini 09:30 WIB'
  }
];
