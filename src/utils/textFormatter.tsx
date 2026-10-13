import React from 'react';
import { Quote, Info, CheckCircle2, AlertCircle, Sparkles, ExternalLink, Calendar, MapPin } from 'lucide-react';

/**
 * Parses inline formatting tags:
 * - **bold**
 * - *italic*
 * - <u>underline</u>
 * - ~~strikethrough~~
 * - ==highlight== or [highlight=color]text[/highlight]
 * - [color=red]text[/color]
 * - [link=url]text[/link] or [text](url)
 */
export function renderInlineFormattedText(text: string): React.ReactNode[] {
  if (!text) return [];

  // Match markdown / word-like tokens
  // Regex to split by bold, italic, underline, strikethrough, highlight, color, link
  const parts: React.ReactNode[] = [];
  
  // Custom tokenizer
  const tokenRegex = /(\*\*.*?\*\*|\*.*?\*|<u>.*?<\/u>|~~.*?~~|==.*?==|\[highlight=(.*?)\](.*?)\[\/highlight\]|\[color=(.*?)\](.*?)\[\/color\]|\[(.*?)\]\((.*?)\)|\[align=(.*?)\](.*?)\[\/align\])/gi;
  
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    // Push preceding plain text
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    const fullMatch = match[0];

    if (fullMatch.startsWith('**') && fullMatch.endsWith('**')) {
      const inner = fullMatch.slice(2, -2);
      parts.push(<strong key={match.index} className="font-black text-sky-950">{inner}</strong>);
    } else if (fullMatch.startsWith('*') && fullMatch.endsWith('*')) {
      const inner = fullMatch.slice(1, -1);
      parts.push(<em key={match.index} className="italic font-medium">{inner}</em>);
    } else if (fullMatch.startsWith('<u>') && fullMatch.endsWith('</u>')) {
      const inner = fullMatch.slice(3, -4);
      parts.push(<u key={match.index} className="underline decoration-yellow-500 decoration-2 underline-offset-2">{inner}</u>);
    } else if (fullMatch.startsWith('~~') && fullMatch.endsWith('~~')) {
      const inner = fullMatch.slice(2, -2);
      parts.push(<s key={match.index} className="line-through opacity-60">{inner}</s>);
    } else if (fullMatch.startsWith('==') && fullMatch.endsWith('==')) {
      const inner = fullMatch.slice(2, -2);
      parts.push(
        <mark key={match.index} className="bg-yellow-200 text-sky-950 px-1 py-0.5 rounded font-medium">
          {inner}
        </mark>
      );
    } else if (fullMatch.startsWith('[highlight=')) {
      const color = match[2] || 'yellow';
      const inner = match[3] || '';
      let colorClass = 'bg-yellow-200 text-sky-950';
      if (color === 'green' || color === 'hijau') colorClass = 'bg-emerald-100 text-emerald-950';
      if (color === 'blue' || color === 'biru') colorClass = 'bg-sky-200 text-sky-950';
      if (color === 'pink' || color === 'merah-muda') colorClass = 'bg-pink-200 text-pink-950';
      if (color === 'orange' || color === 'oranye') colorClass = 'bg-amber-200 text-amber-950';

      parts.push(
        <mark key={match.index} className={`${colorClass} px-1.5 py-0.5 rounded font-medium`}>
          {inner}
        </mark>
      );
    } else if (fullMatch.startsWith('[color=')) {
      const color = match[4] || 'blue';
      const inner = match[5] || '';
      let colorClass = 'text-sky-700 font-bold';
      if (color === 'red' || color === 'merah') colorClass = 'text-red-600 font-bold';
      if (color === 'green' || color === 'hijau') colorClass = 'text-emerald-700 font-bold';
      if (color === 'amber' || color === 'gold' || color === 'emas') colorClass = 'text-amber-600 font-bold';
      if (color === 'dark' || color === 'hitam') colorClass = 'text-sky-950 font-black';

      parts.push(
        <span key={match.index} className={colorClass}>
          {inner}
        </span>
      );
    } else if (fullMatch.startsWith('[') && fullMatch.includes('](')) {
      const linkText = match[6];
      const linkUrl = match[7];
      parts.push(
        <a
          key={match.index}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-700 hover:text-sky-900 underline decoration-sky-400 font-bold inline-flex items-center gap-0.5"
        >
          <span>{linkText}</span>
          <ExternalLink className="w-3 h-3 inline" />
        </a>
      );
    } else {
      parts.push(fullMatch);
    }

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

interface RenderParagraphOptions {
  fontSizeClass?: string;
  lineSpacingClass?: string;
  fontFamily?: string;
  isFirstParagraph?: boolean;
  dropCap?: boolean;
  isNightMode?: boolean;
  isWarmMode?: boolean;
}

/**
 * Renders a full block paragraph with Word-like structural detection:
 * - Alignment tags [align=center], [align=right], [align=justify], [align=left]
 * - Headings (##, ###)
 * - Blockquotes (> ...)
 * - Callout boxes ([INFO], [CATATAN REDAKSI], [FAKTA])
 * - Bullet lists (•, -, *)
 * - Numbered lists (1., 2., etc.)
 * - Horizontal rules (---)
 * - Dateline prefix (e.g. JAKARTA — , ARUN NEWS — )
 * - First line indentations ([indent] or \t)
 */
export function renderRichParagraph(
  para: string, 
  index: number, 
  options: RenderParagraphOptions = {}
): React.ReactNode {
  const {
    fontSizeClass = 'text-base sm:text-lg',
    lineSpacingClass = 'leading-relaxed',
    fontFamily = 'sans',
    isFirstParagraph = false,
    dropCap = false,
    isNightMode = false,
    isWarmMode = false,
  } = options;

  let raw = para.trim();
  if (!raw) return null;

  // 1. Check Divider
  if (raw === '---' || raw === '***' || raw === '___') {
    return (
      <div key={index} className={`my-6 border-t-2 border-dashed relative ${
        isNightMode ? 'border-slate-800' : isWarmMode ? 'border-[#dfcfad]' : 'border-sky-200'
      }`}>
        <div className={`absolute left-1/2 -top-2.5 -translate-x-1/2 px-2 text-xs font-mono ${
          isNightMode ? 'bg-slate-950 text-slate-500' : isWarmMode ? 'bg-[#fbf4e6] text-amber-800/80' : 'bg-white text-sky-400'
        }`}>
          ◆ ◆ ◆
        </div>
      </div>
    );
  }

  // 2. Check Alignment
  let alignmentClass = 'text-left';
  if (raw.startsWith('[align=center]') && raw.endsWith('[/align]')) {
    alignmentClass = 'text-center';
    raw = raw.replace(/^\[align=center\]/, '').replace(/\[\/align\]$/, '').trim();
  } else if (raw.startsWith('[align=right]') && raw.endsWith('[/align]')) {
    alignmentClass = 'text-right';
    raw = raw.replace(/^\[align=right\]/, '').replace(/\[\/align\]$/, '').trim();
  } else if (raw.startsWith('[align=justify]') && raw.endsWith('[/align]')) {
    alignmentClass = 'text-justify';
    raw = raw.replace(/^\[align=justify\]/, '').replace(/\[\/align\]$/, '').trim();
  } else if (raw.startsWith('[align=left]') && raw.endsWith('[/align]')) {
    alignmentClass = 'text-left';
    raw = raw.replace(/^\[align=left\]/, '').replace(/\[\/align\]$/, '').trim();
  }

  // 3. Check First-line Indent
  let hasIndent = false;
  if (raw.startsWith('[indent]')) {
    hasIndent = true;
    raw = raw.replace(/^\[indent\]/, '').trim();
  }

  // 4. Headings: Heading 1 (##), Heading 2 (###)
  if (raw.startsWith('## ') || raw.startsWith('### ')) {
    const isH3 = raw.startsWith('### ');
    const headingText = raw.replace(/^###?\s+/, '').trim();
    return (
      <div key={index} className={`my-5 pt-3 pb-1 border-b ${
        isNightMode ? 'border-slate-800' : isWarmMode ? 'border-[#dfcfad]' : 'border-sky-100'
      } ${alignmentClass}`}>
        <h3 className={`${
          isH3 
            ? isNightMode 
              ? 'text-base sm:text-lg font-black text-yellow-300' 
              : isWarmMode 
              ? 'text-base sm:text-lg font-black text-[#43311f]' 
              : 'text-base sm:text-lg font-black text-sky-900'
            : isNightMode 
            ? 'text-lg sm:text-xl font-black text-yellow-400' 
            : isWarmMode 
            ? 'text-lg sm:text-xl font-black text-[#302111]' 
            : 'text-lg sm:text-xl font-black text-sky-950'
        } flex items-center gap-2 ${alignmentClass === 'text-center' ? 'justify-center' : alignmentClass === 'text-right' ? 'justify-end' : ''}`}>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 flex-shrink-0" />
          <span>{renderInlineFormattedText(headingText)}</span>
        </h3>
      </div>
    );
  }

  // 5. Callout / Info Box ([INFO], [CATATAN REDAKSI], [FAKTA], [DATA])
  const calloutMatch = raw.match(/^\[(INFO|CATATAN REDAKSI|FAKTA|DATA|PERINGATAN)\]\s*(.*)$/i);
  if (calloutMatch) {
    const tag = calloutMatch[1].toUpperCase();
    const body = calloutMatch[2];
    let borderTheme = isNightMode 
      ? 'border-slate-700 bg-slate-900 text-slate-100' 
      : isWarmMode
      ? 'border-[#dfcfad] bg-[#f5ecda] text-[#3e2e1c]'
      : 'border-sky-300 bg-sky-50 text-sky-950';
    let icon = <Info className="w-5 h-5 text-sky-500 flex-shrink-0" />;

    if (tag === 'FAKTA' || tag === 'DATA') {
      borderTheme = isNightMode 
        ? 'border-emerald-800 bg-emerald-950/60 text-emerald-100' 
        : isWarmMode
        ? 'border-emerald-700/40 bg-emerald-900/10 text-emerald-950'
        : 'border-emerald-300 bg-emerald-50 text-emerald-950';
      icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />;
    } else if (tag === 'PERINGATAN') {
      borderTheme = isNightMode 
        ? 'border-amber-800 bg-amber-950/60 text-amber-100' 
        : isWarmMode
        ? 'border-amber-700/50 bg-amber-900/10 text-amber-950'
        : 'border-amber-300 bg-amber-50 text-amber-950';
      icon = <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />;
    } else if (tag === 'CATATAN REDAKSI') {
      borderTheme = isNightMode 
        ? 'border-yellow-500/60 bg-slate-900 text-slate-100' 
        : isWarmMode
        ? 'border-amber-500/50 bg-[#f4ebd6] text-[#3e2e1c]'
        : 'border-yellow-400 bg-yellow-50/90 text-sky-950';
      icon = <Sparkles className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
    }

    return (
      <div 
        key={index} 
        className={`my-5 p-4 sm:p-5 rounded-2xl border-2 ${borderTheme} shadow-2xs flex items-start gap-3`}
      >
        {icon}
        <div className="flex-1 min-w-0">
          <div className={`text-[11px] font-black uppercase tracking-wider font-mono mb-1 ${
            isNightMode ? 'text-yellow-300' : isWarmMode ? 'text-amber-900' : 'text-sky-900'
          }`}>
            {tag}
          </div>
          <div className={`text-sm sm:text-base ${lineSpacingClass}`}>
            {renderInlineFormattedText(body)}
          </div>
        </div>
      </div>
    );
  }

  // 6. Blockquote (> ...) or quotation marks
  if (raw.startsWith('>') || (raw.startsWith('"') && raw.length < 220) || (raw.startsWith('“') && raw.length < 220)) {
    const quoteText = raw.replace(/^>\s*/, '').trim();
    return (
      <div 
        key={index} 
        className={`my-5 p-4 sm:p-5 rounded-2xl border-l-4 border-yellow-400 border-y border-r shadow-2xs relative ${
          isNightMode 
            ? 'bg-slate-900 border-slate-800 text-slate-100' 
            : isWarmMode
            ? 'bg-[#f4ebd6] border-[#dfcfad] text-[#3e2e1c]'
            : 'bg-yellow-50/80 border-yellow-200/80 text-sky-950'
        } ${alignmentClass}`}
      >
        <Quote className="w-6 h-6 text-yellow-500/30 absolute right-4 top-4 pointer-events-none" />
        <p className={`font-serif italic font-medium ${
          isNightMode ? 'text-slate-100' : isWarmMode ? 'text-[#3e2e1c]' : 'text-sky-950'
        } ${fontSizeClass} ${lineSpacingClass} relative z-10`}>
          {renderInlineFormattedText(quoteText)}
        </p>
      </div>
    );
  }

  // 7. Bullet / List Items (•, -, *, 1., 2.)
  const bulletMatch = raw.match(/^([•\-\*]|\d+[\.\)])\s+(.*)$/);
  if (bulletMatch) {
    const bulletSymbol = bulletMatch[1];
    const itemContent = bulletMatch[2];
    const isNumber = /^\d+/.test(bulletSymbol);

    return (
      <div key={index} className={`my-2.5 flex items-start gap-2.5 pl-2 sm:pl-4 ${alignmentClass}`}>
        <span className={`flex-shrink-0 font-bold font-mono text-xs sm:text-sm px-2 py-0.5 rounded-md ${
          isNumber 
            ? isNightMode 
              ? 'bg-slate-800 text-yellow-300 font-black' 
              : isWarmMode
              ? 'bg-amber-200 text-amber-950 font-black'
              : 'bg-sky-100 text-sky-950 font-black'
            : isWarmMode
            ? 'bg-amber-300 text-amber-950'
            : 'bg-yellow-400 text-sky-950'
        }`}>
          {bulletSymbol}
        </span>
        <div className={`flex-1 ${
          isNightMode ? 'text-slate-200' : isWarmMode ? 'text-[#3e2e1c]' : 'text-slate-800'
        } ${fontSizeClass} ${lineSpacingClass}`}>
          {renderInlineFormattedText(itemContent)}
        </div>
      </div>
    );
  }

  // 8. Image Embed in Middle of Body ([FOTO: url | Caption])
  const imageEmbedMatch = raw.match(/^\[(FOTO|GAMBAR|IMAGE):\s*(.*?)(?:\s*\|\s*(.*?))?\]$/i);
  if (imageEmbedMatch) {
    const embedUrl = imageEmbedMatch[2];
    const embedCaption = imageEmbedMatch[3] || 'Dokumentasi liputan redaksi Arun News.';
    return (
      <div key={index} className={`my-6 rounded-2xl overflow-hidden border p-2 sm:p-3 ${
        isNightMode ? 'border-slate-800 bg-slate-900' : isWarmMode ? 'border-[#dfcfad] bg-[#f5ecda]' : 'border-sky-200 bg-sky-50/60'
      }`}>
        <img 
          src={embedUrl} 
          alt={embedCaption} 
          className={`w-full h-auto max-h-96 object-cover rounded-xl border ${
            isNightMode ? 'border-slate-800' : isWarmMode ? 'border-[#dfcfad]' : 'border-sky-100'
          }`} 
        />
        <p className={`text-xs italic text-center mt-2 px-2 ${
          isNightMode ? 'text-slate-400' : isWarmMode ? 'text-[#7a644c]' : 'text-slate-600'
        }`}>
          📷 {embedCaption}
        </p>
      </div>
    );
  }

  // 9. Standard Paragraph with Drop-cap, Dateline badge & Inline Styles
  // Detect dateline like "JAKARTA —" or "SURABAYA, ARUN NEWS —"
  const datelineMatch = raw.match(/^([A-Z\s,]+)\s*(—|--|-)\s*(.*)$/);
  
  const shouldApplyDropCap = (isFirstParagraph || dropCap) && fontFamily === 'serif' && !hasIndent;

  return (
    <p 
      key={index} 
      className={`font-normal ${fontSizeClass} ${lineSpacingClass} mb-5 ${alignmentClass} ${
        isNightMode ? 'text-slate-100' : isWarmMode ? 'text-[#382b1d]' : 'text-slate-800'
      } ${
        hasIndent ? 'indent-8' : ''
      } ${
        shouldApplyDropCap 
          ? `first-letter:text-4xl sm:first-letter:text-5xl first-letter:font-black ${
              isNightMode 
                ? 'first-letter:text-yellow-300' 
                : isWarmMode 
                ? 'first-letter:text-[#6a421b]' 
                : 'first-letter:text-sky-950'
            } first-letter:mr-2.5 first-letter:float-left first-letter:leading-none` 
          : ''
      }`}
    >
      {datelineMatch ? (
        <>
          <span className={`font-mono font-black border text-xs sm:text-sm mr-2 uppercase px-1.5 py-0.5 rounded ${
            isNightMode 
              ? 'text-yellow-300 bg-amber-950/60 border-amber-600/60' 
              : isWarmMode
              ? 'text-amber-950 bg-[#ebd9b8] border-[#ceb58d]'
              : 'text-sky-950 bg-yellow-400/30 border-yellow-400/60'
          }`}>
            📍 {datelineMatch[1].trim()}
          </span>
          <span className={`font-bold mr-1.5 ${
            isNightMode ? 'text-yellow-400' : isWarmMode ? 'text-amber-800' : 'text-sky-900'
          }`}>—</span>
          {renderInlineFormattedText(datelineMatch[3])}
        </>
      ) : (
        renderInlineFormattedText(raw)
      )}
    </p>
  );
}
