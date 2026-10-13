export interface GlossaryTerm {
  term: string;
  category: string;
  definition: string;
  exampleUsage?: string;
  aliases?: string[];
}

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: 'GoA 3',
    category: 'Teknologi & Transportasi',
    definition: 'Grade of Automation Level 3, yaitu teknologi pengoperasian kereta secara otomatis tanpa masinis (driverless), di mana petugas hanya mengawasi kondisi darurat.',
    exampleUsage: 'LRT Jabodebek beroperasi penuh menggunakan sistem kendali otomatis GoA 3.',
    aliases: ['goa3', 'goa-3', 'grade of automation 3']
  },
  {
    term: '5W+1H',
    category: 'Jurnalistik',
    definition: 'Rumus klasik verifikasi informasi yang terdiri dari What (Apa), Who (Siapa), Where (Di mana), When (Kapan), Why (Mengapa), dan How (Bagaimana).',
    exampleUsage: 'Setiap naskah warta Arun News harus melengkapi seluruh jawaban dari pertanyaan 5W+1H.',
    aliases: ['5w 1h', '5w1h']
  },
  {
    term: 'Anti-Buzzer',
    category: 'Media & Siber',
    definition: 'Sistem pengawasan kecerdasan buatan untuk menganalisis, mendeteksi, dan menyaring aktivitas akun automatik atau provokator terkoordinasi di kolom diskusi.',
    exampleUsage: 'Perisai Anti-Buzzer Arun News memblokir manipulasi opini opini massa.',
    aliases: ['anti buzzer', 'antibuzzer', 'perisai anti-buzzer']
  },
  {
    term: 'Pedoman Media Siber',
    category: 'Hukum & Pers',
    definition: 'Ketentuan atau etika nasional yang ditetapkan Dewan Pers Indonesia untuk mengatur penerbitan berita digital, ralat, hak jawab, dan privasi pembaca.',
    exampleUsage: 'Semua jurnalis terikat pada aturan Pedoman Media Siber.',
    aliases: ['pms', 'pedoman berita siber']
  },
  {
    term: 'Dewan Pers',
    category: 'Hukum & Organisasi',
    definition: 'Lembaga independen di Indonesia yang berfungsi mengayomi kemerdekaan pers dan meningkatkan kehidupan pers nasional.',
    aliases: ['dewan pers ri']
  },
  {
    term: 'IndexedDB',
    category: 'Teknologi Informasi',
    definition: 'Basis data berbasis peramban (browser) yang memungkinkan aplikasi web menyimpan data terstruktur dalam jumlah besar secara lokal agar dapat dibaca luring (offline).',
    aliases: ['indexed db', 'offline storage']
  },
  {
    term: 'LRT Jabodebek',
    category: 'Transportasi',
    definition: 'Moda Lintasan Rel Terpadu yang menghubungkan Jakarta, Bogor, Depok, dan Bekasi menggunakan tenaga listrik berbasis jalur layang.',
    aliases: ['lrt']
  },
  {
    term: 'Text-to-Speech (TTS)',
    category: 'Teknologi Informasi',
    definition: 'Fitur sintesis suara cerdas yang mengubah naskah teks menjadi rekaman audio agar pembaca dapat mendengarkan berita.',
    aliases: ['tts', 'text to speech']
  },
  {
    term: 'Advertorial',
    category: 'Komersial & Iklan',
    definition: 'Bentuk periklanan berita yang disajikan menyerupai gaya penulisan editorial atau warta biasa agar informatif bagi publik.',
    aliases: ['iklan advertorial']
  },
  {
    term: 'IKN Nusantara',
    category: 'Nasional & Pembangunan',
    definition: 'Ibu Kota Negara baru Republik Indonesia yang dibangun berkonsep kota cerdas dan ramah lingkungan di Kalimantan Timur.',
    aliases: ['ikn', 'nusantara']
  },
  {
    term: 'KPR Flat',
    category: 'Ekonomi & Keuangan',
    definition: 'Kredit Kepemilikan Rumah dengan besaran cicilan atau suku bunga yang tetap selama jangka waktu tertentu tanpa terpengaruh fluktuasi pasar.',
    aliases: ['kpr']
  },
  {
    term: 'Inflasi',
    category: 'Ekonomi',
    definition: 'Kenaikan harga barang dan jasa secara umum dan terus menerus dalam jangka waktu tertentu yang menyebabkan penurunan daya beli uang.',
    aliases: ['rate inflasi']
  }
];
