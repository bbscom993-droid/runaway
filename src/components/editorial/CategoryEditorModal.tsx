import React, { useState, useEffect } from 'react';
import { 
  X, 
  FolderPlus, 
  Edit3, 
  Check, 
  Save, 
  Sparkles, 
  Search, 
  AlertCircle,
  Tag
} from 'lucide-react';
import { Category } from '../../types';
import { 
  AVAILABLE_CATEGORY_ICONS, 
  renderCategoryIcon 
} from '../../utils/categoryIconHelper';

interface CategoryEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCategory: (category: Category) => void;
  editingCategory: Category | null;
  existingCategories: Category[];
}

const PRESET_COLORS = [
  { name: 'Sky Blue', hex: '#0284c7', bgClass: 'bg-sky-500' },
  { name: 'Amber Gold', hex: '#d97706', bgClass: 'bg-amber-500' },
  { name: 'Emerald Green', hex: '#059669', bgClass: 'bg-emerald-500' },
  { name: 'Rose Red', hex: '#e11d48', bgClass: 'bg-rose-500' },
  { name: 'Purple Royal', hex: '#7c3aed', bgClass: 'bg-purple-600' },
  { name: 'Indigo Blue', hex: '#4338ca', bgClass: 'bg-indigo-600' },
  { name: 'Orange Sunset', hex: '#ea580c', bgClass: 'bg-orange-500' },
  { name: 'Teal Oceanic', hex: '#0d9488', bgClass: 'bg-teal-600' },
  { name: 'Slate Executive', hex: '#475569', bgClass: 'bg-slate-600' },
];

