import React from 'react';
import {
  Flame,
  Landmark,
  Trophy,
  ShieldAlert,
  TrendingUp,
  MapPin,
  GraduationCap,
  MessageSquare,
  Mail,
  FileCheck,
  Train,
  Tag,
  Megaphone,
  Sparkles,
  Globe,
  Cpu,
  HeartPulse,
  Film,
  BookOpen,
  Building2,
  Briefcase,
  Camera,
  Music,
  Tv,
  Car,
  Trees,
  Utensils,
  Plane,
  Coffee,
  Shield,
  Layers,
  Search,
  Radio,
  FileText
} from 'lucide-react';

export interface CategoryIconOption {
  name: string;
  label: string;
  category: string;
}

export const AVAILABLE_CATEGORY_ICONS: CategoryIconOption[] = [
  { name: 'Flame', label: 'Api / Trending', category: 'Umum' },
  { name: 'Landmark', label: 'Gedung / Politik', category: 'Politik' },
  { name: 'Trophy', label: 'Piala / Olahraga', category: 'Olahraga' },
  { name: 'ShieldAlert', label: 'Perisai / Kriminal', category: 'Hukum' },
  { name: 'TrendingUp', label: 'Grafik / Ekonomi', category: 'Bisnis' },
  { name: 'MapPin', label: 'Pin Lokasi / Daerah', category: 'Daerah' },
  { name: 'GraduationCap', label: 'Topi Toga / Pendidikan', category: 'Pendidikan' },
  { name: 'Cpu', label: 'Chip / Teknologi', category: 'Teknologi' },
  { name: 'Globe', label: 'Bola Dunia / Internasional', category: 'Dunia' },
  { name: 'HeartPulse', label: 'Detak Jantung / Kesehatan', category: 'Kesehatan' },
  { name: 'Film', label: 'Sinema / Hiburan', category: 'Hiburan' },
  { name: 'Car', label: 'Mobil / Otomotif', category: 'Otomotif' },
  { name: 'Trees', label: 'Pohon / Lingkungan', category: 'Lingkungan' },
  { name: 'Utensils', label: 'Kuliner / Gaya Hidup', category: 'Gaya Hidup' },
  { name: 'Briefcase', label: 'Koper / Karir & Bisnis', category: 'Bisnis' },
  { name: 'BookOpen', label: 'Buku / Edukasi & Riset', category: 'Edukasi' },
  { name: 'Building2', label: 'Gedung / Properti & Kota', category: 'Properti' },
  { name: 'Camera', label: 'Kamera / Fotografi', category: 'Media' },
  { name: 'Music', label: 'Musik / Seni & Budaya', category: 'Seni' },
  { name: 'Tv', label: 'Televisi / Penyiaran', category: 'Media' },
  { name: 'Plane', label: 'Pesawat / Pariwisata & Aviasi', category: 'Wisata' },
  { name: 'Train', label: 'Kereta / Transportasi', category: 'Transportasi' },
  { name: 'Coffee', label: 'Kopi / Opini & Santai', category: 'Opini' },
  { name: 'MessageSquare', label: 'Balon Pesan / Lapor Warga', category: 'Komunitas' },
  { name: 'Mail', label: 'Surat / Box Redaksi', category: 'Redaksi' },
  { name: 'FileCheck', label: 'Berkas Centang / Legalitas', category: 'Hukum' },
  { name: 'Shield', label: 'Perisai / Keamanan', category: 'Hukum' },
  { name: 'Megaphone', label: 'Megafon / Pengumuman', category: 'Umum' },
  { name: 'Sparkles', label: 'Kilau / Fitur Spesial', category: 'Umum' },
  { name: 'Tag', label: 'Label / Tagar Berita', category: 'Umum' },
];

export function renderCategoryIcon(iconName: string, className = 'w-4 h-4'): React.ReactElement {
  switch (iconName) {
    case 'Flame': return <Flame className={className} />;
    case 'Landmark': return <Landmark className={className} />;
    case 'Trophy': return <Trophy className={className} />;
    case 'ShieldAlert': return <ShieldAlert className={className} />;
    case 'TrendingUp': return <TrendingUp className={className} />;
    case 'MapPin': return <MapPin className={className} />;
    case 'GraduationCap': return <GraduationCap className={className} />;
    case 'Cpu': return <Cpu className={className} />;
    case 'Globe': return <Globe className={className} />;
    case 'HeartPulse': return <HeartPulse className={className} />;
    case 'Film': return <Film className={className} />;
    case 'Car': return <Car className={className} />;
    case 'Trees': return <Trees className={className} />;
    case 'Utensils': return <Utensils className={className} />;
    case 'Briefcase': return <Briefcase className={className} />;
    case 'BookOpen': return <BookOpen className={className} />;
    case 'Building2': return <Building2 className={className} />;
    case 'Camera': return <Camera className={className} />;
    case 'Music': return <Music className={className} />;
    case 'Tv': return <Tv className={className} />;
    case 'Plane': return <Plane className={className} />;
    case 'Train': return <Train className={className} />;
    case 'Coffee': return <Coffee className={className} />;
    case 'MessageSquare': return <MessageSquare className={className} />;
    case 'Mail': return <Mail className={className} />;
    case 'FileCheck': return <FileCheck className={className} />;
    case 'Shield': return <Shield className={className} />;
    case 'Megaphone': return <Megaphone className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    case 'Tag': return <Tag className={className} />;
    case 'Radio': return <Radio className={className} />;
    case 'FileText': return <FileText className={className} />;
    default: return <Tag className={className} />;
  }
}
