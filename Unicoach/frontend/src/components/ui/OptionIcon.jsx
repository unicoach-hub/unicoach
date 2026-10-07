import {
  PenLine, GraduationCap, ChartColumn, TrendingUp, Laptop, School, Trophy, FlaskConical, Bot, ShieldCheck,
  BookOpen, Briefcase, Wallet, Crown, Landmark, Target, Leaf, Flower2, Globe, BadgeCheck, Zap, Cog,
  Stethoscope, Bandage, Dna, Heart, Brain, Cpu, Handshake, Rocket, Monitor, Microscope, Plug, Package,
  Megaphone, ScrollText, Book, FileText, Ruler, ClipboardList, TrendingDown, Euro, Gem, Pill, Users,
  Factory, Hotel, Hospital, House, Building2, HardHat, Medal, Palette, Mic, Backpack, Sprout, Star,
  Sparkles, TriangleAlert, Scale, Cloud, TreeDeciduous,
} from 'lucide-react';

/**
 * Option data across the site still uses emoji strings (icon: '💻').
 * OptionIcon renders them as consistent line icons in a soft brand tile instead,
 * so every dropdown / chip looks premium without touching each options list.
 * React nodes are rendered as-is; unknown emojis fall back to the original character.
 */

const TONES = {
  brand: 'bg-orange-50 text-[#DE5C2B] ring-orange-100',
  amber: 'bg-amber-50 text-amber-600 ring-amber-100',
  rose: 'bg-rose-50 text-rose-500 ring-rose-100',
  red: 'bg-red-50 text-red-500 ring-red-100',
  green: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
};

const EMOJI_ICONS = {
  '📝': [PenLine], '🎓': [GraduationCap], '📊': [ChartColumn], '📈': [TrendingUp], '💻': [Laptop],
  '🏫': [School], '🏆': [Trophy, 'amber'], '🧫': [FlaskConical], '🤖': [Bot], '🛡': [ShieldCheck],
  '📚': [BookOpen], '💼': [Briefcase], '💰': [Wallet], '👑': [Crown, 'amber'], '🏛': [Landmark],
  '🎯': [Target], '🍂': [Leaf, 'amber'], '🍁': [TreeDeciduous, 'red'], '🌸': [Flower2, 'rose'], '🌐': [Globe],
  '✅': [BadgeCheck, 'green'], '⚡': [Zap], '⚙': [Cog], '🩺': [Stethoscope], '🩹': [Bandage], '🧬': [Dna],
  '🧪': [FlaskConical], '🧡': [Heart], '💛': [Heart, 'amber'], '💚': [Heart, 'green'], '🧠': [Brain],
  '🦾': [Cpu], '🤝': [Handshake], '🚀': [Rocket], '🖥': [Monitor], '🔬': [Microscope], '🔌': [Plug],
  '📦': [Package], '📢': [Megaphone], '📜': [ScrollText], '📘': [Book], '📑': [FileText], '📐': [Ruler],
  '📋': [ClipboardList], '📉': [TrendingDown], '💶': [Euro], '💎': [Gem], '💊': [Pill], '👥': [Users],
  '🏭': [Factory], '🏨': [Hotel], '🏥': [Hospital], '🏠': [House], '🏙': [Building2], '🏗': [HardHat],
  '🏅': [Medal, 'amber'], '🎨': [Palette], '🎙': [Mic], '🎒': [Backpack], '🌱': [Sprout, 'green'],
  '🌟': [Star, 'amber'], '✨': [Sparkles], '⚠': [TriangleAlert, 'amber'], '⚖': [Scale], '☁': [Cloud],
};

// Strip the emoji variation selector so '🛡️' and '🛡' resolve to the same icon
const normalize = (emoji) => emoji.replace(/\uFE0F/g, '').trim();


// variant 'tile' = icon in a soft coloured square (dropdowns); 'bare' = plain icon in currentColor (chips, pills)
const OptionIcon = ({ icon, size = 'md', variant = 'tile', className = '' }) => {
  if (icon == null || icon === '') return null;
  if (typeof icon !== 'string') return icon;

  const entry = EMOJI_ICONS[normalize(icon)];
  if (!entry) return <span className={className}>{icon}</span>;

  const [Icon, tone = 'brand'] = entry;
  if (variant === 'bare') {
    return <Icon size={size === 'sm' ? 13 : 15} strokeWidth={2.2} aria-hidden="true" className={`shrink-0 ${className}`} />;
  }
  const box = size === 'sm' ? 'w-5 h-5 rounded-md' : 'w-7 h-7 rounded-lg';
  const iconSize = size === 'sm' ? 12 : 15;

  return (
    <span className={`inline-flex items-center justify-center shrink-0 ring-1 ${box} ${TONES[tone]} ${className}`}>
      <Icon size={iconSize} strokeWidth={2.1} aria-hidden="true" />
    </span>
  );
};

export default OptionIcon;