export const CategoryEditorModal: React.FC<CategoryEditorModalProps> = ({
  isOpen,
  onClose,
  onSaveCategory,
  editingCategory,
  existingCategories,
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('Tag');
  const [color, setColor] = useState('#0284c7');
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setSlug(editingCategory.slug || editingCategory.id);
      setDescription(editingCategory.description || '');
      setIconName(editingCategory.iconName || 'Tag');
      setColor(editingCategory.color || '#0284c7');
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setIconName('Tag');
      setColor('#0284c7');
    }
    setErrorMessage(null);
    setIconSearchQuery('');
  }, [editingCategory, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
      // Auto-generate slug from name
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');

    if (!cleanName) {
      setErrorMessage('Nama kategori berita wajib diisi.');
      return;
    }

    if (!cleanSlug) {
      setErrorMessage('ID / Slug kategori wajib diisi.');
      return;
    }

    // Check slug collision
    const isDuplicate = existingCategories.some(
      (c) => c.id.toLowerCase() === cleanSlug && (!editingCategory || editingCategory.id !== c.id)
    );

    if (isDuplicate) {
      setErrorMessage(`Kategori dengan slug / ID "${cleanSlug}" sudah ada. Gunakan nama atau slug lain.`);
      return;
    }

    const categoryPayload: Category = {
      id: editingCategory ? editingCategory.id : cleanSlug,
      name: cleanName,
      slug: cleanSlug,
      iconName: iconName || 'Tag',
      description: description.trim() || `Liputan berita dan kabar mendalam seputar ${cleanName}.`,
      color: color,
    };

    onSaveCategory(categoryPayload);
    onClose();
  };

  const filteredIcons = AVAILABLE_CATEGORY_ICONS.filter(
    (ico) => 
      ico.name.toLowerCase().includes(iconSearchQuery.toLowerCase()) ||
      ico.label.toLowerCase().includes(iconSearchQuery.toLowerCase()) ||
      ico.category.toLowerCase().includes(iconSearchQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-sky-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-xl w-full border-2 border-yellow-400 shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-indigo-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-sky-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-sky-950 flex items-center justify-center font-black shadow-xs flex-shrink-0">
              {editingCategory ? <Edit3 className="w-5 h-5 text-sky-950" /> : <FolderPlus className="w-5 h-5 text-sky-950" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-yellow-400 text-sky-950 font-black text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider shadow-2xs">
                  {editingCategory ? 'Edit Rubrik' : 'Rubrik Baru'}
                </span>
                <span className="text-[11px] font-mono text-sky-300 font-bold">
                  CMS Redaksi
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-tight font-sans text-white mt-0.5">
                {editingCategory ? 'Edit Kategori Berita' : 'Tambah Kategori Berita Baru'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-sky-900 hover:bg-sky-800 text-sky-300 hover:text-white border border-sky-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1 bg-slate-50/50">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 flex items-center gap-2 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Nama Kategori */}
          <div>
            <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] mb-1.5 font-mono">
              Nama Rubrik / Kategori Berita <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Contoh: Teknologi, Kesehatan, Otomotif, Gaya Hidup..."
              className="w-full px-3.5 py-2.5 text-xs bg-white rounded-xl border border-sky-200 text-sky-950 font-bold shadow-2xs focus:ring-2 focus:ring-yellow-400 focus:outline-none"
            />
          </div>

          {/* Slug / ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] mb-1.5 font-mono">
                Slug URL / ID Kanal <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-xs">/</span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                  placeholder="teknologi"
                  className="w-full pl-6 pr-3 py-2 text-xs bg-white rounded-xl border border-sky-200 text-sky-950 font-mono font-bold shadow-2xs focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Hanya huruf kecil, angka, dan tanda hubung (-)
              </span>
            </div>

            {/* Warna Aksen */}
            <div>
              <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] mb-1.5 font-mono">
                Warna Aksen Kategori
              </label>
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                      color === c.hex ? 'scale-110 border-sky-950 ring-2 ring-yellow-400' : 'border-white hover:scale-105'
                    }`}
                    title={c.name}
                  >
                    {color === c.hex && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] mb-1.5 font-mono">
              Deskripsi Singkat Rubrik
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan cakupan topik berita di kanal ini untuk panduan pembaca..."
              className="w-full p-2.5 text-xs bg-white rounded-xl border border-sky-200 text-sky-950 shadow-2xs focus:ring-2 focus:ring-yellow-400 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Ikon Picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block font-black uppercase tracking-wider text-sky-950 text-[11px] font-mono">
                Pilih Ikon Rubrik
              </label>
              <div className="flex items-center gap-1.5 bg-sky-100/80 px-2 py-0.5 rounded-md text-[11px] font-mono text-sky-900 font-bold">
                <span>Terpilih:</span>
                <span className="p-0.5 bg-sky-900 text-yellow-300 rounded flex items-center justify-center">
                  {renderCategoryIcon(iconName, 'w-3.5 h-3.5')}
                </span>
                <span className="text-sky-950">{iconName}</span>
              </div>
            </div>

            {/* Search Icon */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={iconSearchQuery}
                onChange={(e) => setIconSearchQuery(e.target.value)}
                placeholder="Cari ikon (contoh: Cpu, Bola, Film, Hati, Buku, Mobil...)"
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-yellow-400"
              />
            </div>

            {/* Icon Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-36 overflow-y-auto p-2 bg-white rounded-xl border border-sky-200 shadow-inner">
              {filteredIcons.map((ico) => {
                const isSelected = iconName === ico.name;
                return (
                  <button
                    key={ico.name}
                    type="button"
                    onClick={() => setIconName(ico.name)}
                    className={`p-2 rounded-lg border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-yellow-400 text-sky-950 border-yellow-500 font-black shadow-xs ring-2 ring-sky-950'
                        : 'bg-slate-50 hover:bg-sky-50 text-slate-700 border-slate-200'
                    }`}
                    title={`${ico.label} (${ico.category})`}
                  >
                    {renderCategoryIcon(ico.name, `w-4 h-4 ${isSelected ? 'text-sky-950' : 'text-sky-700'}`)}
                    <span className="text-[9px] font-mono truncate w-full">{ico.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pratinjau Tampilan */}
          <div className="p-3 rounded-xl bg-sky-950 text-white flex items-center justify-between border border-sky-800 shadow-md">
            <div className="flex items-center gap-2.5">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-xs"
                style={{ backgroundColor: color || '#0284c7' }}
              >
                {renderCategoryIcon(iconName, 'w-4 h-4')}
              </div>
              <div>
                <span className="text-[10px] font-mono text-yellow-300 font-bold block">
                  Pratinjau Navigasi:
                </span>
                <span className="text-xs font-black uppercase text-white tracking-wide">
                  {name || 'Nama Kategori'}
                </span>
                <span className="text-[10px] font-mono text-sky-300 ml-2">
                  /{slug || 'slug'}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-sky-900 px-2 py-0.5 rounded text-sky-300 border border-sky-700">
              Aktif di Portal
            </span>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-200 font-bold text-xs cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-xs uppercase tracking-wider shadow-md border border-yellow-500 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{editingCategory ? 'Simpan Perubahan' : 'Tambah Kategori'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
