import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Quote,
  List,
  ListOrdered,
  Highlighter,
  Palette,
  Indent,
  Outdent,
  Link2,
  Minus,
  Sparkles,
  RotateCcw,
  RotateCw,
  FileText,
  HelpCircle,
  CheckSquare,
  Image as ImageIcon,
  MapPin,
  Clock,
  Layers,
  ChevronDown,
  Info,
  Type
} from 'lucide-react';

interface WordToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  content: string;
  onChangeContent: (newContent: string) => void;
  onApplyPresetTemplate?: (templateType: string) => void;
  lineSpacing: string;
  onChangeLineSpacing: (spacing: string) => void;
  activeAlignment: string;
  onChangeAlignment: (align: string) => void;
  dropCap: boolean;
  onToggleDropCap: () => void;
}

export const WordToolbar: React.FC<WordToolbarProps> = ({
  textareaRef,
  content,
  onChangeContent,
  onApplyPresetTemplate,
  lineSpacing,
  onChangeLineSpacing,
  activeAlignment,
  onChangeAlignment,
  dropCap,
  onToggleDropCap,
}) => {
  const [activeRibbonTab, setActiveRibbonTab] = useState<'home' | 'insert' | 'layout' | 'templates'>('home');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showDatelinePicker, setShowDatelinePicker] = useState(false);
  const [showSpacingPicker, setShowSpacingPicker] = useState(false);
  const [showStylesDropdown, setShowStylesDropdown] = useState(false);

  // Undo / Redo stack
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = (newVal: string) => {
    const newHist = history.slice(0, historyIndex + 1);
    newHist.push(newVal);
    if (newHist.length > 30) newHist.shift();
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);
    onChangeContent(newVal);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const nextIdx = historyIndex - 1;
      setHistoryIndex(nextIdx);
      onChangeContent(history[nextIdx]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      onChangeContent(history[nextIdx]);
    }
  };

  /**
   * Helper to wrap or insert text around current selection in the textarea
   */
  const applyTextWrap = (prefix: string, suffix: string = '', defaultText: string = 'teks') => {
    const textarea = textareaRef.current;
    if (!textarea) {
      pushHistory(content + '\n' + prefix + defaultText + suffix);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    const replacement = selectedText ? `${prefix}${selectedText}${suffix}` : `${prefix}${defaultText}${suffix}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);

    pushHistory(newContent);

    // Restore focus
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + replacement.length - suffix.length);
    }, 10);
  };

  /**
   * Helper to prefix the current paragraph/line or wrap whole paragraph with alignment/heading
   */
  const applyLinePrefix = (prefix: string, stripExistingPattern?: RegExp) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      pushHistory(content + '\n\n' + prefix + 'Teks baru');
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Find the start and end of the current paragraph
    const beforeCursor = content.substring(0, start);
    const afterCursor = content.substring(end);

    const lastNewline = beforeCursor.lastIndexOf('\n');
    const paraStart = lastNewline === -1 ? 0 : lastNewline + 1;

    const nextNewline = afterCursor.indexOf('\n');
    const paraEnd = nextNewline === -1 ? content.length : end + nextNewline;

    let targetPara = content.substring(paraStart, paraEnd);
    if (stripExistingPattern) {
      targetPara = targetPara.replace(stripExistingPattern, '');
    }

    const updatedPara = `${prefix}${targetPara.trimStart()}`;
    const newContent = content.substring(0, paraStart) + updatedPara + content.substring(paraEnd);

    pushHistory(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(paraStart + prefix.length, paraStart + updatedPara.length);
    }, 10);
  };

  /**
   * Wrap paragraph with an alignment tag: [align=center]...[/align]
   */
  const handleSetAlignment = (align: 'left' | 'center' | 'right' | 'justify') => {
    onChangeAlignment(align);
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const beforeCursor = content.substring(0, start);
    const afterCursor = content.substring(end);

    const lastNewline = beforeCursor.lastIndexOf('\n');
    const paraStart = lastNewline === -1 ? 0 : lastNewline + 1;

    const nextNewline = afterCursor.indexOf('\n');
    const paraEnd = nextNewline === -1 ? content.length : end + nextNewline;

    let targetPara = content.substring(paraStart, paraEnd);
    // Strip existing alignment
    targetPara = targetPara.replace(/^\[align=(left|center|right|justify)\]/, '').replace(/\[\/align\]$/, '').trim();

    let formattedPara = targetPara;
    if (align !== 'left') {
      formattedPara = `[align=${align}]${targetPara}[/align]`;
    }

    const newContent = content.substring(0, paraStart) + formattedPara + content.substring(paraEnd);
    pushHistory(newContent);
  };

  /**
   * Toggle First-line Indentation for the active paragraph
   */
  const handleToggleIndent = (increase: boolean) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const beforeCursor = content.substring(0, start);
    const afterCursor = content.substring(end);

    const lastNewline = beforeCursor.lastIndexOf('\n');
    const paraStart = lastNewline === -1 ? 0 : lastNewline + 1;

    const nextNewline = afterCursor.indexOf('\n');
    const paraEnd = nextNewline === -1 ? content.length : end + nextNewline;

    let targetPara = content.substring(paraStart, paraEnd);

    if (increase) {
      if (!targetPara.startsWith('[indent]')) {
        targetPara = `[indent]${targetPara}`;
      }
    } else {
      targetPara = targetPara.replace(/^\[indent\]/, '');
    }

    const newContent = content.substring(0, paraStart) + targetPara + content.substring(paraEnd);
    pushHistory(newContent);
  };

  // Dateline locations for Indonesian & Global News
  const datelinePresets = [
    'JAKARTA, ARUN NEWS — ',
    'IKN NUSANTARA — ',
    'SURABAYA — ',
    'BANDUNG — ',
    'MEDAN — ',
    'SEMARANG — ',
    'MAKASSAR — ',
    'DENPASAR, BALI — ',
    'WASHINGTON D.C. — ',
    'TOKYO — ',
    'SINGAPURA — '
  ];

  // News templates
  const applyNewsTemplate = (type: string) => {
    if (onApplyPresetTemplate) {
      onApplyPresetTemplate(type);
      return;
    }

    let templateText = '';
    if (type === 'investigasi') {
      templateText = `JAKARTA, ARUN NEWS — Penelusuran tim investigasi redaksi mengungkap fakta terbaru terkait realisasi proyek infrastruktur strategis nasional yang berlangsung sepanjang semester pertama tahun ini.\n\n` +
        `## Temuan Utama di Lapangan\n\n` +
        `[indent]Berdasarkan data dokumen dan konfirmasi sejumlah pemangku kepentingan di lokasi, proyek ini telah mencatatkan progres signifikan namun tetap menghadapi sejumlah tantangan operasional.\n\n` +
        `> "Kami berkomitmen memastikan transparansi anggaran serta ketepatan waktu penyelesaian demi kepentingan masyarakat umum." — Kepala Otoritas Teknis Wilayah.\n\n` +
        `[INFO] Dokumen verifikasi dan audiensi publik dapat diakses secara terbuka melalui kanal pelaporan terpadu.\n\n` +
        `## Fakta Kunci & Dampak Kebijakan\n\n` +
        `• Peningkatan kapasitas layanan publik ditargetkan mencapai 40% pada akhir kuartal.\n` +
        `• Pengawasan lintas sektoral diperketat guna mencegah potensi distorsi anggaran.\n` +
        `• Pelibatan tenaga kerja lokal dan pemanfaatan material dalam negeri diprioritaskan.\n\n` +
        `[align=justify]Redaksi akan terus memantau perkembangan implementasi kebijakan ini secara berimbang dan faktual bagi kepentingan pembaca luas.[/align]`;
    } else if (type === 'wawancara') {
      templateText = `JAKARTA, ARUN NEWS — Dalam sesi wawancara eksklusif bersama Meja Redaksi Arun News, narasumber utama memaparkan arah strategis serta langkah terobosan yang tengah dipersiapkan.\n\n` +
        `## Poin Kunci Wawancara\n\n` +
        `> "Kunci utama dari transformasi berkelanjutan adalah konsistensi eksekusi dan keberpihakan pada kepentingan publik."\n\n` +
        `[indent]Menanggapi dinamika sektor yang bergerak cepat, reformasi sistemik dinilai menjadi fondasi utama dalam menjamin stabilitas jangka panjang.\n\n` +
        `[CATATAN REDAKSI] Wawancara dilakukan secara langsung di kantor pusat redaksi pada tanggal liputan tercatat.\n\n` +
        `---`;
    } else {
      templateText = `JAKARTA, ARUN NEWS — [Lead Berita 5W+1H: Tuliskan apa peristiwanya, siapa yang terlibat, kapan terjadi, di mana lokasi kejadian, mengapa hal itu penting, dan bagaimana prosesnya].\n\n` +
        `## Perkembangan & Konteks Peristiwa\n\n` +
        `[indent][Paragraf kedua: Uraikan kronologi secara runtut dan terperinci dengan bahasa jurnalistik yang lugas dan berimbang].\n\n` +
        `> "[Kutipan Narasumber Kunci / Pejabat Terkait yang memperkuat fakta berita]." — Nama Narasumber, Jabatan Resmi.\n\n` +
        `[INFO] [Sisipkan catatan latar belakang, regulasi terkait, atau data penting pelengkap warta].\n\n` +
        `## Dampak & Langkah Selanjutnya\n\n` +
        `• Langkah mitigasi dan tindak lanjut oleh pihak berwenang.\n` +
        `• Tanggapan masyarakat serta pengamat di lapangan.\n\n` +
        `[align=justify][Paragraf penutup: Ringkas kesimpulan dan ekspektasi perkembangan berita selanjutnya].[/align]`;
    }

    pushHistory(templateText);
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl border border-sky-900/60 shadow-lg overflow-hidden flex flex-col mb-2">
      {/* 1. Ribbon Tabs Header (Word Style) */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1 bg-slate-950 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-1">
          <div className="bg-yellow-400 text-sky-950 font-black px-2 py-0.5 rounded text-[10px] uppercase font-mono mr-2 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>Word Pro</span>
          </div>

          <button
            type="button"
            onClick={() => setActiveRibbonTab('home')}
            className={`px-3 py-1 rounded-t-lg font-bold text-xs transition-all ${
              activeRibbonTab === 'home'
                ? 'bg-slate-800 text-yellow-400 border-t-2 border-yellow-400 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Beranda & Paragraf
          </button>

          <button
            type="button"
            onClick={() => setActiveRibbonTab('insert')}
            className={`px-3 py-1 rounded-t-lg font-bold text-xs transition-all ${
              activeRibbonTab === 'insert'
                ? 'bg-slate-800 text-yellow-400 border-t-2 border-yellow-400 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Sisipkan (Insert)
          </button>

          <button
            type="button"
            onClick={() => setActiveRibbonTab('layout')}
            className={`px-3 py-1 rounded-t-lg font-bold text-xs transition-all ${
              activeRibbonTab === 'layout'
                ? 'bg-slate-800 text-yellow-400 border-t-2 border-yellow-400 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Tata Letak & Spasi
          </button>

          <button
            type="button"
            onClick={() => setActiveRibbonTab('templates')}
            className={`px-3 py-1 rounded-t-lg font-bold text-xs transition-all ${
              activeRibbonTab === 'templates'
                ? 'bg-slate-800 text-yellow-400 border-t-2 border-yellow-400 shadow-xs'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Template Berita 5W+1H
          </button>
        </div>

        {/* Undo / Redo Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Ribbon Toolbar Controls (Tab-Specific) */}
      <div className="p-2 sm:p-2.5 bg-slate-900 border-b border-slate-800/80 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
        
        {/* ================= TAB 1: HOME & PARAGRAPH ================= */}
        {activeRibbonTab === 'home' && (
          <>
            {/* GROUP: Font Styles (Bold, Italic, Underline, Strike) */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/60 shadow-2xs">
              <button
                type="button"
                onClick={() => applyTextWrap('**', '**', 'teks tebal')}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-white font-black hover:text-yellow-400 transition-colors"
                title="Tebal (Bold) - **teks**"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => applyTextWrap('*', '*', 'teks miring')}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-white italic hover:text-yellow-400 transition-colors"
                title="Miring (Italic) - *teks*"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => applyTextWrap('<u>', '</u>', 'teks garis bawah')}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-white underline hover:text-yellow-400 transition-colors"
                title="Garis Bawah (Underline)"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => applyTextWrap('~~', '~~', 'teks coret')}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-white hover:text-yellow-400 transition-colors"
                title="Coret (Strikethrough)"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* GROUP: Highlight & Color Pickers */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/60 shadow-2xs relative">
              {/* Highlight / Stabilo */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowHighlightPicker(!showHighlightPicker);
                    setShowColorPicker(false);
                  }}
                  className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-700 text-yellow-300 transition-colors"
                  title="Stabilo Warna (Highlight)"
                >
                  <Highlighter className="w-3.5 h-3.5" />
                  <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                </button>

                {showHighlightPicker && (
                  <div className="absolute left-0 top-full mt-1 z-30 bg-slate-950 p-2 rounded-xl border border-slate-700 shadow-xl flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        applyTextWrap('==', '==', 'teks stabilo');
                        setShowHighlightPicker(false);
                      }}
                      className="w-5 h-5 rounded bg-yellow-300 hover:scale-110 transition-transform"
                      title="Kuning Stabilo"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        applyTextWrap('[highlight=green]', '[/highlight]', 'teks stabilo hijau');
                        setShowHighlightPicker(false);
                      }}
                      className="w-5 h-5 rounded bg-emerald-300 hover:scale-110 transition-transform"
                      title="Hijau Muda"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        applyTextWrap('[highlight=blue]', '[/highlight]', 'teks stabilo biru');
                        setShowHighlightPicker(false);
                      }}
                      className="w-5 h-5 rounded bg-sky-300 hover:scale-110 transition-transform"
                      title="Biru Langit"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        applyTextWrap('[highlight=pink]', '[/highlight]', 'teks stabilo pink');
                        setShowHighlightPicker(false);
                      }}
                      className="w-5 h-5 rounded bg-pink-300 hover:scale-110 transition-transform"
                      title="Merah Muda"
                    />
                  </div>
                )}
              </div>

              {/* Text Color */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowColorPicker(!showColorPicker);
                    setShowHighlightPicker(false);
                  }}
                  className="flex items-center gap-1 p-1.5 rounded-lg hover:bg-slate-700 text-sky-300 transition-colors"
                  title="Warna Huruf (Text Color)"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                </button>

                {showColorPicker && (
                  <div className="absolute left-0 top-full mt-1 z-30 bg-slate-950 p-2 rounded-xl border border-slate-700 shadow-xl flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        applyTextWrap('[color=red]', '[/color]', 'teks merah');
                        setShowColorPicker(false);
                      }}
                      className="w-5 h-5 rounded bg-red-500 hover:scale-110 transition-transform"
                      title="Merah Redaksi"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        applyTextWrap('[color=blue]', '[/color]', 'teks biru');
                        setShowColorPicker(false);
                      }}
                      className="w-5 h-5 rounded bg-sky-500 hover:scale-110 transition-transform"
                      title="Biru Berita"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        applyTextWrap('[color=green]', '[/color]', 'teks hijau');
                        setShowColorPicker(false);
                      }}
                      className="w-5 h-5 rounded bg-emerald-500 hover:scale-110 transition-transform"
                      title="Hijau Fakta"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        applyTextWrap('[color=amber]', '[/color]', 'teks emas');
                        setShowColorPicker(false);
                      }}
                      className="w-5 h-5 rounded bg-amber-500 hover:scale-110 transition-transform"
                      title="Emas / Amber"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* GROUP: Word Paragraph Alignment (Left, Center, Right, Justify) */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/60 shadow-2xs">
              <button
                type="button"
                onClick={() => handleSetAlignment('left')}
                className={`p-1.5 rounded-lg transition-colors ${
                  activeAlignment === 'left' ? 'bg-yellow-400 text-sky-950 font-bold' : 'hover:bg-slate-700 text-white'
                }`}
                title="Rata Kiri (Align Left)"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleSetAlignment('center')}
                className={`p-1.5 rounded-lg transition-colors ${
                  activeAlignment === 'center' ? 'bg-yellow-400 text-sky-950 font-bold' : 'hover:bg-slate-700 text-white'
                }`}
                title="Rata Tengah (Align Center)"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleSetAlignment('right')}
                className={`p-1.5 rounded-lg transition-colors ${
                  activeAlignment === 'right' ? 'bg-yellow-400 text-sky-950 font-bold' : 'hover:bg-slate-700 text-white'
                }`}
                title="Rata Kanan (Align Right)"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleSetAlignment('justify')}
                className={`p-1.5 rounded-lg transition-colors ${
                  activeAlignment === 'justify' ? 'bg-yellow-400 text-sky-950 font-bold' : 'hover:bg-slate-700 text-white'
                }`}
                title="Rata Kiri-Kanan / Penuh (Justify)"
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* GROUP: Indentation (Indent & Outdent) */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/60 shadow-2xs">
              <button
                type="button"
                onClick={() => handleToggleIndent(false)}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-white hover:text-yellow-400 transition-colors"
                title="Kurangi Indentasi (Outdent)"
              >
                <Outdent className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleToggleIndent(true)}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-white hover:text-yellow-400 transition-colors"
                title="Tambah Indentasi Paragraf / Menjorok Tab (Indent)"
              >
                <Indent className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* GROUP: Lists (Bullets & Numbering) */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/60 shadow-2xs">
              <button
                type="button"
                onClick={() => applyLinePrefix('• ')}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-white hover:text-yellow-400 transition-colors"
                title="Daftar Butir (Bullet List)"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => applyLinePrefix('1. ')}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-white hover:text-yellow-400 transition-colors"
                title="Daftar Bernomor (Numbered List)"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* GROUP: Word Quick Headings & Callout Box */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700/60 shadow-2xs">
              <button
                type="button"
                onClick={() => applyLinePrefix('## ')}
                className="px-2 py-1 rounded-lg hover:bg-slate-700 text-white font-black hover:text-yellow-400 transition-colors text-[11px]"
                title="Subjudul Utama (Heading 1)"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => applyLinePrefix('### ')}
                className="px-2 py-1 rounded-lg hover:bg-slate-700 text-white font-black hover:text-yellow-400 transition-colors text-[11px]"
                title="Sub-subjudul (Heading 2)"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => applyLinePrefix('> "')}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-white hover:text-yellow-400 transition-colors"
                title="Kutipan Narasumber (Blockquote)"
              >
                <Quote className="w-3.5 h-3.5 text-yellow-400" />
              </button>
              <button
                type="button"
                onClick={() => applyLinePrefix('[INFO] ')}
                className="p-1.5 rounded-lg hover:bg-slate-700 text-sky-300 hover:text-yellow-400 transition-colors"
                title="Kotak Info Sorotan ([INFO])"
              >
                <Info className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}

        {/* ================= TAB 2: INSERT (SISIPKAN) ================= */}
        {activeRibbonTab === 'insert' && (
          <>
            {/* Dateline Stamp (Lokasi Peliputan) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDatelinePicker(!showDatelinePicker)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-yellow-400 font-bold border border-slate-700 transition-colors text-xs"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Cap Lokasi Peliputan</span>
                <ChevronDown className="w-2.5 h-2.5 opacity-70" />
              </button>

              {showDatelinePicker && (
                <div className="absolute left-0 top-full mt-1 z-30 bg-slate-950 p-2 rounded-xl border border-slate-700 shadow-xl w-56 max-h-60 overflow-y-auto space-y-1">
                  <div className="text-[10px] font-mono uppercase text-slate-400 px-2 py-1">
                    Pilih Lokasi Lapangan:
                  </div>
                  {datelinePresets.map((loc, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        applyTextWrap(loc, '', '');
                        setShowDatelinePicker(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs font-mono text-white hover:text-yellow-400 transition-colors"
                    >
                      {loc.replace(' — ', '')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Insert Horizontal Divider */}
            <button
              type="button"
              onClick={() => pushHistory(content + '\n\n---\n\n') }
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors text-xs"
              title="Sisipkan Garis Pembatas Horisontal (Divider)"
            >
              <Minus className="w-3.5 h-3.5 text-yellow-400" />
              <span>Garis Pemisah (---)</span>
            </button>

            {/* Insert Link */}
            <button
              type="button"
              onClick={() => applyTextWrap('[Teks Tautan](', ')', 'https://arunnews.id')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors text-xs"
              title="Sisipkan Tautan Web"
            >
              <Link2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Tautan Web</span>
            </button>

            {/* Insert Embedded Photo in Middle of Content */}
            <button
              type="button"
              onClick={() => applyTextWrap('[FOTO: https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1000&q=80 | ', ']', 'Dokumentasi liputan lapangan')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors text-xs"
              title="Sisipkan Foto di Tengah Paragraf"
            >
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sisipan Foto Tengah</span>
            </button>

            {/* Insert Fact Box */}
            <button
              type="button"
              onClick={() => applyLinePrefix('[FAKTA] ')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors text-xs"
              title="Sisipkan Kotak Fakta / Data Statistik"
            >
              <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Kotak Fakta Data</span>
            </button>

            {/* Insert Editorial Note */}
            <button
              type="button"
              onClick={() => applyLinePrefix('[CATATAN REDAKSI] ')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-colors text-xs"
              title="Sisipkan Catatan Khusus Meja Redaksi"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Catatan Redaksi</span>
            </button>
          </>
        )}

        {/* ================= TAB 3: LAYOUT & SPACING ================= */}
        {activeRibbonTab === 'layout' && (
          <>
            {/* Line Spacing Buttons */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700/60">
              <span className="text-[10px] font-mono text-slate-400 px-1.5 uppercase">Spasi Baris:</span>
              <button
                type="button"
                onClick={() => onChangeLineSpacing('normal')}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  lineSpacing === 'normal' ? 'bg-yellow-400 text-sky-950' : 'text-slate-300 hover:bg-slate-700'
                }`}
                title="Spasi 1.0 (Rapat)"
              >
                1.0
              </button>
              <button
                type="button"
                onClick={() => onChangeLineSpacing('relaxed')}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  lineSpacing === 'relaxed' ? 'bg-yellow-400 text-sky-950' : 'text-slate-300 hover:bg-slate-700'
                }`}
                title="Spasi 1.5 (Normal Berita)"
              >
                1.5
              </button>
              <button
                type="button"
                onClick={() => onChangeLineSpacing('loose')}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  lineSpacing === 'loose' ? 'bg-yellow-400 text-sky-950' : 'text-slate-300 hover:bg-slate-700'
                }`}
                title="Spasi 2.0 (Ganda / Draft Koreksi)"
              >
                2.0
              </button>
            </div>

            {/* Drop Cap Toggle */}
            <button
              type="button"
              onClick={onToggleDropCap}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold ${
                dropCap
                  ? 'bg-yellow-400 text-sky-950 border-yellow-500 font-black'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Huruf Awal Besar (Drop Cap): {dropCap ? 'ON' : 'OFF'}</span>
            </button>
          </>
        )}

        {/* ================= TAB 4: JOURNALISM TEMPLATES ================= */}
        {activeRibbonTab === 'templates' && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => applyNewsTemplate('standar')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-yellow-400 hover:text-sky-950 text-white font-bold border border-slate-700 transition-all text-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Struktur Berita Standar (5W+1H)</span>
            </button>
            <button
              type="button"
              onClick={() => applyNewsTemplate('investigasi')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-yellow-400 hover:text-sky-950 text-white font-bold border border-slate-700 transition-all text-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>Format Liputan Investigasi</span>
            </button>
            <button
              type="button"
              onClick={() => applyNewsTemplate('wawancara')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-yellow-400 hover:text-sky-950 text-white font-bold border border-slate-700 transition-all text-xs"
            >
              <Quote className="w-3.5 h-3.5 text-sky-400" />
              <span>Format Wawancara Eksklusif</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
