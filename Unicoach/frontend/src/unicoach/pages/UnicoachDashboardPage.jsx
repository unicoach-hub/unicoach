import { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import { useParams, Link, useNavigate } from 'react-router-dom';
import brandLogo from '@/assets/blackunicoachlogo.webp';
import { InteractiveLottieIcon, CanvaIconWrapper } from '../../components/ui/InteractiveLottieIcon';
import { 
  getMyMentorProfile,
  getMentorDashboard, 
  updateMentorProfile, 
  uploadMentorPhoto,
  createMentorService, 
  updateMentorService, 
  deleteMentorService, 
  publishMentorSlots, 
  deleteMentorSlot,
  createMentorSingleSlot,
  copyMentorSlots,
  toggleMentorSlotStatus,
  deleteMentorSlotsByDate,
  updateBookingStatus,
  getMentorCoupons,
  createMentorCoupon,
  deleteMentorCoupon,
  getMentorPriorityDMs,
  answerPriorityDM,
  uploadResourceFile,
  getCreatorPayouts,
  updateMentorPayoutDetails,
  sendBookingInviteEmail,
  updateBookingMeetingLink,
  getMentorNotifications,
  markMentorNotificationRead,
  markAllMentorNotificationsRead
} from '../api/unicoachApi';
import { useAuth } from '../../context/AuthContext';
import { 
  Bell,
  BellRing,
  Megaphone,
  LayoutDashboard, 
  Home,
  Video, 
  Calendar,
  CalendarDays,
  Pause,
  Play,
  Filter,
  Layers,
  Users, 
  Settings, 
  ExternalLink, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Trash2, 
  X, 
  Loader2, 
  AlertCircle,
  FileText,
  MessageSquare,
  Sparkles,
  Tag,
  Copy,
  Check,
  Mail,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Download,
  Send,
  Link as LinkIcon,
  Wallet,
  Menu,
  Share2,
  MessageCircle,
  Edit3,
  Crown,
  BarChart3,
  Grid,
  QrCode,
  Smartphone,
  Eye,
  TrendingUp,
  Zap,
  ShieldCheck,
  Lock,
  ShieldAlert,
  ArrowRight,
  Camera,
  Upload,
  Image as ImageIcon,
  ArrowUpRight,
  PieChart,
  Activity,
  Globe2,
  Landmark,
  Building
} from 'lucide-react';
import { 
  convertMentorTimeToIST, 
  getTimezoneDiff, 
  getRecommendedMentorHours 
} from '../utils/timezoneHelper';
import { TimezoneOptions } from '../components/TimezoneOptions';

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

// Social profiles a mentor can show on their public storefront (same keys the backend accepts)
const MENTOR_SOCIAL_FIELDS = [
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://www.linkedin.com/in/your-name' },
  { key: 'instagram', label: 'Instagram', placeholder: 'https://www.instagram.com/your-handle' },
  { key: 'twitter', label: 'X (Twitter)', placeholder: 'https://x.com/your-handle' },
  { key: 'youtube', label: 'YouTube', placeholder: 'https://www.youtube.com/@your-channel' },
  { key: 'github', label: 'GitHub', placeholder: 'https://github.com/your-username' },
  { key: 'website', label: 'Website', placeholder: 'https://your-website.com' }
];
const pickSocialLinks = (links) =>
  Object.fromEntries(MENTOR_SOCIAL_FIELDS.map(({ key }) => [key, (links && typeof links[key] === 'string' && links[key]) || '']));

// ── Automatic payouts (Razorpay Route) helpers ──
const INDIAN_STATES_AND_UTS = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi',
  'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const SETTLEMENT_STATUS_META = {
  PENDING_CAPTURE: { label: 'Payment processing', className: 'bg-slate-50 text-slate-600 border-slate-200' },
  PENDING_ACCOUNT: { label: 'Waiting for your payout account', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  ROUTE_DISABLED: { label: 'Waiting for auto-payouts to switch on', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  ON_HOLD: { label: 'On hold until session completes', className: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  RELEASED: { label: 'Sent to your bank', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  REVERSED: { label: 'Refunded to student', className: 'bg-rose-50 text-rose-700 border-rose-200' },
  FAILED: { label: 'Transfer failed — UniCoach team will retry', className: 'bg-rose-50 text-rose-700 border-rose-200' },
  NOT_APPLICABLE: { label: 'Not applicable', className: 'bg-slate-50 text-slate-500 border-slate-200' }
};

const formatINRAmount = (value) => {
  const n = Number(value) || 0;
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

// ══════════════════════════════════════════════════════════════════════════
// ── CREATOR ANALYTICS CHARTS COMPONENT (UniCoach / Stripe Style Analytics) ──
// ══════════════════════════════════════════════════════════════════════════
const CreatorAnalyticsChartsView = ({ stats, services = [] }) => {
  const [metric, setMetric] = useState('views'); // 'views' | 'earnings' | 'bookings'
  const [range, setRange] = useState('30D'); // '7D' | '30D' | '90D'
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null);
  const [hoveredChannelId, setHoveredChannelId] = useState(null);
  const [hoveredBarDay, setHoveredBarDay] = useState(null);

  // Time-series dataset definitions
  const datasets = {
    '7D': [
      { label: 'Wed', fullDate: 'Wed, Sep 23', views: 118, bookings: 3, earnings: 1497 },
      { label: 'Thu', fullDate: 'Thu, Sep 24', views: 132, bookings: 4, earnings: 1996 },
      { label: 'Fri', fullDate: 'Fri, Sep 25', views: 146, bookings: 4, earnings: 1996 },
      { label: 'Sat', fullDate: 'Sat, Sep 26', views: 194, bookings: 7, earnings: 3493 },
      { label: 'Sun', fullDate: 'Sun, Sep 27', views: 168, bookings: 5, earnings: 2495 },
      { label: 'Mon', fullDate: 'Mon, Sep 28', views: 188, bookings: 6, earnings: 2994 },
      { label: 'Today', fullDate: 'Tue, Sep 29 (Today)', views: 154, bookings: 5, earnings: 2495 },
    ],
    '30D': [
      { label: 'Sep 01', fullDate: 'Sep 01, 2026', views: 42, bookings: 1, earnings: 499 },
      { label: 'Sep 04', fullDate: 'Sep 04, 2026', views: 68, bookings: 2, earnings: 998 },
      { label: 'Sep 07', fullDate: 'Sep 07, 2026', views: 56, bookings: 1, earnings: 499 },
      { label: 'Sep 10', fullDate: 'Sep 10, 2026', views: 98, bookings: 3, earnings: 1497 },
      { label: 'Sep 13', fullDate: 'Sep 13, 2026', views: 86, bookings: 2, earnings: 998 },
      { label: 'Sep 16', fullDate: 'Sep 16, 2026', views: 124, bookings: 4, earnings: 1996 },
      { label: 'Sep 19', fullDate: 'Sep 19, 2026', views: 112, bookings: 3, earnings: 1497 },
      { label: 'Sep 22', fullDate: 'Sep 22, 2026', views: 172, bookings: 5, earnings: 2495 },
      { label: 'Sep 25', fullDate: 'Sep 25, 2026', views: 154, bookings: 4, earnings: 1996 },
      { label: 'Sep 28', fullDate: 'Sep 28, 2026', views: 198, bookings: 7, earnings: 3493 },
      { label: 'Today', fullDate: 'Sep 29 (Today)', views: 154, bookings: 5, earnings: 2495 },
    ],
    '90D': [
      { label: 'Jul W1', fullDate: 'Jul 01 - Jul 07', views: 190, bookings: 4, earnings: 1996 },
      { label: 'Jul W3', fullDate: 'Jul 15 - Jul 21', views: 240, bookings: 6, earnings: 2994 },
      { label: 'Aug W1', fullDate: 'Aug 01 - Aug 07', views: 320, bookings: 8, earnings: 3992 },
      { label: 'Aug W3', fullDate: 'Aug 15 - Aug 21', views: 410, bookings: 11, earnings: 5489 },
      { label: 'Sep W1', fullDate: 'Sep 01 - Sep 07', views: 480, bookings: 14, earnings: 6986 },
      { label: 'Sep W3', fullDate: 'Sep 15 - Sep 21', views: 560, bookings: 16, earnings: 7984 },
      { label: 'Sep W4', fullDate: 'Sep 22 - Sep 29', views: 642, bookings: 18, earnings: 8982 },
    ]
  };

  const chartData = datasets[range] || datasets['30D'];

  const metricConfigs = {
    views: {
      key: 'views',
      name: 'Profile Views',
      prefix: '',
      suffix: ' views',
      strokeColor: '#4F46E5', // indigo-600
      gradientId: 'viewsGradArea',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      totalFormatted: range === '7D' ? '1,100' : range === '90D' ? '2,842' : '1,842',
      trend: '+24% vs last period'
    },
    earnings: {
      key: 'earnings',
      name: 'Gross Volume',
      prefix: '₹',
      suffix: '',
      strokeColor: '#059669', // emerald-600
      gradientId: 'earningsGradArea',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      totalFormatted: `₹${(stats?.totalEarningsINR || 4250).toLocaleString('en-IN')}`,
      trend: '+38% vs last period'
    },
    bookings: {
      key: 'bookings',
      name: 'Booked Sessions',
      prefix: '',
      suffix: ' bookings',
      strokeColor: '#DE5C2B', // brand orange
      gradientId: 'bookingsGradArea',
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200',
      totalFormatted: range === '7D' ? '34' : range === '90D' ? '77' : '36',
      trend: '+19% vs last period'
    }
  };

  const activeMetric = metricConfigs[metric];
  const activeKey = activeMetric.key;

  // Chart Geometry
  const svgWidth = 860;
  const svgHeight = 240;
  const padLeft = 45;
  const padRight = 20;
  const padTop = 25;
  const padBottom = 35;
  const plotW = svgWidth - padLeft - padRight;
  const plotH = svgHeight - padTop - padBottom;

  const maxVal = Math.max(...chartData.map(d => d[activeKey]), 10) * 1.16;

  const points = chartData.map((d, i) => {
    const x = padLeft + (i / (chartData.length - 1)) * plotW;
    const y = padTop + (1 - d[activeKey] / maxVal) * plotH;
    return { x, y, data: d };
  });

  // Smooth spline path
  let pathD = '';
  if (points.length > 0) {
    pathD = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      pathD += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
    }
  }

  const areaD = pathD ? `${pathD} L ${points[points.length - 1].x.toFixed(1)},${(padTop + plotH).toFixed(1)} L ${points[0].x.toFixed(1)},${(padTop + plotH).toFixed(1)} Z` : '';

  // 4 Y-axis ticks
  const yTicks = [0, 0.33, 0.66, 1].map(pct => ({
    val: Math.round(maxVal * pct),
    y: padTop + (1 - pct) * plotH
  }));

  // Weekly Activity Bar Chart
  const weeklyDays = [
    { day: 'Mon', bookings: 14, revenue: 2100, isPeak: false },
    { day: 'Tue', bookings: 18, revenue: 3200, isPeak: false },
    { day: 'Wed', bookings: 26, revenue: 5400, isPeak: true },
    { day: 'Thu', bookings: 16, revenue: 2800, isPeak: false },
    { day: 'Fri', bookings: 20, revenue: 4100, isPeak: false },
    { day: 'Sat', bookings: 28, revenue: 6200, isPeak: true },
    { day: 'Sun', bookings: 12, revenue: 1900, isPeak: false },
  ];
  const maxWeeklyBookings = 30;

  // Traffic Channels Donut
  const channels = [
    { id: 'insta', name: 'Instagram (Reels, Bio & DMs)', pct: 58, visitors: 1068, conv: '5.4%', color: '#E1306C', dotColor: 'bg-[#E1306C]' },
    { id: 'wa', name: 'WhatsApp Communities & Groups', pct: 24, visitors: 442, conv: '7.2%', color: '#10B981', dotColor: 'bg-emerald-500' },
    { id: 'in', name: 'LinkedIn Posts & Recommendations', pct: 12, visitors: 221, conv: '4.1%', color: '#0284C7', dotColor: 'bg-sky-600' },
    { id: 'direct', name: 'UniCoach Marketplace Direct', pct: 6, visitors: 111, conv: '3.6%', color: '#DE5C2B', dotColor: 'bg-[#DE5C2B]' },
  ];

  const donutR = 60;
  const donutC = 2 * Math.PI * donutR; // ~376.99
  let accumulatedPct = 0;

  // Offerings Rankings
  const topServices = (services && services.length > 0 ? services : [
    { _id: '1', title: '30-Min 1:1 Study Abroad & University Selection Call', priceInINR: 1500, type: 'ONE_ON_ONE' },
    { _id: '2', title: 'Statement of Purpose (SOP) & Resume Review', priceInINR: 999, type: 'SOP_REVIEW' },
    { _id: '3', title: 'Priority DM: Ask Any Doubt (24h Guaranteed Reply)', priceInINR: 199, type: 'PRIORITY_DM' },
  ]).map((svc, idx) => {
    const mult = 4 - idx > 0 ? 4 - idx : 1;
    const estCount = idx === 0 ? 4 : idx === 1 ? 3 : 2;
    const rev = svc.priceInINR * mult;
    const share = idx === 0 ? 64 : idx === 1 ? 28 : 8;
    return { ...svc, rank: idx + 1, rev, count: estCount, share };
  });

  // Funnel Data
  const funnelSteps = [
    { label: 'Profile Visitors', count: '1,842', pct: '100%', barPct: 100, color: 'bg-indigo-600' },
    { label: 'Offerings Explored', count: '784', pct: '42.5%', barPct: 70, color: 'bg-indigo-500' },
    { label: 'Booking Window Opened', count: '260', pct: '14.1%', barPct: 45, color: 'bg-indigo-400' },
    { label: 'Checkout Started', count: '112', pct: '6.1%', barPct: 26, color: 'bg-violet-500' },
    { label: 'Confirmed Bookings', count: '88', pct: '4.8%', barPct: 15, color: 'bg-emerald-500', isGoal: true }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── TOP SECTION HEADER WITH DATE FILTER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <span>Audience & Earnings Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time charts on profile visitors, booking conversion rates, and revenue channel breakdown.
          </p>
        </div>

        {/* Date Range Selector Pills */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/90 shadow-2xs self-start sm:self-auto">
          {['7D', '30D', '90D'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRange(r);
                setHoveredPointIndex(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                range === r
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {r === '7D' ? 'Last 7 Days' : r === '30D' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4 KPI CARDS WITH LIVE MINI SPARKLINES ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Page Views */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Total Page Views</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">
              {range === '7D' ? '1,100' : range === '90D' ? '2,842' : '1,842'}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> ↑ 24% from last period
            </span>
          </div>
          {/* Mini Sparkline 1 */}
          <div className="w-full h-7 mt-3">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 28" fill="none">
              <defs>
                <linearGradient id="metricGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,22 Q20,24 35,16 T70,12 T90,6 T100,2" stroke="#10B981" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M0,22 Q20,24 35,16 T70,12 T90,6 T100,2 L100,28 L0,28 Z" fill="url(#metricGrad1)" />
            </svg>
          </div>
        </div>

        {/* Booking Conversion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Booking Conversion</span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-2 py-0.2 rounded-full">
                Top 10%
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">4.8%</p>
            <span className="text-[11px] text-indigo-600 font-semibold mt-0.5 block">
              1 in 21 visitors books a call
            </span>
          </div>
          {/* Mini Sparkline 2 */}
          <div className="w-full h-7 mt-3">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 28" fill="none">
              <defs>
                <linearGradient id="metricGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,18 Q25,10 50,14 T80,8 T100,4" stroke="#6366F1" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M0,18 Q25,10 50,14 T80,8 T100,4 L100,28 L0,28 Z" fill="url(#metricGrad2)" />
            </svg>
          </div>
        </div>

        {/* Gross Creator Volume */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Gross Creator Volume</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded-full">
                0% Fee
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1">
              ₹{(stats?.totalEarningsINR || 4250).toLocaleString('en-IN')}
            </p>
            <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
              0% UniCoach commission
            </span>
          </div>
          {/* Mini Sparkline 3 */}
          <div className="w-full h-7 mt-3">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 28" fill="none">
              <defs>
                <linearGradient id="metricGrad3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d="M0,24 Q20,20 40,15 T70,10 T100,3" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" fill="none" />
              <path d="M0,24 Q20,20 40,15 T70,10 T100,3 L100,28 L0,28 Z" fill="url(#metricGrad3)" />
            </svg>
          </div>
        </div>

        {/* Student Satisfaction */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Student Satisfaction</span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.2 rounded-full">
                18 Reviews
              </span>
            </div>
            <p className="text-2xl font-black text-amber-500 mt-1 flex items-center gap-1.5">
              <span>5.0</span>
              <span className="text-base text-amber-400">★★★★★</span>
            </p>
            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
              100% positive student ratings
            </span>
          </div>
          {/* Mini Rating Progress Bars */}
          <div className="mt-2.5 space-y-1">
            <div className="flex items-center gap-1.5 text-[9.5px] text-slate-500 font-bold">
              <span className="w-3">5★</span>
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-400 rounded-full w-[94%]" />
              </div>
              <span className="w-6 text-right">94%</span>
            </div>
            <div className="flex items-center gap-1.5 text-[9.5px] text-slate-500 font-bold">
              <span className="w-3">4★</span>
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-300 rounded-full w-[6%]" />
              </div>
              <span className="w-6 text-right">6%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── HERO INTERACTIVE LINE/AREA CHART: VIEWS & EARNINGS OVER TIME ── */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-2xs">
        {/* Chart Header & Metric Switcher Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Performance Timeline
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Interactive Chart
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {activeMetric.totalFormatted}
              </h3>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {activeMetric.trend}
              </span>
            </div>
          </div>

          {/* Metric Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'views', label: 'Profile Views', icon: Eye, color: 'text-indigo-600' },
              { id: 'earnings', label: 'Gross Volume (₹)', icon: TrendingUp, color: 'text-emerald-600' },
              { id: 'bookings', label: 'Bookings Count', icon: Users, color: 'text-[#DE5C2B]' },
            ].map((btn) => {
              const Icon = btn.icon;
              const isSelected = metric === btn.id;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => {
                    setMetric(btn.id);
                    setHoveredPointIndex(null);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : btn.color}`} />
                  <span>{btn.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* SVG Spline & Area Chart with Hover Guide */}
        <div className="relative mt-4 w-full">
          <svg
            className="w-full h-[220px] sm:h-[250px] overflow-visible select-none"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            fill="none"
          >
            <defs>
              <linearGradient id="viewsGradArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="earningsGradArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="bookingsGradArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#DE5C2B" stopOpacity="0.28" />
                <stop offset="100%" stopColor="#DE5C2B" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Dashed Gridlines & Y-axis labels */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={tick.y}
                  x2={svgWidth - padRight}
                  y2={tick.y}
                  stroke="#F1F5F9"
                  strokeDasharray="4 4"
                  strokeWidth="1.2"
                />
                <text
                  x={padLeft - 8}
                  y={tick.y + 3.5}
                  textAnchor="end"
                  className="text-[10px] font-mono font-medium fill-slate-400"
                >
                  {activeMetric.prefix}{tick.val.toLocaleString('en-IN')}
                </text>
              </g>
            ))}

            {/* Filled Area Under Curve */}
            {areaD && (
              <path
                d={areaD}
                fill={`url(#${activeMetric.gradientId})`}
                className="transition-all duration-300"
              />
            )}

            {/* Main Smooth Line Stroke */}
            {pathD && (
              <path
                d={pathD}
                stroke={activeMetric.strokeColor}
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                className="transition-all duration-300"
              />
            )}

            {/* X-axis Date Labels */}
            {points.map((p, i) => (
              <text
                key={i}
                x={p.x}
                y={svgHeight - 12}
                textAnchor="middle"
                className="text-[10.5px] font-semibold fill-slate-400"
              >
                {p.data.label}
              </text>
            ))}

            {/* Hover Vertical Guide Line & Active Dot */}
            {hoveredPointIndex !== null && points[hoveredPointIndex] && (
              <g>
                <line
                  x1={points[hoveredPointIndex].x}
                  y1={padTop}
                  x2={points[hoveredPointIndex].x}
                  y2={padTop + plotH}
                  stroke={activeMetric.strokeColor}
                  strokeDasharray="3 3"
                  strokeWidth="1.5"
                  opacity="0.65"
                />
                <circle
                  cx={points[hoveredPointIndex].x}
                  cy={points[hoveredPointIndex].y}
                  r="9"
                  fill={activeMetric.strokeColor}
                  opacity="0.18"
                  className="animate-ping"
                />
                <circle
                  cx={points[hoveredPointIndex].x}
                  cy={points[hoveredPointIndex].y}
                  r="5"
                  fill="#FFFFFF"
                  stroke={activeMetric.strokeColor}
                  strokeWidth="3"
                />
              </g>
            )}

            {/* Invisible Hover Hitboxes across each column */}
            {points.map((p, idx) => {
              const colW = plotW / (points.length - 1);
              return (
                <rect
                  key={idx}
                  x={p.x - colW / 2}
                  y={padTop}
                  width={colW}
                  height={plotH}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPointIndex(idx)}
                  onMouseLeave={() => setHoveredPointIndex(null)}
                />
              );
            })}
          </svg>

          {/* Floating Tooltip HTML Overlay for Precision Positioning */}
          {hoveredPointIndex !== null && points[hoveredPointIndex] && (
            <div
              className="absolute z-20 pointer-events-none transition-all duration-150 transform -translate-x-1/2 -translate-y-full"
              style={{
                left: `${(points[hoveredPointIndex].x / svgWidth) * 100}%`,
                top: `${(points[hoveredPointIndex].y / svgHeight) * 100 - 4}%`,
              }}
            >
              <div className="bg-slate-950 text-white rounded-xl px-3 py-2 shadow-xl border border-slate-800 text-center whitespace-nowrap min-w-[130px]">
                <p className="text-[10px] text-slate-400 font-medium">
                  {points[hoveredPointIndex].data.fullDate}
                </p>
                <p className="text-sm font-black text-white mt-0.5">
                  {activeMetric.prefix}
                  {points[hoveredPointIndex].data[activeKey].toLocaleString('en-IN')}
                  {activeMetric.suffix}
                </p>
                <div className="flex items-center justify-center gap-2 text-[9.5px] text-slate-300 mt-1 border-t border-white/10 pt-1">
                  <span>{points[hoveredPointIndex].data.bookings} calls booked</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-bold">₹{points[hoveredPointIndex].data.earnings}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 2-COLUMN SECTION: TRAFFIC DONUT CHART & WEEKLY ACTIVITY BAR CHART ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Traffic Acquisition Donut Chart */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-[#DE5C2B]" />
                <span>Traffic Acquisition Channels</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Where your student visitors discover your page</p>
            </div>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
              1,842 Visits
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* SVG Donut Ring */}
            <div className="sm:col-span-5 flex justify-center">
              <div className="relative w-44 h-44">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  {channels.map((ch) => {
                    const strokeDasharray = `${(ch.pct / 100) * donutC} ${donutC}`;
                    const strokeDashoffset = -((accumulatedPct / 100) * donutC);
                    accumulatedPct += ch.pct;
                    const isHovered = hoveredChannelId === ch.id;

                    return (
                      <circle
                        key={ch.id}
                        cx="80"
                        cy="80"
                        r={donutR}
                        fill="none"
                        stroke={ch.color}
                        strokeWidth={isHovered ? 18 : 14}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-200 cursor-pointer"
                        onMouseEnter={() => setHoveredChannelId(ch.id)}
                        onMouseLeave={() => setHoveredChannelId(null)}
                      />
                    );
                  })}
                </svg>

                {/* Donut Center Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-xl font-black text-slate-900">
                    {hoveredChannelId
                      ? `${channels.find(c => c.id === hoveredChannelId)?.pct}%`
                      : '1,842'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {hoveredChannelId
                      ? channels.find(c => c.id === hoveredChannelId)?.name.split(' ')[0]
                      : 'Visitors'}
                  </span>
                </div>
              </div>
            </div>

            {/* Channels Legend Breakdown */}
            <div className="sm:col-span-7 space-y-2.5">
              {channels.map((ch) => {
                const isHovered = hoveredChannelId === ch.id;
                return (
                  <div
                    key={ch.id}
                    onMouseEnter={() => setHoveredChannelId(ch.id)}
                    onMouseLeave={() => setHoveredChannelId(null)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isHovered
                        ? 'bg-slate-50 border-slate-300 shadow-2xs'
                        : 'bg-white border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${ch.dotColor}`} />
                        <span className="font-bold text-slate-900 truncate max-w-[140px] sm:max-w-[160px]">
                          {ch.name}
                        </span>
                      </div>
                      <span className="font-black text-slate-900">{ch.pct}%</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1 pl-4.5">
                      <span>{ch.visitors} visitors</span>
                      <span className="text-emerald-600 font-semibold">{ch.conv} conv.</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Weekly Activity Bar Chart */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Weekly Booking & Call Volume</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Peak traffic days and booking trends</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              Wed & Sat Peak
            </span>
          </div>

          {/* Bar Chart Container */}
          <div className="pt-2">
            <div className="h-44 flex items-end justify-between gap-2 sm:gap-3 px-2 border-b border-slate-100 pb-2">
              {weeklyDays.map((item) => {
                const heightPct = (item.bookings / maxWeeklyBookings) * 100;
                const isHovered = hoveredBarDay === item.day;

                return (
                  <div
                    key={item.day}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    onMouseEnter={() => setHoveredBarDay(item.day)}
                    onMouseLeave={() => setHoveredBarDay(null)}
                  >
                    {/* Floating Tooltip on Bar Hover */}
                    {isHovered && (
                      <div className="absolute -top-12 z-20 bg-slate-950 text-white rounded-lg px-2.5 py-1 text-[10px] font-bold shadow-md whitespace-nowrap">
                        {item.bookings} calls · ₹{item.revenue.toLocaleString('en-IN')}
                      </div>
                    )}

                    {/* Bar Column */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full max-w-[34px] rounded-t-xl transition-all duration-300 relative ${
                        item.isPeak
                          ? 'bg-gradient-to-t from-orange-500 to-[#DE5C2B] shadow-xs'
                          : 'bg-slate-200 group-hover:bg-slate-300'
                      }`}
                    >
                      {item.isPeak && (
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-400" />
                      )}
                    </div>

                    {/* Day Label */}
                    <span className={`text-[11px] font-bold mt-2 ${
                      item.isPeak ? 'text-[#DE5C2B]' : 'text-slate-500'
                    }`}>
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3.5 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-[#DE5C2B]" />
                <span className="font-semibold text-slate-700">Peak Conversion Days</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Avg. response time: <strong>4.2 mins</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2-COLUMN SECTION: CONVERSION FUNNEL & TOP OFFERINGS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Conversion Funnel Chart */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Student Conversion Funnel</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Journey from visitor to confirmed paying mentee</p>
            </div>
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
              4.8% Overall Conv.
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {funnelSteps.map((step, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-2">
                    <span className="w-4.5 h-4.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span>{step.label}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900">{step.count}</span>
                    <span className={`text-[10.5px] font-bold px-1.5 py-0.2 rounded ${
                      step.isGoal
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {step.pct}
                    </span>
                  </div>
                </div>

                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full ${step.color} rounded-full transition-all duration-500`}
                    style={{ width: `${step.barPct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Top Performing Offerings Ranking & Revenue Breakdown */}
        <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Top Performing Offerings</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Highest earning mentorship services</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
              0% Fee Retained
            </span>
          </div>

          <div className="space-y-3 pt-1">
            {topServices.map((svc) => (
              <div
                key={svc._id}
                className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 hover:bg-white hover:shadow-xs transition-all space-y-2"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-6 h-6 rounded-lg font-black text-xs flex items-center justify-center flex-shrink-0 ${
                      svc.rank === 1
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : svc.rank === 2
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-slate-100 text-slate-600'
                    }`}>
                      #{svc.rank}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{svc.title}</p>
                      <p className="text-[10px] text-slate-500">₹{svc.priceInINR} per session · 0% commission</p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-black text-emerald-600 block">
                      ₹{svc.rev.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {svc.count} bookings ({svc.share}% share)
                    </span>
                  </div>
                </div>

                {/* Revenue Share Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-[#DE5C2B] rounded-full"
                    style={{ width: `${svc.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const UnicoachDashboardPage = () => {
  const { handle: paramHandle } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, openLoginModal } = useAuth();

  const [handle, setHandle] = useState(paramHandle ? paramHandle.replace(/^@/, '') : '');
  const [resolvingMyProfile, setResolvingMyProfile] = useState(!paramHandle);
  const [hasNoCreatorProfile, setHasNoCreatorProfile] = useState(false);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState(null);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardHandle, setOnboardHandle] = useState('');
  const [onboardForm, setOnboardForm] = useState({
    name: '',
    email: '',
    headline: '',
    bio: ''
  });
  const [onboardLoading, setOnboardLoading] = useState(false);
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'services', 'calendar', 'bookings', 'coupons', 'settings'
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // UniCoach Sidebar & Share Modal State
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isInstagramModalOpen, setIsInstagramModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [isEnhanceModalOpen, setIsEnhanceModalOpen] = useState(false);

  // Instagram Auto DM Configuration State
  const [instagramConfig, setInstagramConfig] = useState({
    connected: true,
    handle: 'sagar.punia',
    autoDmEnabled: true,
    triggerKeywords: 'IELTS, SOP, ADMIT, VISA, MENTOR',
    replyMessage: 'Hey! Thanks for commenting. Here is the direct link to book a 1:1 strategy call or download my SOP template with 0% platform fee: {{storefront_link}}'
  });

  // Memberships & Subscriptions State
  const [membershipsList, setMembershipsList] = useState([
    {
      id: 'tier-1',
      name: 'Study Abroad Inner Circle',
      priceInINR: 499,
      billingCycle: 'MONTHLY',
      subscribersCount: 14,
      perks: ['Monthly 30-min group Q&A call', 'Access to exclusive SOP & LOR templates', 'Priority WhatsApp DM support']
    },
    {
      id: 'tier-2',
      name: '1:1 Elite Mentorship Pass',
      priceInINR: 1999,
      billingCycle: 'MONTHLY',
      subscribersCount: 6,
      perks: ['2 private 1:1 video calls per month', 'Unlimited SOP and resume document reviews', 'Direct mock visa interview simulation']
    }
  ]);

  // Edit Service Modal State
  const [isEditServiceModalOpen, setIsEditServiceModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    priceInINR: 499,
    durationMinutes: 30,
    maxDeliveryHours: 48
  });

  // Modals & Forms
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [newService, setNewService] = useState({
    type: 'ONE_ON_ONE',
    title: '',
    description: '',
    durationMinutes: 30,
    priceInINR: 499,
    maxDeliveryHours: 48,
    digitalAsset: {
      fileUrl: '',
      fileName: '',
      fileType: 'PDF',
      fileSize: '',
      resourceLink: ''
    },
    customQuestions: []
  });

  // Priority DMs Inbox State (UniCoach Feature)
  const [priorityDms, setPriorityDms] = useState({
    total: 0,
    pendingCount: 0,
    answeredCount: 0,
    pending: [],
    answered: []
  });
  const [priorityDmsLoading, setPriorityDmsLoading] = useState(false);
  const [activeDmFilter, setActiveDmFilter] = useState('PENDING'); // 'PENDING' | 'ANSWERED'
  const [replyForms, setReplyForms] = useState({}); // { [bookingId]: { answerText: '', attachmentUrl: '' } }
  const [isAnswering, setIsAnswering] = useState(false);

  // Digital Resource Upload State
  const [resourceUploadLoading, setResourceUploadLoading] = useState(false);
  const [uploadedAsset, setUploadedAsset] = useState(null);

  // Service modal collapsible intake questions
  const [showIntakeQuestionsConfig, setShowIntakeQuestionsConfig] = useState(false);

  // Coupons State
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    maxUses: 50,
    expiresAt: ''
  });

  // Expandable state for student answers in Bookings tab
  const [expandedBookingIds, setExpandedBookingIds] = useState(new Set());

  // Meeting Link Actions State (1-click email, copy, custom link)
  const [sendingEmailId, setSendingEmailId] = useState(null);
  const [copiedBookingId, setCopiedBookingId] = useState(null);
  const [editingMeetingBooking, setEditingMeetingBooking] = useState(null);
  const [customMeetingUrl, setCustomMeetingUrl] = useState('');
  const [savingMeetingUrl, setSavingMeetingUrl] = useState(false);
  const [bookingFilter, setBookingFilter] = useState('ALL'); // 'ALL' | 'CALLS' | 'DMS' | 'SOP' | 'PAST'

  // Legacy manual payout history (manual withdrawals are retired — payouts are automatic via Razorpay Route)
  const [payouts, setPayouts] = useState([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);

  // Dedicated Bank & Payout Account (Razorpay Route linked account) State
  const [isBankDetailsModalOpen, setIsBankDetailsModalOpen] = useState(false);
  const [savingBankDetails, setSavingBankDetails] = useState(false);
  const [bankForm, setBankForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    bankName: '',
    pan: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    phone: ''
  });

  const openBankDetailsModal = () => {
    const m = data?.mentor || {};
    const bank = m.defaultPayoutDetails || {};
    const kyc = m.kyc || {};
    const addr = kyc.address || {};
    setBankForm({
      accountHolderName: bank.accountHolderName || m.name || '',
      accountNumber: bank.accountNumber || '',
      confirmAccountNumber: bank.accountNumber || '',
      ifscCode: bank.ifscCode || '',
      bankName: bank.bankName || '',
      pan: kyc.pan || '',
      addressLine1: addr.street1 || '',
      addressLine2: addr.street2 || '',
      city: addr.city || '',
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      phone: m.phone || ''
    });
    setIsBankDetailsModalOpen(true);
  };

  const handleSaveBankDetails = async (e) => {
    if (e) e.preventDefault();
    const fail = (text) => setFeedback({ type: 'error', text });
    const accountNumber = bankForm.accountNumber.trim();
    const ifscCode = bankForm.ifscCode.trim().toUpperCase();
    const pan = bankForm.pan.trim().toUpperCase();
    const postalCode = bankForm.postalCode.trim();
    const phoneDigits = bankForm.phone.replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');

    if (!bankForm.accountHolderName.trim()) return fail('Bank Account Holder Name is required.');
    if (!/^\d{9,18}$/.test(accountNumber)) return fail('Bank Account Number must be 9 to 18 digits.');
    if (accountNumber !== bankForm.confirmAccountNumber.trim()) return fail('Bank Account Numbers do not match.');
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifscCode)) return fail('Invalid IFSC Code format (e.g. HDFC0001234 or SBIN0004567).');
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) return fail('Invalid PAN format (e.g. ABCDE1234F).');
    if (!bankForm.addressLine1.trim()) return fail('Address Line 1 is required.');
    if (!bankForm.city.trim()) return fail('City is required.');
    if (!bankForm.state) return fail('Please select your state.');
    if (!/^\d{6}$/.test(postalCode)) return fail('PIN Code must be 6 digits.');
    if (!/^\d{10}$/.test(phoneDigits)) return fail('Please enter a valid 10-digit mobile number.');

    setSavingBankDetails(true);
    try {
      const res = await updateMentorPayoutDetails(handle, {
        accountHolderName: bankForm.accountHolderName.trim(),
        accountNumber,
        ifscCode,
        bankName: bankForm.bankName.trim(),
        pan,
        addressLine1: bankForm.addressLine1.trim(),
        addressLine2: bankForm.addressLine2.trim(),
        city: bankForm.city.trim(),
        state: bankForm.state,
        postalCode,
        phone: phoneDigits
      });
      setData(prev => ({
        ...prev,
        mentor: {
          ...prev?.mentor,
          defaultPayoutDetails: res.defaultPayoutDetails || prev?.mentor?.defaultPayoutDetails,
          kyc: res.kyc || prev?.mentor?.kyc
        }
      }));
      setIsBankDetailsModalOpen(false);
      setFeedback({
        type: res.routeAccount?.lastError ? 'error' : 'success',
        text: res.message || 'Bank payout details saved.'
      });
      // Quiet refresh so payout account status / earnings reflect the update (no full-page spinner)
      try {
        const fresh = await getMentorDashboard(handle);
        setData(fresh);
      } catch (refreshErr) {
        console.error('Failed to refresh dashboard after saving bank details:', refreshErr);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update bank details.' });
    } finally {
      setSavingBankDetails(false);
    }
  };

  const loadPayouts = async (mentorHandle) => {
    if (!mentorHandle) return;
    setPayoutsLoading(true);
    try {
      const res = await getCreatorPayouts(mentorHandle);
      setPayouts(res.payouts || []);
    } catch (err) {
      console.error('Failed to load legacy payouts:', err);
    } finally {
      setPayoutsLoading(false);
    }
  };

  // Mentor Announcements & Admin Alerts State
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'URGENT' | 'PAYOUT' | 'ANNOUNCEMENT' | 'SYSTEM'

  const loadNotifications = async (mentorHandle) => {
    if (!mentorHandle) return;
    setNotificationsLoading(true);
    try {
      const res = await getMentorNotifications(mentorHandle);
      setNotifications(Array.isArray(res.notifications) ? res.notifications : []);
      setUnreadNotificationsCount(res.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load mentor notifications:', err);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleMarkNotificationRead = async (notifId) => {
    try {
      await markMentorNotificationRead(handle, notifId);
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, isRead: true } : n));
      setUnreadNotificationsCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await markAllMentorNotificationsRead(handle);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadNotificationsCount(0);
      setFeedback({ type: 'success', text: 'All notifications marked as read!' });
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
      setFeedback({ type: 'error', text: 'Failed to mark all notifications as read.' });
    }
  };

  // Slot Publishing Helpers & Presets
  const getDaysOffsetStr = (offsetDays = 0) => {
    const d = new Date(Date.now() + offsetDays * 86400000);
    return d.toISOString().split('T')[0];
  };

  const getUpcomingWeekendDates = () => {
    const dates = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now.getTime() + i * 86400000);
      const day = d.getDay();
      if (day === 0 || day === 6) { // Saturday or Sunday
        dates.push(d.toISOString().split('T')[0]);
      }
    }
    return dates.length > 0 ? dates : [getDaysOffsetStr(1)];
  };

  const [slotDatePreset, setSlotDatePreset] = useState('TOMORROW'); // 'TODAY' | 'TOMORROW' | 'DAY_AFTER' | 'NEXT_3_DAYS' | 'WEEKEND' | 'NEXT_7_DAYS' | 'CUSTOM'
  const [selectedSlotDates, setSelectedSlotDates] = useState(() => [getDaysOffsetStr(1)]);
  const [slotTimePreset, setSlotTimePreset] = useState('EVENING'); // 'EVENING' | 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'FULL_DAY' | 'CUSTOM'

  const [slotPublishForm, setSlotPublishForm] = useState(() => ({
    dateStr: getDaysOffsetStr(1), // Tomorrow
    startTime: '18:00',
    endTime: '21:00',
    durationMinutes: 30
  }));

  // UniCoach Sub-Navigation Mode: 'CALENDAR_VIEW' | 'WEEKLY_HOURS' | 'BATCH_GENERATOR'
  const [calendarSubTab, setCalendarSubTab] = useState('CALENDAR_VIEW');

  // Month navigation state for visual calendar
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Selected date on visual calendar (defaults to tomorrow)
  const [selectedCalendarDateStr, setSelectedCalendarDateStr] = useState(() => getDaysOffsetStr(1));

  // Selected 1:1 Service to filter or associate slots with
  const [selectedServiceIdForSlots, setSelectedServiceIdForSlots] = useState('ALL');

  // UniCoach-Style Weekly Recurring Schedule (Monday to Sunday)
  const [weeklySchedule, setWeeklySchedule] = useState({
    1: { dayName: 'Monday', enabled: true, startTime: '10:00', endTime: '19:00' },
    2: { dayName: 'Tuesday', enabled: true, startTime: '10:00', endTime: '19:00' },
    3: { dayName: 'Wednesday', enabled: true, startTime: '10:00', endTime: '19:00' },
    4: { dayName: 'Thursday', enabled: true, startTime: '10:00', endTime: '19:00' },
    5: { dayName: 'Friday', enabled: true, startTime: '10:00', endTime: '19:00' },
    6: { dayName: 'Saturday', enabled: false, startTime: '11:00', endTime: '17:00' },
    0: { dayName: 'Sunday', enabled: false, startTime: '11:00', endTime: '17:00' }
  });
  const [weeklyPublishDays, setWeeklyPublishDays] = useState(14);
  const [weeklySlotDuration, setWeeklySlotDuration] = useState(30);

  // Filter mentor services that are 1:1 sessions
  const oneOnOneServices = useMemo(() => {
    return (data?.services || []).filter(s => s.type === 'ONE_ON_ONE' && s.active !== false);
  }, [data?.services]);

  // Mentor's international home timezone (defaults to Dublin if abroad, or profile value)
  const [mentorTimezone, setMentorTimezone] = useState(
    data?.mentor?.ianaTimezone || 'Europe/Dublin'
  );

  useEffect(() => {
    if (data?.mentor?.ianaTimezone) {
      setMentorTimezone(data.mentor.ianaTimezone);
    }
  }, [data?.mentor?.ianaTimezone]);

  const handleTimezoneChange = async (newTz) => {
    setMentorTimezone(newTz);
    try {
      await updateMentorProfile({
        ...profileForm,
        handle,
        ianaTimezone: newTz
      });
      setFeedback({ type: 'success', text: `Timezone updated to ${newTz}. Schedule will sync to this location.` });
      await loadDashboard(handle);
    } catch (err) {
      console.error('Failed to save timezone:', err);
    }
  };

  // Calendar Schedule Day Filter & Quick Modals
  const [scheduleDayFilter, setScheduleDayFilter] = useState('ALL'); // 'ALL' | 'TODAY' | 'TOMORROW' | 'DAY_AFTER' | 'CUSTOM'
  const [scheduleCustomDate, setScheduleCustomDate] = useState('');
  const [quickAddModal, setQuickAddModal] = useState({ isOpen: false, dateStr: '', timeStr: '18:00', durationMinutes: 30, serviceId: 'ALL' });
  const [copyScheduleModal, setCopyScheduleModal] = useState({ isOpen: false, sourceDateStr: '', targetDateStr: '' });

  // Dynamic date helpers (Pure English)
  const todayStr = getDaysOffsetStr(0);
  const tomorrowStr = getDaysOffsetStr(1);
  const dayAfterStr = getDaysOffsetStr(2);

  // Grouped active upcoming slots for the mentor's live calendar view
  const groupedUpcomingSlots = useMemo(() => {
    const rawSlots = data?.upcomingSlots || [];
    if (!Array.isArray(rawSlots) || rawSlots.length === 0) return [];

    const groupsMap = {};

    rawSlots.forEach(slot => {
      const dateObj = new Date(slot.startUtc);
      if (isNaN(dateObj.getTime())) return;
      const dateKey = dateObj.toISOString().split('T')[0];

      let dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: mentorTimezone });
      let isToday = false;
      let isTomorrow = false;
      let isDayAfter = false;

      if (dateKey === todayStr) {
        dayLabel = 'Today';
        isToday = true;
      } else if (dateKey === tomorrowStr) {
        dayLabel = 'Tomorrow';
        isTomorrow = true;
      } else if (dateKey === dayAfterStr) {
        dayLabel = 'Day After Tomorrow';
        isDayAfter = true;
      }

      if (!groupsMap[dateKey]) {
        groupsMap[dateKey] = {
          dateKey,
          dayLabel,
          formattedFullDate: dateObj.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: mentorTimezone }),
          dateObj,
          isToday,
          isTomorrow,
          isDayAfter,
          slots: []
        };
      }

      const timeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: mentorTimezone });
      const endTimeStr = new Date(slot.endUtc).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: mentorTimezone });
      
      // Indian Student Time (IST) conversion
      const istTimeStr = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
      const istEndTimeStr = new Date(slot.endUtc).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });

      groupsMap[dateKey].slots.push({
        ...slot,
        timeStr: `${timeStr} – ${endTimeStr}`,
        istTimeStr: `${istTimeStr} – ${istEndTimeStr} IST`
      });
    });

    const groupsList = Object.values(groupsMap).sort((a, b) => new Date(a.dateKey) - new Date(b.dateKey));
    groupsList.forEach(g => {
      g.slots.sort((a, b) => new Date(a.startUtc) - new Date(b.startUtc));
      g.availableCount = g.slots.filter(s => s.status === 'AVAILABLE').length;
      g.blockedCount = g.slots.filter(s => s.status === 'BLOCKED').length;
      g.bookedCount = g.slots.filter(s => s.status === 'BOOKED' || s.status === 'HELD').length;
    });

    return groupsList;
  }, [data?.upcomingSlots, todayStr, tomorrowStr, dayAfterStr, mentorTimezone]);

  // Dynamic counts for day filter pills
  const todayGroup = groupedUpcomingSlots.find(g => g.dateKey === todayStr);
  const tomorrowGroup = groupedUpcomingSlots.find(g => g.dateKey === tomorrowStr);
  const dayAfterGroup = groupedUpcomingSlots.find(g => g.dateKey === dayAfterStr);

  const totalUpcomingSlotsCount = data?.upcomingSlots?.length || 0;
  const todaySlotsCount = todayGroup?.slots?.length || 0;
  const tomorrowSlotsCount = tomorrowGroup?.slots?.length || 0;
  const dayAfterSlotsCount = dayAfterGroup?.slots?.length || 0;

  // Selected date group for the visual calendar day view
  const selectedDateGroup = useMemo(() => {
    const found = groupedUpcomingSlots.find(g => g.dateKey === selectedCalendarDateStr);
    if (found) return found;

    const dObj = new Date(selectedCalendarDateStr);
    const isValid = !isNaN(dObj.getTime());
    return {
      dateKey: selectedCalendarDateStr,
      dayLabel: isValid ? dObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : selectedCalendarDateStr,
      formattedFullDate: isValid ? dObj.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : selectedCalendarDateStr,
      isToday: selectedCalendarDateStr === todayStr,
      isTomorrow: selectedCalendarDateStr === tomorrowStr,
      isDayAfter: selectedCalendarDateStr === dayAfterStr,
      slots: [],
      availableCount: 0,
      bookedCount: 0,
      blockedCount: 0
    };
  }, [groupedUpcomingSlots, selectedCalendarDateStr, todayStr, tomorrowStr, dayAfterStr]);

  // Month visual calendar matrix (Monday through Sunday)
  const monthCalendarData = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();

    // Monday-based index: 0 = Mon, 6 = Sun
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days = [];
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        dateStr: ''
      });
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateStr
      });
    }

    const remainder = days.length % 7;
    if (remainder !== 0) {
      for (let i = 1; i <= 7 - remainder; i++) {
        days.push({
          dayNumber: i,
          isCurrentMonth: false,
          dateStr: ''
        });
      }
    }

    return days;
  }, [calendarMonth]);

  // Filtered schedule groups based on active day filter
  const filteredGroupedSlots = useMemo(() => {
    if (scheduleDayFilter === 'ALL') return groupedUpcomingSlots;
    if (scheduleDayFilter === 'TODAY') return groupedUpcomingSlots.filter(g => g.dateKey === todayStr);
    if (scheduleDayFilter === 'TOMORROW') return groupedUpcomingSlots.filter(g => g.dateKey === tomorrowStr);
    if (scheduleDayFilter === 'DAY_AFTER') return groupedUpcomingSlots.filter(g => g.dateKey === dayAfterStr);
    if (scheduleDayFilter === 'CUSTOM' && scheduleCustomDate) {
      return groupedUpcomingSlots.filter(g => g.dateKey === scheduleCustomDate);
    }
    return groupedUpcomingSlots;
  }, [groupedUpcomingSlots, scheduleDayFilter, scheduleCustomDate, todayStr, tomorrowStr, dayAfterStr]);

  // Profile Settings State
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    headline: '',
    bio: '',
    avatarUrl: '',
    coverImageUrl: '',
    country: '',
    university: '',
    course: '',
    ianaTimezone: 'Asia/Kolkata',
    bufferMinutes: 10,
    noticePeriodHours: 2,
    socialLinks: pickSocialLinks()
  });
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // ── Share & Grow State (Real QR Code & Instagram Story Graphics) ──
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

  // Generate real scannable QR Code for the mentor's storefront
  useEffect(() => {
    const targetHandle = data?.mentor?.handle || handle;
    if (!targetHandle) return;
    const storefrontUrl = `${window.location.origin}/@${targetHandle}`;
    QRCode.toDataURL(storefrontUrl, {
      width: 480,
      margin: 2,
      color: {
        dark: '#0F172A',
        light: '#FFFFFF'
      }
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('Error generating QR:', err));
  }, [data?.mentor?.handle, handle]);

  const loadPriorityDms = async (targetHandle) => {
    if (!targetHandle) return;
    setPriorityDmsLoading(true);
    try {
      const res = await getMentorPriorityDMs(targetHandle);
      setPriorityDms(res);
    } catch (err) {
      console.error('Error fetching priority DMs:', err);
    } finally {
      setPriorityDmsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setResourceUploadLoading(true);
    try {
      const res = await uploadResourceFile(handle, formData);
      setUploadedAsset(res.digitalAsset);
      setNewService(prev => ({
        ...prev,
        digitalAsset: res.digitalAsset
      }));
      setFeedback({ type: 'success', text: `Resource file "${res.digitalAsset.fileName}" uploaded successfully!` });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'File upload failed' });
    } finally {
      setResourceUploadLoading(false);
    }
  };

  const handleAnswerSubmit = async (bookingId) => {
    const form = replyForms[bookingId];
    if (!form?.answerText?.trim()) {
      alert('Please enter your answer text before submitting.');
      return;
    }

    setIsAnswering(true);
    try {
      await answerPriorityDM(handle, bookingId, {
        answerText: form.answerText.trim(),
        attachmentUrl: form.attachmentUrl?.trim() || ''
      });
      setFeedback({ type: 'success', text: 'Answer sent to student! Your earnings have been released and will be settled to your bank by Razorpay.' });
      await loadPriorityDms(handle);
      await loadDashboard(handle); // Refresh wallet balance
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to submit answer' });
    } finally {
      setIsAnswering(false);
    }
  };

  const loadCoupons = async (targetHandle) => {
    if (!targetHandle) return;
    setCouponsLoading(true);
    try {
      const res = await getMentorCoupons(targetHandle);
      setCoupons(res);
    } catch (err) {
      console.error('Error fetching coupons:', err);
    } finally {
      setCouponsLoading(false);
    }
  };

  const handleOpenEditService = (svc) => {
    setEditingService(svc);
    setEditForm({
      title: svc.title || '',
      description: svc.description || '',
      priceInINR: svc.priceInINR || 499,
      durationMinutes: svc.durationMinutes || 30,
      maxDeliveryHours: svc.maxDeliveryHours || 48
    });
    setIsEditServiceModalOpen(true);
  };

  const handleSaveEditedService = async (e) => {
    e.preventDefault();
    if (!editingService?._id) return;
    setActionLoading(true);
    try {
      await updateMentorService(handle, editingService._id, editForm);
      setFeedback({ type: 'success', text: `Service "${editForm.title}" updated successfully!` });
      setIsEditServiceModalOpen(false);
      setEditingService(null);
      await loadDashboard(handle);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update service' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!onboardForm.name.trim() || !onboardForm.email.trim()) {
      setFeedback({ type: 'error', text: 'Name and Email are required to create your profile.' });
      return;
    }
    setOnboardLoading(true);
    setFeedback(null);
    try {
      await updateMentorProfile({
        ...onboardForm,
        handle: onboardHandle,
        ianaTimezone: 'Asia/Kolkata',
        bufferMinutes: 10,
        noticePeriodHours: 2
      });

      // Automatically seed 3 starter services so creator has full profile immediately
      await createMentorService(onboardHandle, {
        type: 'ONE_ON_ONE',
        title: '30-Min 1:1 Study Abroad Consultation',
        description: 'Direct 1-on-1 video call to discuss university shortlisting, admission strategy, documents checklist, and visa process.',
        durationMinutes: 30,
        priceInINR: 499
      }).catch(() => {});

      await createMentorService(onboardHandle, {
        type: 'SOP_REVIEW',
        title: 'Statement of Purpose (SOP) & Resume Review',
        description: 'Line-by-line inspection, grammar fixes, and admission structure suggestions within 48 hours.',
        durationMinutes: 30,
        maxDeliveryHours: 48,
        priceInINR: 899
      }).catch(() => {});

      await createMentorService(onboardHandle, {
        type: 'PRIORITY_DM',
        title: 'Priority DM / Direct Chat Mentorship',
        description: 'Direct 1-on-1 Q&A for urgent queries on visa, accommodation, and part-time jobs with reply in 24h.',
        durationMinutes: 15,
        maxDeliveryHours: 24,
        priceInINR: 199
      }).catch(() => {});

      setShowOnboarding(false);
      setFeedback({ type: 'success', text: `Welcome to UniCoach! Your profile @${onboardHandle} is live with starter services ready.` });
      await loadDashboard(onboardHandle);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to create mentor profile.' });
    } finally {
      setOnboardLoading(false);
    }
  };

  const loadDashboard = async (targetHandle) => {
    if (!targetHandle) return;
    setLoading(true);
    setFeedback(null);
    setAccessDeniedMessage(null);
    try {
      const res = await getMentorDashboard(targetHandle);
      setData(res);
      setHandle(res.mentor.handle);
      try {
        localStorage.setItem('unicoach_mentor_handle', res.mentor.handle);
      } catch (e) {}
      setShowOnboarding(false);
      setHasNoCreatorProfile(false);
      setAccessDeniedMessage(null);
      setProfileForm({
        name: res.mentor.name || '',
        email: res.mentor.email || '',
        headline: res.mentor.headline || '',
        bio: res.mentor.bio || '',
        avatarUrl: res.mentor.avatarUrl || '',
        coverImageUrl: res.mentor.coverImageUrl || '',
        country: res.mentor.country || '',
        university: res.mentor.university || '',
        course: res.mentor.course || '',
        ianaTimezone: res.mentor.ianaTimezone || 'Asia/Kolkata',
        bufferMinutes: res.mentor.bufferMinutes ?? 10,
        noticePeriodHours: res.mentor.noticePeriodHours ?? 2,
        socialLinks: pickSocialLinks(res.mentor.socialLinks)
      });
      setLoading(false);
      setResolvingMyProfile(false);
      // Fetch coupons, priority DMs, payouts and notifications in background
      loadCoupons(res.mentor.handle);
      loadPriorityDms(res.mentor.handle);
      loadPayouts(res.mentor.handle);
      loadNotifications(res.mentor.handle);
    } catch (err) {
      setLoading(false);
      setResolvingMyProfile(false);
      const msg = err.message || '';
      if (
        msg.toLowerCase().includes('access denied') || 
        msg.toLowerCase().includes('forbidden') || 
        msg.toLowerCase().includes('do not have permission')
      ) {
        setAccessDeniedMessage(msg);
      } else if (msg && (msg.includes('Mentor not found') || msg.includes('not found'))) {
        setOnboardHandle(targetHandle);
        setShowOnboarding(true);
        setFeedback(null);
      } else {
        setFeedback({ type: 'error', text: msg });
      }
    }
  };

  useEffect(() => {
    if (authLoading) return;

    // 1. Unauthenticated users cannot access creator dashboard
    if (!user) {
      setResolvingMyProfile(false);
      return;
    }

    // 2. Specific handle in route (/unicoach/dashboard/:handle)
    if (paramHandle) {
      const clean = paramHandle.replace(/^@/, '');
      setHandle(clean);
      loadDashboard(clean);
    } else {
      // 3. Root /unicoach/dashboard -> auto-resolve to logged-in user's mentor profile
      setResolvingMyProfile(true);
      getMyMentorProfile()
        .then((res) => {
          if (res.hasProfile && res.mentor?.handle) {
            setHandle(res.mentor.handle);
            navigate(`/unicoach/dashboard/${res.mentor.handle}`, { replace: true });
            loadDashboard(res.mentor.handle);
          } else {
            setHasNoCreatorProfile(true);
            setResolvingMyProfile(false);
          }
        })
        .catch((err) => {
          console.error('Failed to resolve mentor profile:', err);
          setResolvingMyProfile(false);
          if (err.message && (err.message.includes('401') || err.message.includes('log in'))) {
            // Handled by auth gate
          } else {
            setFeedback({ type: 'error', text: err.message });
          }
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramHandle, user, authLoading]);

  // Handler for creating a service
  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!newService.title.trim()) return;
    setActionLoading(true);
    try {
      await createMentorService(handle, newService);
      setIsServiceModalOpen(false);
      setUploadedAsset(null);
      setNewService({
        type: 'ONE_ON_ONE',
        title: '',
        description: '',
        durationMinutes: 30,
        priceInINR: 499,
        maxDeliveryHours: 48,
        digitalAsset: {
          fileUrl: '',
          fileName: '',
          fileType: 'PDF',
          fileSize: '',
          resourceLink: ''
        },
        customQuestions: []
      });
      setFeedback({ type: 'success', text: 'New offering published successfully!' });
      await loadDashboard(handle);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Helper for adding a custom question
  const handleAddQuestion = () => {
    setNewService((prev) => ({
      ...prev,
      customQuestions: [
        ...prev.customQuestions,
        { questionText: '', type: 'TEXT', required: false }
      ]
    }));
  };

  const handleRemoveQuestion = (idx) => {
    setNewService((prev) => ({
      ...prev,
      customQuestions: prev.customQuestions.filter((_, i) => i !== idx)
    }));
  };

  const handleQuestionChange = (idx, field, val) => {
    setNewService((prev) => {
      const updated = [...prev.customQuestions];
      updated[idx] = { ...updated[idx], [field]: val };
      return { ...prev, customQuestions: updated };
    });
  };

  // Handler for creating a coupon
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code.trim()) return;
    setActionLoading(true);
    try {
      await createMentorCoupon(handle, {
        code: newCoupon.code.trim().toUpperCase(),
        discountType: newCoupon.discountType,
        discountValue: Number(newCoupon.discountValue),
        maxUses: Number(newCoupon.maxUses) || 0,
        expiresAt: newCoupon.expiresAt ? new Date(newCoupon.expiresAt).toISOString() : null
      });
      setIsCouponModalOpen(false);
      setNewCoupon({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        maxUses: 50,
        expiresAt: ''
      });
      setFeedback({ type: 'success', text: 'Discount coupon created successfully!' });
      await loadCoupons(handle);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // Handler for deleting a coupon
  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Delete this coupon code?')) return;
    try {
      await deleteMentorCoupon(handle, couponId);
      setFeedback({ type: 'success', text: 'Coupon deleted.' });
      await loadCoupons(handle);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  // Copy code helper
  const handleCopyCode = (code) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  // Toggle booking question expansion
  const toggleBookingExpansion = (bookingId) => {
    setExpandedBookingIds((prev) => {
      const next = new Set(prev);
      if (next.has(bookingId)) {
        next.delete(bookingId);
      } else {
        next.add(bookingId);
      }
      return next;
    });
  };

  // Handler for deleting a service
  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to remove this service?')) return;
    try {
      await deleteMentorService(handle, serviceId);
      setFeedback({ type: 'success', text: 'Service removed.' });
      await loadDashboard(handle);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  // Handler for publishing slots (supports single day or multi-day bulk)
  const handlePublishSlots = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setActionLoading(true);
    try {
      const datesToPublish = selectedSlotDates && selectedSlotDates.length > 0
        ? selectedSlotDates
        : [slotPublishForm.dateStr || getDaysOffsetStr(1)];

      const res = await publishMentorSlots(handle, {
        dates: datesToPublish,
        dateStr: datesToPublish[0],
        startTime: slotPublishForm.startTime || '18:00',
        endTime: slotPublishForm.endTime || '21:00',
        durationMinutes: slotPublishForm.durationMinutes || 30,
        ianaTimezone: mentorTimezone
      });

      setFeedback({ 
        type: 'success', 
        text: `🎉 Success! ${res.slotsInserted || res.totalSlots || 'New'} booking slots published across ${datesToPublish.length} day(s) in ${mentorTimezone} with ${data?.mentor?.bufferMinutes || 10}m rest buffer.` 
      });
      await loadDashboard(handle);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to publish slots.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handler for 1-click deleting an unbooked slot
  const handleDeleteSlot = async (slotId) => {
    if (!slotId) return;
    try {
      await deleteMentorSlot(handle, slotId);
      setFeedback({ type: 'success', text: 'Slot removed from your public calendar.' });
      await loadDashboard(handle);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to delete slot.' });
    }
  };

  // Handler for pausing / resuming a slot (AVAILABLE <-> BLOCKED)
  const handleToggleSlotStatus = async (slotId) => {
    if (!slotId) return;
    try {
      const res = await toggleMentorSlotStatus(handle, slotId);
      setFeedback({ type: 'success', text: res.message || 'Slot status updated.' });
      await loadDashboard(handle);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update slot status.' });
    }
  };

  // Handler for clearing slots by date or all unbooked slots
  const handleDeleteSlotsByDate = async (dateStr, clearAll = false) => {
    const confirmMsg = clearAll
      ? '⚠️ Are you sure you want to delete ALL unbooked & paused slots across all upcoming dates? Booked student sessions will NOT be touched.'
      : `⚠️ Are you sure you want to delete all unbooked & paused slots for ${dateStr}?`;
    if (!window.confirm(confirmMsg)) return;

    setActionLoading(true);
    try {
      const res = await deleteMentorSlotsByDate(handle, { dateStr, clearAll });
      setFeedback({ type: 'success', text: res.message || 'Slots cleared successfully.' });
      await loadDashboard(handle);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to clear slots.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handler for adding a single discrete slot to calendar
  const handleCreateSingleSlot = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!quickAddModal.dateStr || !quickAddModal.timeStr) return;
    setActionLoading(true);
    try {
      const res = await createMentorSingleSlot(handle, {
        dateStr: quickAddModal.dateStr,
        timeStr: quickAddModal.timeStr,
        durationMinutes: Number(quickAddModal.durationMinutes) || 30,
        ianaTimezone: mentorTimezone,
        serviceId: quickAddModal.serviceId || 'ALL'
      });
      setFeedback({ type: 'success', text: res.message || 'New slot added to calendar!' });
      setQuickAddModal({ isOpen: false, dateStr: '', timeStr: '18:00', durationMinutes: 30, serviceId: 'ALL' });
      await loadDashboard(handle);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to create slot.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handler for copying an entire day's slots to another day
  const handleCopySlots = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!copyScheduleModal.sourceDateStr || !copyScheduleModal.targetDateStr) return;
    setActionLoading(true);
    try {
      const res = await copyMentorSlots(handle, {
        sourceDateStr: copyScheduleModal.sourceDateStr,
        targetDateStr: copyScheduleModal.targetDateStr
      });
      setFeedback({ type: 'success', text: res.message || 'Schedule copied successfully!' });
      setCopyScheduleModal({ isOpen: false, sourceDateStr: '', targetDateStr: '' });
      await loadDashboard(handle);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to copy slots.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Quick 1-click helper to open Tomorrow slots (for empty states)
  const handleQuickOpenTomorrowSlots = async () => {
    setActionLoading(true);
    try {
      const tomorrow = getDaysOffsetStr(1);
      const res = await publishMentorSlots(handle, {
        dates: [tomorrow],
        dateStr: tomorrow,
        startTime: '18:00',
        endTime: '21:00',
        durationMinutes: 30,
        ianaTimezone: mentorTimezone
      });
      setFeedback({
        type: 'success',
        text: `🎉 Published ${res.slotsInserted || res.totalSlots} slots for Tomorrow (6:00 PM – 9:00 PM ${mentorTimezone})! Students can now book immediately.`
      });
      await loadDashboard(handle);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to publish slots.' });
    } finally {
      setActionLoading(false);
    }
  };

  // UniCoach-Style: Publish Weekly Recurring Hours for next X days
  const handlePublishWeeklySchedule = async () => {
    setActionLoading(true);
    try {
      const activeDaysMap = {};
      Object.keys(weeklySchedule).forEach(dayNum => {
        if (weeklySchedule[dayNum].enabled) {
          activeDaysMap[dayNum] = weeklySchedule[dayNum];
        }
      });

      if (Object.keys(activeDaysMap).length === 0) {
        setFeedback({ type: 'error', text: 'Please enable at least one day in your weekly schedule.' });
        setActionLoading(false);
        return;
      }

      // Group future dates by the enabled day's specific start & end times
      const scheduleGroups = {};
      const now = new Date();
      let totalMatchingDays = 0;

      for (let i = 1; i <= weeklyPublishDays; i++) {
        const d = new Date(now.getTime() + i * 86400000);
        const dayOfWeek = d.getDay();
        const conf = activeDaysMap[dayOfWeek];
        if (conf) {
          const dateStr = d.toISOString().split('T')[0];
          const key = `${conf.startTime || '10:00'}_${conf.endTime || '18:00'}`;
          if (!scheduleGroups[key]) {
            scheduleGroups[key] = {
              startTime: conf.startTime || '10:00',
              endTime: conf.endTime || '18:00',
              dates: []
            };
          }
          scheduleGroups[key].dates.push(dateStr);
          totalMatchingDays++;
        }
      }

      if (totalMatchingDays === 0) {
        setFeedback({ type: 'error', text: 'No dates matched your enabled schedule window.' });
        setActionLoading(false);
        return;
      }

      let totalInserted = 0;
      for (const group of Object.values(scheduleGroups)) {
        const res = await publishMentorSlots(handle, {
          dates: group.dates,
          dateStr: group.dates[0],
          startTime: group.startTime,
          endTime: group.endTime,
          durationMinutes: Number(weeklySlotDuration) || 30,
          ianaTimezone: mentorTimezone
        });
        totalInserted += (res.slotsInserted || res.totalSlots || 0);
      }

      setFeedback({
        type: 'success',
        text: `🎉 Weekly schedule published! ${totalInserted || 'New'} slots generated across ${totalMatchingDays} day(s) based on your ${mentorTimezone} working hours.`
      });
      await loadDashboard(handle);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to publish weekly schedule.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handler for updating booking status (e.g. mark completed)
  const handleBookingStatus = async (bookingId, newStatus) => {
    if (newStatus === 'CANCELLED' && !window.confirm('Cancel this booking? If the student has paid, they will be refunded in full automatically.')) return;
    try {
      await updateBookingStatus(handle, bookingId, newStatus);
      setFeedback({
        type: 'success',
        text: newStatus === 'COMPLETED'
          ? 'Session marked as completed! Your payout has been released and will reach your bank in about 2 working days.'
          : newStatus === 'CANCELLED'
          ? 'Booking cancelled. The student will be refunded in full automatically.'
          : `Session marked as ${newStatus}.`
      });
      await loadDashboard(handle);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    }
  };

  // 1-Click Send Meeting Invite Email
  const handleSendInviteEmail = async (booking) => {
    if (!booking?._id) return;
    setSendingEmailId(booking._id);
    try {
      await sendBookingInviteEmail(handle, booking._id);
      setFeedback({ 
        type: 'success', 
        text: `✉️ Meeting invite email sent directly to ${booking.studentEmail || 'student'}!` 
      });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to dispatch invite email.' });
    } finally {
      setSendingEmailId(null);
    }
  };

  // Copy Meeting Link with visual checkmark
  const handleCopyMeetingLink = (booking) => {
    const url = booking?.meeting?.joinUrl;
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedBookingId(booking._id);
    setFeedback({ type: 'success', text: '📋 Meeting link copied to clipboard!' });
    setTimeout(() => {
      setCopiedBookingId(null);
    }, 2500);
  };

  // Open Edit Meeting Link Modal
  const handleOpenEditMeeting = (booking) => {
    setEditingMeetingBooking(booking);
    setCustomMeetingUrl(booking.meeting?.joinUrl || '');
  };

  // Save Custom Meeting Link
  const handleSaveCustomMeeting = async (e) => {
    if (e) e.preventDefault();
    if (!editingMeetingBooking || !customMeetingUrl.trim()) return;

    setSavingMeetingUrl(true);
    try {
      await updateBookingMeetingLink(handle, editingMeetingBooking._id, {
        joinUrl: customMeetingUrl.trim()
      });
      setFeedback({ 
        type: 'success', 
        text: '✅ Meeting link updated successfully! Click "Email Invite" to dispatch it to the student.' 
      });
      setEditingMeetingBooking(null);
      await loadDashboard(handle);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to update meeting link.' });
    } finally {
      setSavingMeetingUrl(false);
    }
  };

  // Handler for uploading avatar/logo photo
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', text: 'Please select a valid image file (PNG, JPG, WebP).' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFeedback({ type: 'error', text: 'Avatar file size must be under 10MB.' });
      return;
    }

    setUploadingAvatar(true);
    setFeedback(null);
    try {
      const res = await uploadMentorPhoto(handle, file, 'avatar');
      setProfileForm((prev) => ({ ...prev, avatarUrl: res.url }));
      setData((prev) => prev ? {
        ...prev,
        mentor: { ...prev.mentor, avatarUrl: res.url }
      } : prev);
      setFeedback({ type: 'success', text: 'Profile photo uploaded successfully!' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to upload profile photo.' });
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Handler for uploading cover/banner image
  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', text: 'Please select a valid image file (PNG, JPG, WebP).' });
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setFeedback({ type: 'error', text: 'Banner file size must be under 15MB.' });
      return;
    }

    setUploadingBanner(true);
    setFeedback(null);
    try {
      const res = await uploadMentorPhoto(handle, file, 'cover');
      setProfileForm((prev) => ({ ...prev, coverImageUrl: res.url }));
      setData((prev) => prev ? {
        ...prev,
        mentor: { ...prev.mentor, coverImageUrl: res.url }
      } : prev);
      setFeedback({ type: 'success', text: 'Storefront banner uploaded successfully!' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to upload banner image.' });
    } finally {
      setUploadingBanner(false);
    }
  };

  // Handler for removing uploaded photo
  const handleRemovePhoto = async (type = 'avatar') => {
    setActionLoading(true);
    try {
      const updated = {
        ...profileForm,
        handle,
        [type === 'avatar' ? 'avatarUrl' : 'coverImageUrl']: ''
      };
      await updateMentorProfile(updated);
      setProfileForm(updated);
      setData((prev) => prev ? {
        ...prev,
        mentor: { ...prev.mentor, [type === 'avatar' ? 'avatarUrl' : 'coverImageUrl']: '' }
      } : prev);
      setFeedback({ type: 'success', text: `${type === 'avatar' ? 'Profile photo' : 'Banner'} removed.` });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to remove image.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Handler for updating profile settings
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await updateMentorProfile({
        ...profileForm,
        handle
      });
      setFeedback({ type: 'success', text: 'Profile & branding saved!' });
      await loadDashboard(handle);
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setActionLoading(false);
    }
  };

  // 1. Verifying Session / Resolving Creator Profile
  if (authLoading || resolvingMyProfile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm max-w-sm w-full">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl shadow-2xs">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Verifying Creator Session</h3>
          <p className="text-xs text-slate-500">Checking your verified credentials and creator profile...</p>
        </div>
      </div>
    );
  }

  // 2. Authentication Required Gate (Visitor is not logged in)
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full shadow-sm text-center">
          <Link to="/" className="inline-block mb-3 select-none" title="UniCoach Home">
            <img
              src={brandLogo}
              alt="UniCoach Logo"
              className="h-8 w-auto mx-auto object-contain"
            />
          </Link>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <Lock className="w-7 h-7" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-amber-700 text-[11px] font-bold tracking-wide uppercase mb-3">
            Authentication Required
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            UniCoach Creator Studio
          </h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Creator Studio provides secure access to your private earnings, bank payouts, student bookings, and priority DMs. Please log in with your verified UniCoach account.
          </p>

          <button
            onClick={() => openLoginModal()}
            className="w-full py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mb-4 cursor-pointer"
          >
            <span>Log In / Sign Up to Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="pt-5 border-t border-slate-100 space-y-2">
            <p className="text-xs text-slate-500 font-medium">
              Want to mentor international students?
            </p>
            <Link
              to="/unicoach/apply"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Apply as a Mentor (0% Platform Fee)</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Access Restricted Gate (Logged-in user is not the owner of this mentor profile)
  if (accessDeniedMessage) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-rose-100 p-8 max-w-md w-full shadow-sm text-center">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold tracking-wide uppercase mb-3">
            Private Dashboard Protected
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Access Restricted
          </h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            {accessDeniedMessage}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                setAccessDeniedMessage(null);
                navigate('/unicoach/dashboard');
              }}
              className="w-full py-3 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Go to My Creator Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {handle && (
              <Link
                to={`/@${handle}`}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                <span>View @{handle}'s Public Storefront</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4. Logged-in user has no mentor profile yet
  if (hasNoCreatorProfile && !showOnboarding) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full shadow-sm text-center">
          <Link to="/" className="inline-block mb-3 select-none" title="UniCoach Home">
            <img
              src={brandLogo}
              alt="UniCoach Logo"
              className="h-8 w-auto mx-auto object-contain"
            />
          </Link>
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-4 shadow-2xs">
            <Sparkles className="w-7 h-7" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-[11px] font-bold tracking-wide uppercase mb-3">
            Ready to Mentor?
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Launch Your Storefront
          </h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Hi {user?.name || 'there'}! You haven't set up your UniCoach creator profile yet. Apply today to start hosting 1:1 strategy calls, SOP reviews, and priority DMs with 0% platform fee.
          </p>

          <div className="space-y-3">
            <Link
              to="/unicoach/apply"
              className="w-full py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Apply as a Mentor (0% Fee)</span>
            </Link>

            <button
              onClick={() => {
                setOnboardForm({
                  name: user?.name || '',
                  email: user?.email || '',
                  headline: '',
                  bio: ''
                });
                setOnboardHandle((user?.name || 'creator').toLowerCase().replace(/[^a-z0-9_]/g, '_'));
                setShowOnboarding(true);
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Instant Creator Setup</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Onboarding Form
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">
            🚀
          </div>
          <h2 className="text-xl font-bold text-slate-900 text-center mb-1">
            Create @{onboardHandle}
          </h2>
          <p className="text-xs text-slate-500 text-center mb-6">
            Fill your details to launch your creator profile with 0% platform fee.
          </p>

          <form onSubmit={handleOnboardSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Sagar Sharma"
                value={onboardForm.name}
                onChange={(e) => setOnboardForm(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                placeholder="sagar@example.com"
                value={onboardForm.email}
                onChange={(e) => setOnboardForm(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Headline</label>
              <input
                type="text"
                placeholder="e.g. Study Abroad Mentor | MS in CS @ Georgia Tech"
                value={onboardForm.headline}
                onChange={(e) => setOnboardForm(p => ({ ...p, headline: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Short Bio</label>
              <textarea
                rows={3}
                placeholder="Tell students about your mentoring experience..."
                value={onboardForm.bio}
                onChange={(e) => setOnboardForm(p => ({ ...p, bio: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={onboardLoading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {onboardLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating Profile...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> Launch My Creator Profile</>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowOnboarding(false);
                setOnboardHandle('');
                setFeedback(null);
              }}
              className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
            >
              ← Cancel and return
            </button>
          </form>

          {feedback && (
            <p className={`text-xs text-center mt-4 ${feedback.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>
              {feedback.text}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading your creator dashboard...</p>
        </div>
      </div>
    );
  }

  const { 
    mentor, 
    services = [], 
    upcomingBookings = [], 
    pastBookings = [], 
    scheduledCalls = [],
    pendingRequests = [],
    nextSession = null,
    stats = {},
    earnings = [],
    earningsSummary = {},
    payoutAccount = null
  } = data || {};

  // Safe clipboard copy helper with fallback
  const handleCopyText = async (text, successMsg = 'Copied to clipboard!') => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setFeedback({ type: 'success', text: successMsg });
    } catch (err) {
      console.error('Failed to copy:', err);
      setFeedback({ type: 'error', text: 'Failed to copy to clipboard' });
    }
  };

  // Real QR Code direct PNG download
  const handleSaveQrCode = () => {
    if (!qrCodeDataUrl) {
      setFeedback({ type: 'error', text: 'QR code is still generating, please wait a moment.' });
      return;
    }
    const link = document.createElement('a');
    link.href = qrCodeDataUrl;
    link.download = `${mentor?.handle || handle || 'mentor'}_storefront_qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setFeedback({ type: 'success', text: 'Storefront QR Code downloaded to your device!' });
  };

  // Real 1080x1920 Instagram Story Graphic Generator & Downloader
  const handleDownloadStoryGraphic = async () => {
    setIsGeneratingStory(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not initialize canvas context');

      const mentorName = profileForm.name || mentor?.name || 'Study Abroad Mentor';
      const mentorHeadline = profileForm.headline || mentor?.headline || 'Study Abroad & SOP Mentor';
      const mentorHandle = mentor?.handle || handle || 'mentor';

      const roundRect = (c, x, y, width, height, radius) => {
        c.beginPath();
        c.moveTo(x + radius, y);
        c.lineTo(x + width - radius, y);
        c.quadraticCurveTo(x + width, y, x + width, y + radius);
        c.lineTo(x + width, y + height - radius);
        c.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        c.lineTo(x + radius, y + height);
        c.quadraticCurveTo(x, y + height, x, y + height - radius);
        c.lineTo(x, y + radius);
        c.quadraticCurveTo(x, y, x + radius, y);
        c.closePath();
      };

      // 1. Rich dark gradient background
      const bgGradient = ctx.createLinearGradient(0, 0, 1080, 1920);
      bgGradient.addColorStop(0, '#0F172A'); // Slate-900
      bgGradient.addColorStop(0.35, '#1E1B4B'); // Indigo-950
      bgGradient.addColorStop(0.7, '#180B2B'); // Deep purple
      bgGradient.addColorStop(1, '#DE5C2B'); // Brand orange
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Ambient radial glow
      const radialGlow = ctx.createRadialGradient(540, 520, 60, 540, 520, 640);
      radialGlow.addColorStop(0, 'rgba(222, 92, 43, 0.4)');
      radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, 1080, 1920);

      // 3. Top pill
      roundRect(ctx, 280, 130, 520, 64, 32);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✦ UNICOACH VERIFIED MENTOR ✦', 540, 162);

      // 4. Mentor Avatar
      const avatarSrc = profileForm?.avatarUrl || mentor?.avatarUrl;
      let imgLoaded = false;
      if (avatarSrc) {
        try {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          await new Promise((resolve) => {
            img.onload = () => { imgLoaded = true; resolve(); };
            img.onerror = () => resolve();
            setTimeout(resolve, 1500);
            img.src = avatarSrc;
          });
          if (imgLoaded) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(540, 390, 120, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(img, 420, 270, 240, 240);
            ctx.restore();
          }
        } catch (e) {
          imgLoaded = false;
        }
      }

      if (!imgLoaded) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(540, 390, 120, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.fillStyle = '#DE5C2B';
        ctx.font = '900 100px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initial = (mentorName || 'S').charAt(0).toUpperCase();
        ctx.fillText(initial, 540, 396);
        ctx.restore();
      }

      // Outer ring around avatar
      ctx.beginPath();
      ctx.arc(540, 390, 124, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Golden verified badge
      ctx.beginPath();
      ctx.arc(625, 475, 28, 0, Math.PI * 2);
      ctx.fillStyle = '#F59E0B';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Checkmark icon
      ctx.strokeStyle = '#0F172A';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(614, 475);
      ctx.lineTo(622, 483);
      ctx.lineTo(636, 467);
      ctx.stroke();

      // 5. Mentor Name
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 56px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(mentorName, 540, 580);

      // 6. Headline
      ctx.fillStyle = '#FDE68A';
      ctx.font = '500 32px system-ui, -apple-system, sans-serif';
      const truncatedHeadline = mentorHeadline.length > 55 ? mentorHeadline.slice(0, 52) + '...' : mentorHeadline;
      ctx.fillText(truncatedHeadline, 540, 642);

      // 7. 0% Fee Pill
      roundRect(ctx, 230, 710, 620, 64, 32);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px system-ui, sans-serif';
      ctx.fillText('BOOK 1:1 CALL · 0% PLATFORM FEE', 540, 742);

      // 8. Value Props Card
      roundRect(ctx, 130, 815, 820, 270, 28);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.6)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();

      const bullets = [
        '✓  1:1 Strategy Call & Profile Evaluation',
        '✓  SOP, Resume & Visa Filing Review',
        '✓  Real University & Campus Insights'
      ];
      ctx.textAlign = 'left';
      ctx.fillStyle = '#E2E8F0';
      ctx.font = '600 28px system-ui, sans-serif';
      bullets.forEach((bullet, idx) => {
        ctx.fillText(bullet, 180, 875 + idx * 75);
      });

      // 9. QR Code Card
      roundRect(ctx, 270, 1145, 540, 570, 36);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 6;
      ctx.stroke();

      if (qrCodeDataUrl) {
        const qrImg = new Image();
        await new Promise((res) => {
          qrImg.onload = res;
          qrImg.onerror = res;
          qrImg.src = qrCodeDataUrl;
        });
        ctx.drawImage(qrImg, 320, 1185, 440, 440);
      }

      ctx.textAlign = 'center';
      ctx.fillStyle = '#0F172A';
      ctx.font = '900 26px system-ui, sans-serif';
      ctx.fillText('SCAN TO BOOK A SESSION', 540, 1665);

      // 10. Footer URL & Brand
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '600 30px monospace';
      ctx.fillText(`${window.location.host}/@${mentorHandle}`, 540, 1775);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = '500 22px system-ui, sans-serif';
      ctx.fillText('unicoach.com · 0% Fee Creator Mentorship', 540, 1825);

      // Download triggered
      canvas.toBlob((blob) => {
        if (!blob) {
          setFeedback({ type: 'error', text: 'Failed to generate story graphic.' });
          setIsGeneratingStory(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${mentorHandle}_story_poster.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsGeneratingStory(false);
        setFeedback({ type: 'success', text: 'Instagram Story graphic downloaded successfully!' });
      }, 'image/png');
    } catch (err) {
      console.error('Failed to generate story graphic:', err);
      setIsGeneratingStory(false);
      setFeedback({ type: 'error', text: 'Could not generate story graphic: ' + (err.message || 'unknown error') });
    }
  };

  // ── Dynamic Profile Health & Optimization Checklist (Enhance Profile) ──
  const profileChecklist = [
    {
      id: 'photo',
      title: 'Profile Photo Uploaded',
      desc: 'Mentors with authentic photos receive 4x more bookings',
      isDone: Boolean((mentor?.photoUrl && !mentor.photoUrl.includes('placeholder')) || (mentor?.avatarUrl && !mentor.avatarUrl.includes('placeholder')) || (profileForm?.avatarUrl && !profileForm.avatarUrl.includes('placeholder'))),
      category: 'Trust & Branding',
      actionLabel: 'Upload Photo',
      onAction: () => {
        setIsEnhanceModalOpen(false);
        setActiveTab('profile');
      }
    },
    {
      id: 'bio',
      title: 'Bio & University Background Added',
      desc: 'Showcase your global degree, test scores, or study abroad journey',
      isDone: Boolean((mentor?.bio && mentor.bio.trim().length > 15) || (profileForm?.bio && profileForm.bio.trim().length > 15)),
      category: 'Credibility',
      actionLabel: 'Edit Bio',
      onAction: () => {
        setIsEnhanceModalOpen(false);
        setActiveTab('settings');
      }
    },
    {
      id: 'services',
      title: 'At least 2 Active Offerings Configured',
      desc: 'Offer 1:1 Strategy Calls and SOP / Document Reviews',
      isDone: Boolean(services && services.filter(s => s.active !== false).length >= 2),
      category: 'Monetization',
      actionLabel: 'Add Service',
      onAction: () => {
        setIsEnhanceModalOpen(false);
        setIsServiceModalOpen(true);
      }
    },
    {
      id: 'calendar',
      title: 'Booking Calendar Slots Published',
      desc: 'Open time slots so mentees can instantly schedule video sessions',
      isDone: Boolean((stats?.activeSlotsCount || 0) > 0),
      category: 'Availability',
      actionLabel: 'Publish Slots',
      onAction: () => {
        setIsEnhanceModalOpen(false);
        setActiveTab('calendar');
      }
    },
    {
      id: 'social',
      title: 'LinkedIn or Social Links Connected',
      desc: 'Verify alumni credentials and allow students to cross-check experience',
      isDone: Boolean(mentor?.socialLinks?.linkedin || mentor?.socialLinks?.instagram || mentor?.socialLinks?.twitter || mentor?.linkedinUrl),
      category: 'Verification',
      actionLabel: 'Connect Links',
      onAction: () => {
        setIsEnhanceModalOpen(false);
        setActiveTab('settings');
      }
    }
  ];

  const pendingChecklist = profileChecklist.filter(item => !item.isDone);
  const pendingCount = pendingChecklist.length;
  const profileCompletionPct = Math.round(
    ((profileChecklist.length - pendingCount) / profileChecklist.length) * 100
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex pt-0">
      {/* ═══ UniCoach-STYLE LEFT SIDEBAR (Desktop) ═══ */}
      <aside className="w-64 bg-white border-r border-slate-200/90 hidden md:flex flex-col justify-between flex-shrink-0 sticky top-0 h-screen overflow-y-auto z-30">
        <div className="p-4 space-y-4">
          {/* UniCoach Brand Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <Link to="/" className="flex items-center select-none" title="Back to UniCoach Home">
              <img
                src={brandLogo}
                alt="UniCoach Logo"
                className="h-8 w-auto object-contain"
                width="130"
                height="32"
              />
            </Link>
            <Link
              to="/"
              className="text-[11px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
              title="Exit to main platform"
            >
              <span>Exit</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          {/* Creator Profile Branding */}
          <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              {mentor?.avatarUrl || profileForm.avatarUrl ? (
                <img
                  src={mentor?.avatarUrl || profileForm.avatarUrl}
                  alt={mentor?.name || 'Creator'}
                  className="w-8 h-8 rounded-full object-cover shadow-2xs flex-shrink-0 ring-1 ring-slate-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#E5484D] text-white font-black flex items-center justify-center text-xs shadow-2xs flex-shrink-0">
                  {mentor?.name ? mentor.name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-slate-900 truncate">Creator Dashboard</h2>
                <p className="text-[11px] text-slate-500 font-mono truncate">{mentor?.handle || handle || 'sagar_punia'}</p>
              </div>
            </div>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700 cursor-pointer flex-shrink-0" />
          </div>

          {/* Sharing posters for you pill */}
          <div className="px-3 py-2 rounded-xl bg-[#F4F6F4] border border-slate-200/60 flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="truncate">Sharing posters for you</span>
          </div>

          {/* + Create Primary Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
              className="w-full py-2.5 px-4 rounded-xl bg-[#111111] hover:bg-black text-white font-bold text-xs flex items-center justify-between shadow-xs transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-white" />
                <span>Create</span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isCreateMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isCreateMenuOpen && (
              <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 z-40 space-y-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setNewService(prev => ({ ...prev, type: 'ONE_ON_ONE', title: '1:1 Video Consultation', priceInINR: 499 }));
                    setIsServiceModalOpen(true);
                    setIsCreateMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5 text-[#DE5C2B]" />
                  <span>1:1 Video Consultation</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewService(prev => ({ ...prev, type: 'SOP_REVIEW', title: 'SOP & Resume Review', priceInINR: 899 }));
                    setIsServiceModalOpen(true);
                    setIsCreateMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>SOP / Resume Review</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewService(prev => ({ ...prev, type: 'PRIORITY_DM', title: 'Priority DM / Q&A', priceInINR: 199 }));
                    setIsServiceModalOpen(true);
                    setIsCreateMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                  <span>Priority DM Chat</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('calendar');
                    setIsCreateMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-600" />
                  <span>Publish Calendar Slots</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCouponModalOpen(true);
                    setIsCreateMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 text-slate-700 flex items-center gap-2 cursor-pointer"
                >
                  <Tag className="w-3.5 h-3.5 text-rose-500" />
                  <span>Create Promo Coupon</span>
                </button>
              </div>
            )}
          </div>

          {/* Navigation items matching UniCoach screenshot */}
          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Home', icon: Home, hasChevron: false },
              { id: 'notifications', label: 'Announcements & Alerts', icon: Bell, hasChevron: true, badge: unreadNotificationsCount || null, badgeColor: 'bg-[#DE5C2B] text-white' },
              { id: 'bookings', label: 'Bookings & Sessions', icon: Calendar, hasChevron: true, badge: (scheduledCalls.length || upcomingBookings.length) || null },
              { id: 'priority_dms', label: 'Priority DMs & Requests', icon: MessageSquare, hasChevron: true, badge: (priorityDms?.pendingCount || pendingRequests.length) || null },
              { id: 'services', label: 'Services', icon: Grid, hasChevron: false, badge: services.length || null },
              { id: 'calendar', label: 'Calendar & Slots', icon: CalendarDays, hasChevron: false },
              { id: 'profile', label: 'Profile', icon: Users, hasChevron: true },
              { id: 'payouts', label: 'Earnings', icon: Wallet, hasChevron: false },
              { id: 'share_grow', label: 'Share & Grow', icon: Share2, hasChevron: true },
              { id: 'analytics', label: 'Analytics', icon: BarChart3, hasChevron: false },
              { id: 'settings', label: 'Settings', icon: Settings, hasChevron: false },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    if (item.id === 'notifications') loadNotifications(handle);
                    if (item.id === 'payouts') loadPayouts(handle);
                    if (item.id === 'priority_dms') loadPriorityDms(handle);
                    if (item.id === 'coupons') loadCoupons(handle);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#F6EFE6] text-slate-900 font-extrabold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className="canva-icon">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#DE5C2B]' : 'text-slate-500'}`} />
                    </span>
                    <span>{item.label}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    {item.badge ? (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.badgeColor || 'bg-slate-100 text-slate-700'}`}>
                        {item.badge}
                      </span>
                    ) : null}
                    {item.hasChevron && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with User Info */}
        <div className="p-3 border-t border-slate-100">
          {/* User profile footer matching screenshot */}
          <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              {mentor?.avatarUrl || profileForm.avatarUrl ? (
                <img
                  src={mentor?.avatarUrl || profileForm.avatarUrl}
                  alt={mentor?.name || 'Creator'}
                  className="w-8 h-8 rounded-full object-cover shadow-2xs flex-shrink-0 ring-1 ring-slate-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#F6D2C4] text-slate-800 font-bold flex items-center justify-center text-xs flex-shrink-0">
                  {mentor?.name ? mentor.name.charAt(0).toUpperCase() : 'S'}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{mentor?.name || 'Sagar Punia'}</p>
                <p className="text-[10px] text-slate-400 truncate">{mentor?.email || 'sagarpunia163@gmail.com'}</p>
              </div>
            </div>
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700 cursor-pointer flex-shrink-0" />
          </div>
        </div>
      </aside>

      {/* ═══ MOBILE DRAWER SIDEBAR ═══ */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-64 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col justify-between p-4 z-10 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#E5484D] text-white font-bold flex items-center justify-center text-xs">
                    {mentor?.name ? mentor.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Creator Studio</h3>
                    <p className="text-[10px] text-slate-500">@{mentor?.handle || handle}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setMobileSidebarOpen(false)} className="p-1 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {[
                  { id: 'overview', label: 'Home', icon: Home },
                  { id: 'notifications', label: 'Announcements & Alerts', icon: Bell },
                  { id: 'bookings', label: 'Bookings & Sessions', icon: Calendar },
                  { id: 'priority_dms', label: 'Priority DMs & Requests', icon: MessageSquare },
                  { id: 'services', label: 'Services', icon: Grid },
                  { id: 'calendar', label: 'Calendar & Slots', icon: CalendarDays },
                  { id: 'profile', label: 'Profile', icon: Users },
                  { id: 'payouts', label: 'Earnings', icon: Wallet },
                  { id: 'share_grow', label: 'Share & Grow', icon: Share2 },
                  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        if (item.id === 'notifications') loadNotifications(handle);
                        if (item.id === 'payouts') loadPayouts(handle);
                        if (item.id === 'priority_dms') loadPriorityDms(handle);
                        if (item.id === 'coupons') loadCoupons(handle);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive ? 'bg-[#F6EFE6] text-slate-900 font-extrabold' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-900 truncate">{mentor?.name || 'Sagar Punia'}</p>
              <p className="text-[10px] text-slate-400 truncate">{mentor?.email || 'sagarpunia163@gmail.com'}</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MAIN CONTENT AREA ═══ */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-[#F8FAFC]">
        {/* Sticky Top Header Bar - Dedicated Studio Header */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 hover:bg-slate-100 hover:text-slate-900 cursor-pointer flex-shrink-0 transition-colors"
              aria-label="Open Creator Studio Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Brand Link using main logo */}
            <Link to="/" className="md:hidden flex items-center flex-shrink-0 select-none" title="UniCoach Home">
              <img
                src={brandLogo}
                alt="UniCoach Logo"
                className="h-7 w-auto object-contain"
                width="110"
                height="28"
              />
            </Link>

            <div className="hidden xs:block md:hidden h-4 w-px bg-slate-200 flex-shrink-0" />

            <h1 className="text-sm xs:text-base sm:text-2xl font-bold text-slate-900 tracking-tight whitespace-nowrap truncate">
              Hi, {mentor?.name?.split(' ')[0] || mentor?.name || 'Sagar'}
            </h1>
          </div>

          {/* UniCoach Top Right Link Pill + Separate Square Copy Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Notification Bell Button */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('notifications');
                loadNotifications(handle);
              }}
              className={`relative h-8 px-2 sm:px-2.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold ${
                activeTab === 'notifications'
                  ? 'bg-[#FFF7ED] border-[#FDBA74] text-[#DE5C2B]'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
              title="Announcements & Alerts from Admin"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 ? (
                <span className="min-w-[18px] h-[18px] px-1 bg-[#DE5C2B] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs animate-pulse">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              ) : null}
            </button>
            <a
              href={`${window.location.origin}/@${mentor?.handle || handle}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 bg-[#F6F6F6] hover:bg-slate-200/70 border border-slate-200/80 rounded-full pl-1 sm:pl-1.5 pr-2.5 sm:pr-3.5 py-1 transition-all text-xs font-medium text-slate-800 group cursor-pointer max-w-[125px] xs:max-w-[170px] sm:max-w-none"
              title={`Visit public profile: ${window.location.origin}/@${mentor?.handle || handle}`}
            >
              <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#E5D2BA] text-slate-800 font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                {mentor?.name ? mentor.name.charAt(0).toUpperCase() : 'S'}
              </span>
              <span className="font-mono text-[11px] sm:text-xs text-slate-800 truncate">
                <span className="hidden sm:inline">{window.location.host}</span>/@{mentor?.handle || handle}/
              </span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-700 flex-shrink-0 hidden xs:inline" />
            </a>

            <button
              type="button"
              onClick={() => {
                handleCopyText(`${window.location.origin}/@${mentor?.handle || handle}`, `Profile link copied! Share it with students: ${window.location.origin}/@${mentor?.handle || handle}`);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2500);
              }}
              className="hidden xs:flex w-8 h-8 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 items-center justify-center shadow-2xs transition-colors cursor-pointer flex-shrink-0"
              title="Copy Profile Link"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </header>

        {/* Dashboard Main Scrollable Body */}
        <div className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-8 py-5 sm:py-6 pb-28 sm:pb-16 space-y-6">
          {/* Feedback Alert */}
          {feedback && (
            <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
              feedback.type === 'error'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              <div className="flex items-center gap-2">
                {feedback.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{feedback.text}</span>
              </div>
              <button type="button" onClick={() => setFeedback(null)} className="cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Application Status Alert Banner (Pending Admin Approval) */}
          {mentor?.applicationStatus !== 'APPROVED' && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 text-amber-800 flex items-center justify-center flex-shrink-0 font-bold text-lg shadow-inner">
                  🛡️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-amber-950">Mentor Profile Under Admin Verification</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200/80 text-amber-900 border border-amber-300">
                      Status: {mentor?.applicationStatus || 'PENDING'}
                    </span>
                  </div>
                  <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                    Your university verification proof, social profiles (LinkedIn), and bank details are currently being reviewed by the UniCoach Admin team. 
                    Your public booking link is locked in <strong>Preview Mode</strong> and will become bookable by students once approved by Admin.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
                <a
                  href={`/@${mentor?.handle || handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs w-full sm:w-auto"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Page</span>
                </a>
              </div>
            </div>
          )}

          {/* Missing Bank Details Warning Banner */}
          {!mentor?.defaultPayoutDetails?.accountNumber && (
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 text-rose-700 flex items-center justify-center flex-shrink-0 font-bold text-lg">
                  🏦
                </div>
                <div>
                  <h4 className="font-bold text-sm text-rose-950">Bank Account Required</h4>
                  <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">
                    You have not added your payout bank account. Earnings from student bookings are paid out automatically to your bank account, and new service listings will remain blocked until it is added.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={openBankDetailsModal}
                className="px-4 py-2 rounded-xl bg-[#DE5C2B] hover:bg-[#c94f24] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex-shrink-0 flex items-center justify-center gap-1.5 w-full sm:w-auto"
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Configure Bank Account</span>
              </button>
            </div>
          )}

          {/* ════════ TAB 1: OVERVIEW / HOME (Matching UniCoach Screenshot) ════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Urgent Broadcast Notice Banner (if any unread urgent broadcast exists) */}
              {(() => {
                const urgentNotice = notifications.find(n => !n.isRead && (n.priority === 'URGENT' || n.category === 'URGENT'));
                if (!urgentNotice) return null;
                return (
                  <div className="bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                        🚨
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-white/20">
                            Urgent Admin Notice
                          </span>
                          <span className="text-xs text-white/80">
                            {new Date(urgentNotice.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold mt-0.5">{urgentNotice.title}</h4>
                        <p className="text-xs text-white/90 line-clamp-1 mt-0.5">{urgentNotice.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          handleMarkNotificationRead(urgentNotice._id);
                          setActiveTab('notifications');
                        }}
                        className="px-4 py-2 rounded-xl bg-white text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all shadow-xs cursor-pointer"
                      >
                        Read Announcement →
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* UniCoach Hero Greeting Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
            {/* Top row: Good morning, Sagar | Tuesday, 22 September */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}, {mentor?.name?.split(' ')[0] || mentor?.name || 'Sagar'}
              </h2>
              <span className="text-xs text-slate-500">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>

            {/* 2-column card body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Box: YOUR PAGE */}
              <div className="bg-[#FAF9F6] rounded-xl p-4 sm:p-5 border border-slate-100 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                    YOUR PAGE
                  </span>
                  <p className="text-xs text-slate-600 mb-2 font-normal">
                    Your link is
                  </p>

                  <div className="flex items-center justify-between gap-2 bg-transparent mb-2">
                    <span className="text-sm font-bold text-slate-900 font-mono truncate">
                      {window.location.host}/@{mentor?.handle || handle}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/@${mentor?.handle || handle}`);
                        setFeedback({ type: 'success', text: 'Booking link copied to clipboard!' });
                      }}
                      className="px-3 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs flex-shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5 text-slate-600" />
                      <span>Copy</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-slate-400">
                      Share it to get your first booking.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Edit Logo & Banner →</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Box: SENT TO YOUR BANK (automatic Razorpay Route payouts) */}
              <div className="p-2 sm:p-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                    SENT TO YOUR BANK
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-slate-900 my-1">
                    ₹{(stats?.creatorWalletAvailableINR || 0).toLocaleString('en-IN')}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    ₹{(stats?.inEscrowHeldINR || 0).toLocaleString('en-IN')} on hold until sessions complete
                  </p>
                </div>

                <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs font-medium text-slate-700">
                  <div
                    onClick={() => {
                      setActiveTab('priority_dms');
                      loadPriorityDms(handle);
                    }}
                    className="flex items-center justify-between hover:text-[#DE5C2B] cursor-pointer transition-colors"
                  >
                    <span>Priority DMs</span>
                    <span className="text-slate-400 hover:text-slate-600 flex items-center gap-1">
                      {priorityDms?.pendingCount || 0} pending &gt;
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span>Platform Fee</span>
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      0% (Free Forever)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Action Buttons across the bottom of the card matching Screenshot */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(true)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 text-slate-600" />
                <span>Add service</span>
              </button>

              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5 text-slate-600" />
                <span>Share profile</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('payouts');
                  loadPayouts(handle);
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Wallet className="w-3.5 h-3.5 text-slate-600" />
                <span>View earnings</span>
              </button>
            </div>
          </div>

          {/* Checklist Banner matching Screenshot ("Not listed yet: 3 things to add") */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  {pendingCount > 0
                    ? `Profile Optimization: ${pendingCount} pending step${pendingCount > 1 ? 's' : ''} to complete`
                    : 'All-Star Profile: 100% Completed'}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Profile Strength: {profileCompletionPct}% • Boost discoverability, student trust & bookings
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsEnhanceModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold shadow-2xs transition-colors cursor-pointer flex-shrink-0"
            >
              See details
            </button>
          </div>

          {/* ════════ UniCoach-STYLE VIBRANT ORANGE REFERRAL BANNER (Screenshot) ════════ */}
          <div className="bg-gradient-to-r from-[#FF4E00] via-[#F4511E] to-[#FF3B00] rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
            {/* Background geometric accents */}
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 skew-x-12 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-[#CCFF00] text-slate-950 font-black text-[11px] tracking-wider uppercase inline-block">
                    NEW
                  </span>
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                  Earn 50% for every creator you refer
                </h3>

                <div className="flex flex-wrap items-center gap-3 mt-5">
                  <button
                    type="button"
                    onClick={() => setIsReferralModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs transition-all shadow-sm cursor-pointer"
                  >
                    Refer Now!
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsReferralModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-all border border-white/20 cursor-pointer"
                  >
                    Referral Perks
                  </button>
                </div>
              </div>

              {/* Graphic badges on right side matching screenshot */}
              <div className="flex flex-col gap-2.5 self-start md:self-center">
                <div className="bg-white rounded-xl p-3 shadow-lg flex items-center gap-3 text-slate-900 max-w-xs">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    ↑
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">₹2,000 credited</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Referral payout</div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-md rounded-xl px-3 py-2 border border-white/20 flex items-center gap-2 text-white text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>500+ Active Mentors</span>
                </div>
              </div>
            </div>
          </div>

        {/* Studio Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pb-3 mb-6 border-b border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'overview'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Overview & Stats
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'services'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Video className="w-4 h-4" />
            My Services ({services.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'calendar'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Publish Slots & Buffer
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'bookings'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Users className="w-4 h-4" />
            Bookings & Calls ({upcomingBookings.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('priority_dms');
              loadPriorityDms(handle);
            }}
            className={`px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'priority_dms'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Priority DMs</span>
            {priorityDms.pendingCount > 0 ? (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {priorityDms.pendingCount}
              </span>
            ) : (
              <span className="text-[11px] opacity-75">({priorityDms.total})</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('coupons');
              loadCoupons(handle);
            }}
            className={`px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'coupons'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Tag className="w-4 h-4" />
            Promo Codes & Discounts ({coupons.length})
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('payouts');
              loadPayouts(handle);
            }}
            className={`px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'payouts'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Wallet className="w-4 h-4" />
            Earnings & Payouts
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 flex-shrink-0 ${
              activeTab === 'settings'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            Profile & Notice Rules
          </button>
        </div>

            {/* Quick Metrics & Upcoming Calls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-xs font-semibold text-slate-500">Upcoming Calls</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{stats?.upcomingCount || 0}</p>
                <span className="text-[11px] text-indigo-600 font-medium mt-2 block">
                  Next session ready
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-xs font-semibold text-slate-500">Completed Sessions</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{stats?.completedCount || 0}</p>
                <span className="text-[11px] text-emerald-600 font-medium mt-2 block">
                  Payouts released to bank
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-xs font-semibold text-slate-500">Open Available Slots</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{stats?.activeSlotsCount || 0}</p>
                <span className="text-[11px] text-slate-500 font-medium mt-2 block">
                  Live on your calendar
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                <span className="text-xs font-semibold text-slate-500">Active Offerings</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{services.filter(s => s.active).length}</p>
                <span className="text-[11px] text-slate-500 font-medium mt-2 block">
                  Public on your page
                </span>
              </div>
            </div>

            {/* Upcoming Next 1:1 Video Call Alert Banner */}
            {(() => {
              const nextCall = nextSession || scheduledCalls?.[0] || upcomingBookings.find(b => b.startUtc && !isNaN(new Date(b.startUtc).getTime()));
              if (nextCall) {
                return (
                  <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-indigo-500/30 text-indigo-200 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                        Next Up 1:1 Video Call
                      </span>
                      <h3 className="text-lg font-bold mt-2">
                        {nextCall.serviceId?.title || '1:1 Mentorship'} with {nextCall.studentName}
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        {new Date(nextCall.startUtc).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>

                    {nextCall.meeting?.joinUrl && (
                      <a
                        href={nextCall.meeting.joinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="py-3 px-5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs shadow transition-all flex items-center gap-2 flex-shrink-0"
                      >
                        <Video className="w-4 h-4 text-indigo-600" />
                        Start Google Meet Call
                      </a>
                    )}
                  </div>
                );
              }
              return (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center">
                  <p className="text-sm font-semibold text-slate-800">No upcoming 1:1 calls right now</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Publish slots in the Calendar tab and share your link (/@{mentor?.handle || handle}) to start receiving bookings.
                  </p>
                </div>
              );
            })()}

            {/* ── Prominent Action Alert: Incoming Student Requests & Priority DMs ── */}
            {((priorityDms?.pending && priorityDms.pending.length > 0) || (pendingRequests && pendingRequests.length > 0)) && (
              <div className="bg-gradient-to-br from-amber-50 via-orange-50/50 to-indigo-50/40 border-2 border-amber-300/90 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                        Action Required
                      </span>
                      <span className="text-xs font-bold text-amber-900">
                        {(priorityDms?.pendingCount || pendingRequests.length)} Incoming Student Request{(priorityDms?.pendingCount || pendingRequests.length) > 1 ? 's' : ''}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5">
                      You have student inquiries & reviews waiting for your reply
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('priority_dms');
                      loadPriorityDms(handle);
                    }}
                    className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm flex items-center gap-2 transition-all flex-shrink-0 cursor-pointer self-start sm:self-auto"
                  >
                    <MessageSquare className="w-4 h-4 text-amber-400" />
                    <span>Open Requests Inbox ({priorityDms?.pendingCount || pendingRequests.length})</span>
                  </button>
                </div>

                {/* Quick Cards of Pending Student Requests */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                  {(pendingRequests.slice(0, 4)).map((req) => {
                    const isDm = req.serviceId?.type === 'PRIORITY_DM' || Boolean(req.priorityDm?.questionText);
                    const isSop = req.serviceId?.type === 'SOP_REVIEW';
                    return (
                      <div key={req._id} className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                              {isDm ? 'Priority DM' : isSop ? 'SOP Review' : 'Student Request'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">{req.bookingRef}</span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900">{req.studentName}</h4>
                          <p className="text-xs text-slate-500">{req.studentEmail}</p>
                          <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 line-clamp-3">
                            {req.priorityDm?.questionText ? (
                              <>
                                <strong className="text-amber-900 block text-[11px] mb-0.5">Question:</strong>
                                "{req.priorityDm.questionText}"
                              </>
                            ) : req.studentNotes ? (
                              <>
                                <strong className="text-slate-900 block text-[11px] mb-0.5">Student Notes:</strong>
                                "{req.studentNotes}"
                              </>
                            ) : (
                              'Student requested direct consultation & feedback.'
                            )}
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-600">₹{req.amountPaid} held in escrow</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (isDm) {
                                setActiveTab('priority_dms');
                                loadPriorityDms(handle);
                              } else {
                                setActiveTab('bookings');
                              }
                            }}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                          >
                            <span>{isDm ? 'Reply Now' : 'Review Details'}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Live Services Preview on Overview Tab */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#DE5C2B]" />
                    <span>Your Active Services on Public Page</span>
                  </h3>
                  <p className="text-xs text-slate-500">Live offerings and custom prices students see on your profile (/@{mentor?.handle || handle})</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer w-fit"
                >
                  <Plus className="w-3.5 h-3.5 text-[#DE5C2B]" />
                  <span>+ Add Offering</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {services.map((svc) => (
                  <div key={svc._id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between hover:border-orange-200 transition-colors">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase text-[#DE5C2B] tracking-wider">
                          {svc.type === 'ONE_ON_ONE' ? '1:1 Video Call' : svc.type === 'SOP_REVIEW' ? 'Async Review' : 'Priority DM'}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenEditService(svc)}
                          className="p-1 rounded-md hover:bg-orange-50 text-slate-400 hover:text-[#DE5C2B] transition-colors cursor-pointer"
                          title="Edit Service & Price"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{svc.title}</h4>
                      {svc.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{svc.description}</p>
                      )}
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900">
                        ₹{svc.priceInINR.toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenEditService(svc)}
                        className="text-xs font-bold text-[#DE5C2B] hover:underline cursor-pointer"
                      >
                        Edit Price
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: MY SERVICES ── */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Your Offerings Catalog</h2>
                <p className="text-xs text-slate-500">Configure what students can book with you and set your custom pricing.</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setActiveTab('calendar')}
                  className="py-2.5 px-3.5 sm:px-4 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#DE5C2B] border border-orange-200/90 font-bold text-xs shadow-2xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CalendarDays className="w-4 h-4 text-[#DE5C2B]" />
                  <span>Manage Calendar & Slots</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(true)}
                  className="py-2.5 px-4 rounded-xl bg-[#DE5C2B] hover:bg-[#c0491d] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Service</span>
                </button>
              </div>
            </div>

            {/* Quick Calendar & Availability Sync Banner */}
            <div className="bg-gradient-to-r from-orange-50/80 via-amber-50/50 to-white rounded-2xl border border-orange-200/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#DE5C2B] text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900">Calendar & Live Slot Availability</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                      Booking Sync
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Students can only book your 1:1 call services when you publish dates and time slots in your calendar.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('calendar')}
                className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition flex items-center gap-2 shrink-0 shadow-sm cursor-pointer self-start sm:self-auto"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Open Calendar Schedule Manager →</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map((svc) => (
                <div key={svc._id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                        {svc.type.replace(/_/g, ' ')}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditService(svc)}
                          className="text-slate-400 hover:text-[#DE5C2B] transition-colors p-1 cursor-pointer"
                          title="Edit service details & price"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteService(svc._id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                          title="Delete service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 mb-1">{svc.title}</h3>
                    {svc.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{svc.description}</p>
                    )}
                  </div>

                  <div>
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-500">
                        {svc.type === 'ONE_ON_ONE' ? `${svc.durationMinutes} mins` : 'Async Delivery'}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-slate-900">
                          ₹{svc.priceInINR.toLocaleString('en-IN')}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenEditService(svc)}
                          className="text-[11px] font-bold text-[#DE5C2B] hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    </div>

                    {svc.type === 'ONE_ON_ONE' && (
                      <div className="mt-2.5 pt-2 border-t border-dashed border-orange-200/80 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#DE5C2B]" />
                          <span>{svc.durationMinutes || 30} mins slot</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveTab('calendar')}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#DE5C2B] hover:text-[#C04A1D] hover:underline cursor-pointer"
                        >
                          <CalendarDays className="w-3.5 h-3.5" />
                          <span>Manage Availability ↗</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 3: CALENDAR & PUBLISH SLOTS ── */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            {/* Header & Quick Status Banner */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/80 text-[#DE5C2B] flex items-center justify-center">
                    <InteractiveLottieIcon name="calendar" size={18} color="#DE5C2B" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Calendar &amp; Session Availability
                  </h2>
                </div>
                <p className="text-xs text-slate-500">
                  Manage when students can book 1:1 sessions with you. Pick calendar dates, configure weekly working hours, and link your 1:1 services.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={`${window.location.origin}/@${mentor?.handle || handle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:text-[#DE5C2B] hover:border-orange-300 hover:bg-orange-50/50 transition-colors"
                  title="View your public booking storefront"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>Preview as Student</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{data?.upcomingSlots?.length || data?.stats?.activeSlotsCount || 0} Live Slots Open</span>
                </div>
              </div>
            </div>

            {/* UniCoach Sub-Navigation Tabs & International Timezone Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCalendarSubTab('CALENDAR_VIEW')}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    calendarSubTab === 'CALENDAR_VIEW'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span className="canva-icon"><CalendarDays className="w-4 h-4 text-[#DE5C2B]" /></span>
                  <span>Interactive Calendar &amp; Day View</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCalendarSubTab('WEEKLY_HOURS')}
                  className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    calendarSubTab === 'WEEKLY_HOURS'
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <span className="canva-icon"><Clock className="w-4 h-4 text-indigo-600" /></span>
                  <span>Weekly Working Hours</span>
                </button>
              </div>

              {/* Timezone Switcher */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-xl border border-slate-200/90 shadow-2xs self-stretch md:self-auto justify-between md:justify-start">
                <Globe2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <select
                  value={mentorTimezone}
                  onChange={(e) => handleTimezoneChange(e.target.value)}
                  className="text-xs font-bold text-slate-900 bg-transparent border-none outline-none cursor-pointer pr-1 focus:ring-0"
                  title="Change your working timezone"
                >
                  <TimezoneOptions current={mentorTimezone} />
                </select>
              </div>
            </div>

            {/* ════════ SUB-TAB 1: INTERACTIVE MONTH CALENDAR & DAY VIEW ════════ */}
            {calendarSubTab === 'CALENDAR_VIEW' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Monthly Visual Calendar */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm lg:col-span-7 flex flex-col justify-between">
                  <div>
                    {/* Month Navigator Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Previous Month"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 min-w-[130px] text-center">
                          {calendarMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                          title="Next Month"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const now = new Date();
                            setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                            setSelectedCalendarDateStr(todayStr);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          Today
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const now = new Date();
                            setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                            setSelectedCalendarDateStr(tomorrowStr);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-orange-200 text-xs font-semibold text-[#DE5C2B] bg-orange-50/60 hover:bg-orange-50 transition-colors cursor-pointer"
                        >
                          Tomorrow
                        </button>
                      </div>
                    </div>

                    {/* Day-of-week headers (Monday to Sunday) */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName) => (
                        <div key={dayName} className="text-[11px] font-bold text-slate-400 uppercase tracking-wider py-1">
                          {dayName}
                        </div>
                      ))}
                    </div>

                    {/* 7-column Calendar Matrix */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                      {monthCalendarData.map((cell, idx) => {
                        if (!cell.isCurrentMonth) {
                          return (
                            <div
                              key={`pad-${idx}`}
                              className="min-h-[64px] sm:min-h-[76px] p-1.5 rounded-2xl bg-slate-50/40 border border-slate-100 flex flex-col justify-between opacity-35 pointer-events-none select-none"
                            >
                              <span className="text-xs font-medium text-slate-400">{cell.dayNumber}</span>
                            </div>
                          );
                        }

                        const isPast = cell.dateStr < todayStr;
                        const isToday = cell.dateStr === todayStr;
                        const isSelected = cell.dateStr === selectedCalendarDateStr;
                        const group = groupedUpcomingSlots.find(g => g.dateKey === cell.dateStr);
                        const availableCount = group?.availableCount || 0;
                        const bookedCount = group?.bookedCount || 0;
                        const blockedCount = group?.blockedCount || 0;

                        return (
                          <button
                            key={cell.dateStr}
                            type="button"
                            onClick={() => setSelectedCalendarDateStr(cell.dateStr)}
                            className={`min-h-[64px] sm:min-h-[76px] p-1.5 sm:p-2 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                              isSelected
                                ? 'bg-orange-50/70 border-[#DE5C2B] ring-2 ring-[#DE5C2B]/30 shadow-xs'
                                : isToday
                                  ? 'bg-white border-slate-400 hover:border-[#DE5C2B]'
                                  : isPast
                                    ? 'bg-slate-50/60 border-slate-200/60 text-slate-400 hover:bg-slate-100/60'
                                    : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'
                            }`}
                          >
                            {/* Day Number and Today Indicator */}
                            <div className="flex items-center justify-between w-full">
                              <span
                                className={`text-xs font-bold ${
                                  isSelected
                                    ? 'text-[#DE5C2B]'
                                    : isToday
                                      ? 'w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px]'
                                      : isPast
                                        ? 'text-slate-400'
                                        : 'text-slate-800'
                                }`}
                              >
                                {cell.dayNumber}
                              </span>

                              {isToday && !isSelected && (
                                <span className="hidden sm:inline text-[9px] font-bold text-slate-500 uppercase">Today</span>
                              )}
                            </div>

                            {/* Slot Count Badges */}
                            <div className="space-y-0.5 w-full">
                              {availableCount > 0 && (
                                <div className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 rounded-md leading-tight truncate flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                  <span>{availableCount} Live</span>
                                </div>
                              )}
                              {bookedCount > 0 && (
                                <div className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/70 px-1.5 py-0.5 rounded-md leading-tight truncate flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                  <span>{bookedCount} Booked</span>
                                </div>
                              )}
                              {blockedCount > 0 && availableCount === 0 && (
                                <div className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md leading-tight truncate">
                                  {blockedCount} Paused
                                </div>
                              )}
                              {availableCount === 0 && bookedCount === 0 && blockedCount === 0 && !isPast && (
                                <span className="text-[10px] text-slate-300 hidden sm:inline">—</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Calendar Legend & Quick Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Live Available Slots</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        <span>Booked Sessions</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500 ring-2 ring-orange-200" />
                        <span>Selected Day</span>
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setQuickAddModal({
                        isOpen: true,
                        dateStr: selectedCalendarDateStr,
                        timeStr: '18:00',
                        durationMinutes: 30,
                        serviceId: 'ALL'
                      })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Slot on {selectedDateGroup.dayLabel}</span>
                    </button>
                  </div>
                </div>

                {/* Right: Selected Day Inspector & Linked 1:1 Services */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm lg:col-span-5 flex flex-col justify-between">
                  <div>
                    {/* Selected Day Header */}
                    <div className="flex items-start justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-[#DE5C2B]">
                            {selectedDateGroup.isToday ? 'Today' : (selectedDateGroup.isTomorrow ? 'Tomorrow' : (selectedDateGroup.isDayAfter ? 'Day After Tomorrow' : 'Selected Day'))}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">
                          {selectedDateGroup.formattedFullDate}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCopyScheduleModal({
                            isOpen: true,
                            sourceDateStr: selectedCalendarDateStr,
                            targetDateStr: selectedCalendarDateStr === todayStr ? tomorrowStr : getDaysOffsetStr(1)
                          })}
                          disabled={selectedDateGroup.slots.length === 0}
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          title="Copy this day's slots to another date"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSlotsByDate(selectedCalendarDateStr)}
                          disabled={selectedDateGroup.slots.filter(s => s.status !== 'BOOKED').length === 0}
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          title="Clear all unbooked slots on this day"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* ── Linked 1:1 Services (Clean, Structured & Modern) ── */}
                    <div className="mb-4 p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-[#DE5C2B]" />
                          <h4 className="text-xs font-bold text-slate-800">Active 1:1 Services</h4>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs">
                          {oneOnOneServices.length} Active
                        </span>
                      </div>

                      {oneOnOneServices.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {oneOnOneServices.map((svc) => (
                            <div 
                              key={svc._id} 
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-slate-200/90 text-[11px] font-semibold text-slate-800 shadow-2xs"
                              title={`${svc.title} (${svc.durationMinutes || 30} mins - ₹${svc.priceInINR?.toLocaleString() || 0})`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              <span className="truncate max-w-[140px] sm:max-w-[170px]">{svc.title}</span>
                              <span className="font-extrabold text-[#DE5C2B] text-[10.5px] shrink-0">₹{svc.priceInINR?.toLocaleString() || 0}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-amber-800 text-[11px] flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>No active 1:1 services found. Create one in the Services tab.</span>
                        </div>
                      )}
                    </div>

                    {/* Day Slots List */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <span>Timeline Slots for {selectedDateGroup.dayLabel}</span>
                          <span className="text-[11px] font-semibold text-slate-400">({selectedDateGroup.slots.length})</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => setQuickAddModal({
                            isOpen: true,
                            dateStr: selectedCalendarDateStr,
                            timeStr: '18:00',
                            durationMinutes: 30,
                            serviceId: 'ALL'
                          })}
                          className="text-[11px] font-bold text-[#DE5C2B] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Slot</span>
                        </button>
                      </div>

                      {selectedDateGroup.slots.length > 0 ? (
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {selectedDateGroup.slots.map((s) => (
                            <div
                              key={s._id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                                s.status === 'AVAILABLE'
                                  ? 'bg-white border-emerald-200/80 shadow-2xs'
                                  : s.status === 'BOOKED'
                                    ? 'bg-indigo-50/60 border-indigo-200'
                                    : 'bg-slate-50 border-slate-200 text-slate-500'
                              }`}
                            >
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <Clock className={`w-3.5 h-3.5 ${s.status === 'AVAILABLE' ? 'text-emerald-600' : s.status === 'BOOKED' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                  <span className="font-bold text-slate-800">{s.timeStr}</span>
                                  <span className="text-[10px] text-slate-400 font-medium">({s.durationMinutes || 30}m)</span>
                                </div>

                                {/* Service Allocation Badge */}
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                  s.serviceTitle && s.serviceTitle !== 'All 1:1 Services'
                                    ? 'bg-amber-50 text-amber-800 border-amber-200/80'
                                    : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  {s.serviceTitle && s.serviceTitle !== 'All 1:1 Services' ? `🎯 ${s.serviceTitle}` : '✨ All Services'}
                                </span>

                                {s.istTimeStr && mentorTimezone !== 'Asia/Kolkata' && (
                                  <span className="text-[10px] font-semibold text-[#DE5C2B] bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-200/60" title="Time seen by Indian students">
                                    🇮🇳 Students: {s.istTimeStr}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                    s.status === 'AVAILABLE'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : s.status === 'BOOKED'
                                        ? 'bg-indigo-100 text-indigo-800'
                                        : 'bg-slate-200 text-slate-700'
                                  }`}
                                >
                                  {s.status === 'BLOCKED' ? 'PAUSED' : (s.status === 'AVAILABLE' ? 'LIVE' : s.status)}
                                </span>

                                {s.status === 'AVAILABLE' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleSlotStatus(s._id)}
                                      className="p-1 text-slate-400 hover:text-amber-600 rounded-md hover:bg-amber-50 transition-colors cursor-pointer"
                                      title="Pause slot (temporarily hide from students)"
                                    >
                                      <Pause className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSlot(s._id)}
                                      className="p-1 text-slate-300 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                                      title="Delete this slot"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}

                                {s.status === 'BLOCKED' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleToggleSlotStatus(s._id)}
                                      className="p-1 text-emerald-600 hover:text-emerald-700 rounded-md hover:bg-emerald-50 transition-colors cursor-pointer"
                                      title="Resume slot (make visible & bookable)"
                                    >
                                      <Play className="w-3.5 h-3.5 fill-emerald-600" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSlot(s._id)}
                                      className="p-1 text-slate-300 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                                      title="Delete paused slot"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}

                                {s.status === 'BOOKED' && (
                                  <span title="Booked session protected from deletion" className="p-1 text-indigo-400">
                                    <Lock className="w-3.5 h-3.5" />
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-6 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                          <p className="text-xs font-semibold text-slate-700 mb-1">No slots open on this date yet</p>
                          <p className="text-[11px] text-slate-400 mb-3">Open a time block below to start receiving 1:1 call bookings</p>

                          <div className="flex flex-wrap items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={async () => {
                                setActionLoading(true);
                                try {
                                  await publishMentorSlots(handle, {
                                    dates: [selectedCalendarDateStr],
                                    dateStr: selectedCalendarDateStr,
                                    startTime: '18:00',
                                    endTime: '21:00',
                                    durationMinutes: 30
                                  });
                                  setFeedback({ type: 'success', text: `Published Evening slots (6:00 PM – 9:00 PM) for ${selectedDateGroup.dayLabel}!` });
                                  await loadDashboard(handle);
                                } catch (err) {
                                  setFeedback({ type: 'error', text: err.message || 'Failed to open slots.' });
                                } finally {
                                  setActionLoading(false);
                                }
                              }}
                              disabled={actionLoading}
                              className="px-2.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#DE5C2B] border border-orange-200 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              🌆 + Open Evening (6–9 PM)
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                setActionLoading(true);
                                try {
                                  await publishMentorSlots(handle, {
                                    dates: [selectedCalendarDateStr],
                                    dateStr: selectedCalendarDateStr,
                                    startTime: '10:00',
                                    endTime: '13:00',
                                    durationMinutes: 30
                                  });
                                  setFeedback({ type: 'success', text: `Published Morning slots (10:00 AM – 1:00 PM) for ${selectedDateGroup.dayLabel}!` });
                                  await loadDashboard(handle);
                                } catch (err) {
                                  setFeedback({ type: 'error', text: err.message || 'Failed to open slots.' });
                                } finally {
                                  setActionLoading(false);
                                }
                              }}
                              disabled={actionLoading}
                              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              🌅 + Open Morning (10 AM–1 PM)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Tip for Mentors */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
                    <Sparkles className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                    <span>Slots are bookable across all your 1:1 call services simultaneously without double-booking.</span>
                  </div>
                </div>
              </div>
            )}

            {/* ════════ SUB-TAB 2: UniCoach-STYLE WEEKLY WORKING HOURS ════════ */}
            {calendarSubTab === 'WEEKLY_HOURS' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-600" />
                      <span>Standard Weekly Working Hours</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Configure your recurring available hours for each day of the week, just like UniCoach. UniCoach will automatically generate slots on your calendar.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const mon = weeklySchedule[1];
                      setWeeklySchedule({
                        1: { ...mon, enabled: true },
                        2: { ...mon, dayName: 'Tuesday', enabled: true },
                        3: { ...mon, dayName: 'Wednesday', enabled: true },
                        4: { ...mon, dayName: 'Thursday', enabled: true },
                        5: { ...mon, dayName: 'Friday', enabled: true },
                        6: { dayName: 'Saturday', enabled: false, startTime: '11:00', endTime: '17:00' },
                        0: { dayName: 'Sunday', enabled: false, startTime: '11:00', endTime: '17:00' }
                      });
                      setFeedback({ type: 'success', text: 'Copied Monday hours to all weekdays (Tuesday–Friday)!' });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Mon Hours to Weekdays</span>
                  </button>
                </div>

                {/* Timezone Sync Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-200/60 flex items-center justify-center shrink-0">
                      <Globe2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{mentorTimezone.split('/')[1]?.replace(/_/g, ' ') || mentorTimezone}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200/60">
                        {getTimezoneDiff(mentorTimezone)}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        → Students see IST-converted times
                      </span>
                    </div>
                  </div>

                  <select
                    value={mentorTimezone}
                    onChange={(e) => handleTimezoneChange(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-900 shadow-sm cursor-pointer focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <TimezoneOptions current={mentorTimezone} />
                  </select>
                </div>

                {/* Day-by-Day Working Hours List (Monday to Sunday) */}
                <div className="space-y-3">
                  {[
                    { key: 1, label: 'Monday' },
                    { key: 2, label: 'Tuesday' },
                    { key: 3, label: 'Wednesday' },
                    { key: 4, label: 'Thursday' },
                    { key: 5, label: 'Friday' },
                    { key: 6, label: 'Saturday' },
                    { key: 0, label: 'Sunday' }
                  ].map(({ key, label }) => {
                    const dayConfig = weeklySchedule[key] || { enabled: false, startTime: '10:00', endTime: '19:00' };

                    return (
                      <div
                        key={key}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          dayConfig.enabled
                            ? 'bg-white border-slate-200/90 shadow-2xs'
                            : 'bg-slate-50/70 border-slate-200/60 opacity-60'
                        }`}
                      >
                        {/* Day Name & Toggle */}
                        <div className="flex items-center gap-3 min-w-[150px]">
                          <input
                            type="checkbox"
                            id={`day-toggle-${key}`}
                            checked={dayConfig.enabled}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setWeeklySchedule(prev => ({
                                ...prev,
                                [key]: { ...prev[key], enabled: checked }
                              }));
                            }}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <label htmlFor={`day-toggle-${key}`} className="text-xs sm:text-sm font-bold text-slate-800 cursor-pointer">
                            {label}
                          </label>
                        </div>

                        {/* Working Hours Pickers */}
                        {dayConfig.enabled ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-semibold text-slate-500">From</span>
                              <input
                                type="time"
                                value={dayConfig.startTime}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setWeeklySchedule(prev => ({
                                    ...prev,
                                    [key]: { ...prev[key], startTime: val }
                                  }));
                                }}
                                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:bg-white text-slate-800"
                              />
                            </div>

                            <span className="text-slate-400 font-bold">—</span>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[11px] font-semibold text-slate-500">To</span>
                              <input
                                type="time"
                                value={dayConfig.endTime}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setWeeklySchedule(prev => ({
                                    ...prev,
                                    [key]: { ...prev[key], endTime: val }
                                  }));
                                }}
                                className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:bg-white text-slate-800"
                              />
                            </div>

                            {/* Live Indian Student Time (IST) Preview */}
                            {(() => {
                              const istFrom = convertMentorTimeToIST(dayConfig.startTime, mentorTimezone);
                              const istTo = convertMentorTimeToIST(dayConfig.endTime, mentorTimezone);
                              if (!istFrom || !istTo) return null;
                              return (
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600 sm:ml-2">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-[#DE5C2B] border border-orange-200/80 font-bold">
                                    <span>🇮🇳 Indian Students see:</span>
                                    <strong className="text-slate-900">{istFrom.istTimeStr} – {istTo.istTimeStr} IST</strong>
                                    {istTo.isNextDay && <span className="text-purple-700 font-extrabold text-[10px] bg-purple-100 px-1.5 py-0.2 rounded-md">(Next Day)</span>}
                                  </span>

                                  {istFrom.isLateNight ? (
                                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-300 flex items-center gap-1" title="Falls late night / past midnight in India">
                                      ⚠️ Late Night in India
                                    </span>
                                  ) : istFrom.isPrimeHours ? (
                                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-300 flex items-center gap-1" title="Prime booking time for Indian students">
                                      🔥 Prime Time
                                    </span>
                                  ) : null}
                                </div>
                              );
                            })()}
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400 italic">
                            Unavailable / Day Off
                          </span>
                        )}

                        {/* Day Status Pill */}
                        <div className="shrink-0">
                          {dayConfig.enabled ? (
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-full">
                              ● Available
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                              Off
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Automation & Horizon Controls */}
                <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Weekly Schedule Generation Settings</span>
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Choose how far in advance to generate booking slots. Existing booked student sessions are strictly preserved and never overwritten.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Horizon Window
                      </label>
                      <select
                        value={weeklyPublishDays}
                        onChange={(e) => setWeeklyPublishDays(Number(e.target.value))}
                        className="px-3 py-1.5 rounded-xl border border-indigo-200 text-xs font-bold bg-white text-slate-800 shadow-2xs"
                      >
                        <option value={7}>Next 7 Days (1 Week)</option>
                        <option value={14}>Next 14 Days (2 Weeks)</option>
                        <option value={30}>Next 30 Days (1 Month)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        Slot Duration
                      </label>
                      <select
                        value={weeklySlotDuration}
                        onChange={(e) => setWeeklySlotDuration(Number(e.target.value))}
                        className="px-3 py-1.5 rounded-xl border border-indigo-200 text-xs font-bold bg-white text-slate-800 shadow-2xs"
                      >
                        <option value={15}>15 Minutes</option>
                        <option value={30}>30 Minutes</option>
                        <option value={45}>45 Minutes</option>
                        <option value={60}>60 Minutes</option>
                      </select>
                    </div>

                    <div className="self-end">
                      <button
                        type="button"
                        onClick={handlePublishWeeklySchedule}
                        disabled={actionLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-white" />}
                        <span>Apply Weekly Schedule to Calendar</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Scheduling Protections Info Bar */}
            <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>{data?.mentor?.bufferMinutes || 10}m Buffer</strong> Rest Window</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>2h Minimum</strong> Notice Protection</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200/70">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span><strong>10m Anti-Clash</strong> Cart Lock</span>
              </div>
            </div>

            {/* ── MODAL 1: QUICK ADD SINGLE SLOT ── */}
            {quickAddModal.isOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Add 1 Specific Slot</h4>
                        <p className="text-[11px] text-slate-500">Add a custom time window on your calendar</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setQuickAddModal({ isOpen: false, dateStr: '', timeStr: '18:00', durationMinutes: 30, serviceId: 'ALL' })}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateSingleSlot} className="space-y-3.5">
                    {/* Select 1:1 Service Allocation */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Applicable 1:1 Service
                      </label>
                      <select
                        value={quickAddModal.serviceId || 'ALL'}
                        onChange={(e) => setQuickAddModal(prev => ({ ...prev, serviceId: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium focus:ring-1 focus:ring-[#DE5C2B]"
                      >
                        <option value="ALL">✨ All 1:1 Services (Open for any service)</option>
                        {oneOnOneServices.map(svc => (
                          <option key={svc._id} value={svc._id}>
                            🎯 {svc.title} ({svc.durationMinutes || 30}m - ₹{svc.priceInINR?.toLocaleString() || 0})
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Choose whether this slot is dedicated to one service or bookable for all.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Select Date
                      </label>
                      <input
                        type="date"
                        required
                        min={todayStr}
                        value={quickAddModal.dateStr}
                        onChange={(e) => setQuickAddModal(prev => ({ ...prev, dateStr: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Start Time ({mentorTimezone.includes('Dublin') ? 'Dublin Time' : mentorTimezone.split('/')[1]?.replace(/_/g, ' ') || 'Your Time'})
                      </label>
                      <input
                        type="time"
                        required
                        value={quickAddModal.timeStr}
                        onChange={(e) => setQuickAddModal(prev => ({ ...prev, timeStr: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Duration
                      </label>
                      <select
                        value={quickAddModal.durationMinutes}
                        onChange={(e) => setQuickAddModal(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                      >
                        <option value={15}>15 Minutes (Quick Call)</option>
                        <option value={30}>30 Minutes (Recommended)</option>
                        <option value={45}>45 Minutes (Deep Dive)</option>
                        <option value={60}>60 Minutes (Full Strategy)</option>
                      </select>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuickAddModal({ isOpen: false, dateStr: '', timeStr: '18:00', durationMinutes: 30, serviceId: 'ALL' })}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-[#DE5C2B] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        <span>Publish Slot</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ── MODAL 2: COPY / DUPLICATE DAY SCHEDULE ── */}
            {copyScheduleModal.isOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Copy className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">Duplicate Day Schedule</h4>
                        <p className="text-[11px] text-slate-500">Copy all slots from one day to another</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCopyScheduleModal({ isOpen: false, sourceDateStr: '', targetDateStr: '' })}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form onSubmit={handleCopySlots} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Source Date (Copy from)
                      </label>
                      <input
                        type="date"
                        required
                        value={copyScheduleModal.sourceDateStr}
                        onChange={(e) => setCopyScheduleModal(prev => ({ ...prev, sourceDateStr: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 font-medium text-slate-700"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Target Date (Paste slots into)
                      </label>
                      <input
                        type="date"
                        required
                        min={todayStr}
                        value={copyScheduleModal.targetDateStr}
                        onChange={(e) => setCopyScheduleModal(prev => ({ ...prev, targetDateStr: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-medium"
                      />
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[10px] text-slate-400">Quick Pick:</span>
                        <button
                          type="button"
                          onClick={() => setCopyScheduleModal(prev => ({ ...prev, targetDateStr: tomorrowStr }))}
                          className="text-[10px] font-bold text-indigo-600 hover:underline"
                        >
                          ⚡ Tomorrow
                        </button>
                        <span className="text-slate-300">·</span>
                        <button
                          type="button"
                          onClick={() => setCopyScheduleModal(prev => ({ ...prev, targetDateStr: dayAfterStr }))}
                          className="text-[10px] font-bold text-indigo-600 hover:underline"
                        >
                          📅 Day After Tomorrow
                        </button>
                      </div>
                    </div>

                    <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-[11px] text-indigo-900 leading-relaxed flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>
                        Existing slots on the target date will NOT be overwritten; only new matching time blocks will be added.
                      </span>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCopyScheduleModal({ isOpen: false, sourceDateStr: '', targetDateStr: '' })}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-[#DE5C2B] text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>Copy Slots</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: BOOKINGS & CALLS ── */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">Student Bookings &amp; Requests</h2>
                <p className="text-xs text-slate-500">Track 1:1 video consultations, student priority questions, and SOP reviews</p>
              </div>

              {/* Filter Pills - Responsive Wrapped Without Scroller */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {[
                  { id: 'ALL', label: 'All Active', count: upcomingBookings.length },
                  { id: 'CALLS', label: '1:1 Calls', count: upcomingBookings.filter(b => b.startUtc && !isNaN(new Date(b.startUtc).getTime())).length },
                  { id: 'DMS', label: 'Priority DMs', count: upcomingBookings.filter(b => b.serviceId?.type === 'PRIORITY_DM' || b.priorityDm?.questionText).length },
                  { id: 'SOP', label: 'SOP Reviews', count: upcomingBookings.filter(b => b.serviceId?.type === 'SOP_REVIEW').length },
                  { id: 'PAST', label: 'Past / Completed', count: pastBookings.length }
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setBookingFilter(f.id)}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      bookingFilter === f.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className={`ml-1 text-[10px] px-1.5 py-0.2 rounded-full ${
                      bookingFilter === f.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {f.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {(() => {
              // Apply active filter
              let filtered = [];
              if (bookingFilter === 'PAST') {
                filtered = pastBookings;
              } else if (bookingFilter === 'CALLS') {
                filtered = upcomingBookings.filter(b => b.startUtc && !isNaN(new Date(b.startUtc).getTime()));
              } else if (bookingFilter === 'DMS') {
                filtered = upcomingBookings.filter(b => b.serviceId?.type === 'PRIORITY_DM' || b.priorityDm?.questionText);
              } else if (bookingFilter === 'SOP') {
                filtered = upcomingBookings.filter(b => b.serviceId?.type === 'SOP_REVIEW');
              } else {
                filtered = upcomingBookings;
              }

              if (filtered.length === 0) {
                return (
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 text-center space-y-2">
                    <p className="text-sm font-semibold text-slate-800">
                      {bookingFilter === 'PAST' ? 'No completed or past sessions found.' : 'No active bookings or requests under this category.'}
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Share your creator profile link (/@{mentor?.handle || handle}) with students on LinkedIn, WhatsApp, or Instagram to receive requests.
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {filtered.map((b) => {
                    const isDm = b.serviceId?.type === 'PRIORITY_DM' || Boolean(b.priorityDm?.questionText);
                    const isSop = b.serviceId?.type === 'SOP_REVIEW';
                    const is1on1 = Boolean(b.startUtc && !isNaN(new Date(b.startUtc).getTime()));
                    const isPast = b.state === 'COMPLETED' || b.state === 'CANCELLED' || b.state === 'REFUNDED';

                    return (
                      <div 
                        key={b._id} 
                        className={`bg-white rounded-2xl border p-5 shadow-sm transition-all ${
                          isDm 
                            ? 'border-amber-200 bg-gradient-to-r from-amber-50/20 to-white' 
                            : isSop 
                              ? 'border-indigo-200 bg-gradient-to-r from-indigo-50/20 to-white'
                              : 'border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded flex items-center gap-1.5 ${
                                isDm 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : isSop 
                                    ? 'bg-indigo-100 text-indigo-800' 
                                    : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {isDm ? <MessageSquare className="w-3 h-3 text-amber-600" /> : isSop ? <FileText className="w-3 h-3 text-indigo-600" /> : <Video className="w-3 h-3 text-emerald-600" />}
                                <span>{b.serviceId?.title || (isDm ? 'Priority DM' : isSop ? 'SOP Review' : '1:1 Session')}</span>
                              </span>

                              <span className="text-xs font-mono text-slate-400">{b.bookingRef}</span>

                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                b.state === 'COMPLETED' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : b.state === 'CONFIRMED' 
                                    ? 'bg-orange-50 text-[#C04A1D] border border-orange-200' 
                                    : 'bg-slate-100 text-slate-600'
                              }`}>
                                {b.state}
                              </span>

                              {b.couponCode && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                                  <Tag className="w-2.5 h-2.5 text-emerald-600" />
                                  {b.couponCode} (-₹{b.discountAmount || 0})
                                </span>
                              )}
                            </div>

                            <h4 className="text-base font-bold text-slate-900 mt-1">{b.studentName}</h4>
                            <p className="text-xs text-slate-500">{b.studentEmail} • {b.studentPhone}</p>

                            {/* Scheduled Time or Submitted Relative Date */}
                            <p className="text-xs font-semibold mt-1.5 flex items-center gap-1.5 text-slate-700">
                              <Clock className={`w-3.5 h-3.5 ${is1on1 ? 'text-indigo-600' : 'text-amber-600'}`} />
                              {is1on1 ? (
                                <span className="text-indigo-600 font-bold">
                                  Scheduled: {new Date(b.startUtc).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                                </span>
                              ) : (
                                <span className="text-slate-600">
                                  Async Request • Submitted {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                                </span>
                              )}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap">
                            {/* Priority DM Answer Action */}
                            {isDm && !isPast && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveTab('priority_dms');
                                  loadPriorityDms(handle);
                                }}
                                className="py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <MessageSquare className="w-4 h-4" />
                                <span>{b.priorityDm?.status === 'ANSWERED' ? 'View Answer' : 'Answer Question'}</span>
                              </button>
                            )}

                            {/* Mark Completed Button */}
                            {!isPast && (
                              <button
                                type="button"
                                onClick={() => handleBookingStatus(b._id, 'COMPLETED')}
                                className="py-2.5 px-3.5 rounded-xl border border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold text-xs transition-colors cursor-pointer"
                              >
                                {isSop ? 'Mark Reviewed & Release Payout' : 'Mark Completed'}
                              </button>
                            )}

                            {isPast && (b.state === 'CANCELLED' || b.state === 'REFUNDED') && (
                              <span className="text-xs font-bold text-rose-600 px-3 py-1.5 bg-rose-50 rounded-xl border border-rose-200">
                                Cancelled · student refunded
                              </span>
                            )}

                            {isPast && b.state === 'COMPLETED' && (
                              <span className="text-xs font-bold text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-xl border border-emerald-200">
                                ✓ Completed · payout released
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Priority DM Question Callout Box */}
                        {b.priorityDm?.questionText && (
                          <div className="mt-3 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/90 text-xs text-amber-950 space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-amber-900">
                              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                              <span>Student's Question for You:</span>
                            </div>
                            <p className="font-semibold pl-5">"{b.priorityDm.questionText}"</p>
                            {b.priorityDm.contextText && (
                              <p className="text-[11px] text-amber-800/90 pl-5 italic">
                                Context: {b.priorityDm.contextText}
                              </p>
                            )}
                            {b.priorityDm.answerText && (
                              <div className="mt-2 pt-2 border-t border-amber-200/60 pl-5">
                                <span className="font-bold text-emerald-700 block text-[11px]">Your Answer:</span>
                                <p className="text-slate-800">{b.priorityDm.answerText}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Student Notes */}
                        {(b.studentNotes || b.notes) && (
                          <p className="text-xs text-slate-600 italic mt-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <strong>Note:</strong> "{(b.studentNotes || b.notes)}"
                          </p>
                        )}

                        {/* Expandable Custom Intake Answers (UniCoach Feature) */}
                        {b.customAnswers && b.customAnswers.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => toggleBookingExpansion(b._id)}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>
                                {expandedBookingIds.has(b._id)
                                  ? 'Hide Student Intake Answers'
                                  : `View Student Intake Answers (${b.customAnswers.length})`}
                              </span>
                              {expandedBookingIds.has(b._id) ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {expandedBookingIds.has(b._id) && (
                              <div className="mt-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
                                {b.customAnswers.map((qa, i) => (
                                  <div key={i} className="border-b border-slate-200/50 last:border-b-0 pb-2 last:pb-0">
                                    <span className="font-bold text-slate-700 block text-[11px] mb-0.5">
                                      {qa.questionText}
                                    </span>
                                    {qa.answerText?.startsWith('http') ? (
                                      <a
                                        href={qa.answerText}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-indigo-600 hover:underline inline-flex items-center gap-1 font-medium break-all"
                                      >
                                        <span>{qa.answerText}</span>
                                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                      </a>
                                    ) : (
                                      <p className="text-slate-800 font-medium">
                                        {qa.answerText || 'No answer provided'}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 1:1 Meeting Link Toolbar (Join Meet, Copy Link, 1-Click Email, Edit Link) */}
                        {is1on1 && (
                          <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/90 -mx-4 -mb-4 p-3.5 sm:p-4 rounded-b-2xl">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
                                <Video className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                                    {b.meeting?.platform === 'ZOOM' ? 'Zoom Meeting' : b.meeting?.platform === 'CUSTOM' ? 'Custom Meeting' : 'Google Meet'}
                                  </span>
                                  {b.meeting?.joinUrl && (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded-sm">
                                      Active Link
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs font-mono text-slate-700 truncate select-all font-semibold" title={b.meeting?.joinUrl}>
                                  {b.meeting?.joinUrl || 'No meeting link assigned yet'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                              {/* 1. Join Meet */}
                              {b.meeting?.joinUrl && !isPast && (
                                <a
                                  href={b.meeting.joinUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex-1 sm:flex-none justify-center py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                  <span>Join</span>
                                </a>
                              )}

                              {/* 2. Copy Link */}
                              {b.meeting?.joinUrl && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyMeetingLink(b)}
                                  className="flex-1 sm:flex-none justify-center py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                                  title="Copy meeting link"
                                >
                                  {copiedBookingId === b._id ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      <span className="text-emerald-600">Copied</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                                      <span>Copy</span>
                                    </>
                                  )}
                                </button>
                              )}

                              {/* 3. 1-Click Send Email to Student */}
                              {!isPast && (
                                <button
                                  type="button"
                                  onClick={() => handleSendInviteEmail(b)}
                                  disabled={sendingEmailId === b._id}
                                  className="flex-1 sm:flex-none justify-center py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
                                  title={`1-Click Email invite with meeting details to ${b.studentEmail}`}
                                >
                                  {sendingEmailId === b._id ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                      <span>Sending...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Mail className="w-3.5 h-3.5 text-indigo-300" />
                                      <span>Email Invite</span>
                                    </>
                                  )}
                                </button>
                              )}

                              {/* 4. Edit / Custom Meeting Link */}
                              {!isPast && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditMeeting(b)}
                                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all cursor-pointer flex-shrink-0"
                                  title="Change to personal Zoom or Meet URL"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── TAB 5: PROMO CODES & DISCOUNTS (UniCoach Feature) ── */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Promo Codes & Discounts</h2>
                <p className="text-xs text-slate-500">
                  Create custom discount codes (e.g. EARLY20, YOUTUBE50) for your community.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(true)}
                className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                Create Promo Code
              </button>
            </div>

            {couponsLoading ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">Loading your active coupons...</p>
              </div>
            ) : coupons.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center">
                <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-800">No promo codes created yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                  Boost your 1:1 call bookings by launching an exclusive discount code for your followers.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(true)}
                  className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs hover:bg-indigo-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Your First Code
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <div
                    key={c._id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-sm tracking-wider text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            {c.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(c.code)}
                            className="text-slate-400 hover:text-indigo-600 transition-colors p-1"
                            title="Copy code"
                          >
                            {copiedCode === c.code ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(c._id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Delete coupon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1 mb-4">
                        <div className="text-lg font-black text-emerald-600">
                          {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                        </div>
                        <p className="text-xs text-slate-500">
                          Valid on all active mentorship offerings
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>
                        Usage: <strong className="text-slate-800">{c.usedCount}</strong> / {c.maxUses > 0 ? c.maxUses : '∞'}
                      </span>
                      <span>
                        {c.expiresAt
                          ? `Expires: ${new Date(c.expiresAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                          : 'Never expires'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 5: PRIORITY DMS INBOX (UniCoach Feature) ── */}
        {activeTab === 'priority_dms' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Priority DMs & Paid Queries</h2>
                <p className="text-xs text-slate-500">
                  Guaranteed text advice inbox. Your earnings are released to your bank automatically once you answer.
                </p>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveDmFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeDmFilter === 'PENDING'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Pending Actions</span>
                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {priorityDms.pendingCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveDmFilter('ANSWERED')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    activeDmFilter === 'ANSWERED'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>Answered Queries</span>
                  <span className="text-[11px] opacity-75">({priorityDms.answeredCount})</span>
                </button>
              </div>
            </div>

            {priorityDmsLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
                <p className="text-xs text-slate-500">Loading student questions...</p>
              </div>
            ) : (activeDmFilter === 'PENDING' ? priorityDms.pending : priorityDms.answered).length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  {activeDmFilter === 'PENDING' ? 'No pending student questions' : 'No answered queries yet'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  {activeDmFilter === 'PENDING'
                    ? 'When students submit Priority DMs from your profile, they will appear here with an SLA timer.'
                    : 'Questions you answer will be archived here along with your response history.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {(activeDmFilter === 'PENDING' ? priorityDms.pending : priorityDms.answered).map((dm) => (
                  <div key={dm._id} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                    {/* DM Card Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-slate-900">{dm.studentName}</span>
                          <span className="text-xs text-slate-400 font-mono">({dm.bookingRef})</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {dm.studentEmail} • {dm.studentPhone} • Asked {new Date(dm.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {dm.status === 'PENDING' ? (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                            dm.isExpired
                              ? 'bg-rose-100 text-rose-800'
                              : dm.slaRemaining.hours < 12
                              ? 'bg-amber-100 text-amber-800 animate-pulse'
                              : 'bg-indigo-50 text-indigo-700'
                          }`}>
                            <Clock className="w-3.5 h-3.5" />
                            {dm.isExpired ? 'SLA Expired' : `${dm.slaRemaining.formatted} left to answer`}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Answered & Credited (₹{dm.mentorEarning})
                          </span>
                        )}

                        <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                          ₹{dm.priceInINR}
                        </span>
                      </div>
                    </div>

                    {/* Question Box */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Student's Question:
                      </span>
                      <p className="text-sm text-slate-800 font-medium whitespace-pre-wrap">
                        {dm.questionText}
                      </p>

                      {dm.contextText && (
                        <p className="text-xs text-slate-500 pt-1 border-t border-slate-200/60">
                          <strong>Context:</strong> {dm.contextText}
                        </p>
                      )}

                      {dm.referenceUrl && (
                        <div className="pt-1">
                          <a
                            href={dm.referenceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            View Attached Reference / Portfolio Link
                          </a>
                        </div>
                      )}
                    </div>

                    {/* If PENDING: Reply Composer */}
                    {dm.status === 'PENDING' && (
                      <div className="space-y-3 pt-2">
                        <label className="block text-xs font-bold text-slate-800">
                          Your Mentorship Response:
                        </label>
                        <textarea
                          rows="4"
                          placeholder="Write your comprehensive advice, actionable steps, and recommendations..."
                          value={replyForms[dm._id]?.answerText || ''}
                          onChange={(e) => setReplyForms({
                            ...replyForms,
                            [dm._id]: {
                              ...(replyForms[dm._id] || {}),
                              answerText: e.target.value
                            }
                          })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-amber-500 focus:outline-none resize-none"
                        />

                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <div className="relative flex-1 w-full">
                            <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="url"
                              placeholder="Optional attachment link (Google Drive, Notion doc, Loom video)..."
                              value={replyForms[dm._id]?.attachmentUrl || ''}
                              onChange={(e) => setReplyForms({
                                ...replyForms,
                                [dm._id]: {
                                  ...(replyForms[dm._id] || {}),
                                  attachmentUrl: e.target.value
                                }
                              })}
                              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:border-amber-500 focus:outline-none"
                            />
                          </div>

                          <button
                            type="button"
                            disabled={isAnswering}
                            onClick={() => handleAnswerSubmit(dm._id)}
                            className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                          >
                            {isAnswering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                            Send Answer & Release ₹{dm.mentorEarning} Payout
                          </button>
                        </div>
                      </div>
                    )}

                    {/* If ANSWERED: Display Sent Response */}
                    {dm.status === 'ANSWERED' && (
                      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-emerald-800 font-semibold">
                          <span>Your Sent Answer:</span>
                          <span>{dm.answeredAt ? new Date(dm.answeredAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : ''}</span>
                        </div>
                        <p className="text-xs text-slate-800 whitespace-pre-wrap">
                          {dm.answerText}
                        </p>
                        {dm.attachmentUrl && (
                          <a
                            href={dm.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-emerald-700 hover:underline inline-flex items-center gap-1 mt-1"
                          >
                            <LinkIcon className="w-3.5 h-3.5" />
                            Attached Resource: {dm.attachmentUrl}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: EARNINGS & AUTOMATIC PAYOUTS (Razorpay Route) ── */}
        {activeTab === 'payouts' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Earnings & Payouts</h2>
              <p className="text-xs text-slate-500">
                Payouts are automatic — your share of every paid booking is sent to your bank account once the session is completed. No withdrawal requests needed.
              </p>
            </div>

            {/* Payout Account Card */}
            {(() => {
              const acct = payoutAccount || {};
              const acctStatus = acct.status || 'NOT_STARTED';
              const isActive = acctStatus === 'ACTIVATED';
              const isProblem = ['NEEDS_CLARIFICATION', 'FAILED', 'SUSPENDED'].includes(acctStatus);
              const bankLast4 = acct.bankLast4 || mentor?.defaultPayoutDetails?.accountNumber?.slice(-4) || '';
              const missing = Array.isArray(acct.missingDetails) ? acct.missingDetails : [];
              return (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#DE5C2B] flex items-center justify-center flex-shrink-0">
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Payout account</h3>
                        <div className="mt-1.5">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Active — payouts go to bank ••••{bankLast4 || '----'}
                            </span>
                          ) : isProblem ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <AlertCircle className="w-3.5 h-3.5" />
                              {acctStatus === 'SUSPENDED' ? 'Suspended' : acctStatus === 'FAILED' ? 'Setup failed' : 'Needs your attention'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Clock className="w-3.5 h-3.5" />
                              Being set up by Razorpay
                            </span>
                          )}
                        </div>
                        {(acct.ifscCode || mentor?.defaultPayoutDetails?.ifscCode) && (
                          <p className="text-[11px] text-slate-500 mt-1.5 font-mono">
                            {mentor?.defaultPayoutDetails?.bankName ? `${mentor.defaultPayoutDetails.bankName} · ` : ''}
                            IFSC {acct.ifscCode || mentor?.defaultPayoutDetails?.ifscCode}
                            {bankLast4 ? ` · A/C ••••${bankLast4}` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={openBankDetailsModal}
                      className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 self-start flex-shrink-0"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Edit bank details</span>
                    </button>
                  </div>

                  {isProblem && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed">
                      {acct.lastError || 'Razorpay could not verify your payout account. Please check your bank and verification details.'}
                    </div>
                  )}

                  {missing.length > 0 && (
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <span className="font-bold block mb-1">Missing details:</span>
                      <ul className="list-disc pl-5 space-y-0.5">
                        {missing.map((m) => (
                          <li key={m}>{m}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {!acct.routeEnabled && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                      Automatic payouts are being switched on by UniCoach; your earnings are safe and will be transferred once active.
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Earnings Summary Tiles */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500">Total paid by students</span>
                  <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                    {formatINRAmount(earningsSummary?.grossINR)}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500">Razorpay fee + GST</span>
                  <div className="text-xl sm:text-2xl font-black text-slate-700 mt-1">
                    {formatINRAmount((Number(earningsSummary?.gatewayFeeINR) || 0) + (Number(earningsSummary?.gatewayTaxINR) || 0))}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500">Sent to your bank</span>
                  <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
                    {formatINRAmount(earningsSummary?.releasedToBankINR)}
                  </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500">On hold until session completes</span>
                  <div className="text-xl sm:text-2xl font-black text-amber-700 mt-1">
                    {formatINRAmount(earningsSummary?.onHoldINR)}
                  </div>
                </div>
                {(Number(earningsSummary?.pendingSetupINR) || 0) > 0 && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <span className="text-xs font-semibold text-slate-500">Waiting for payout setup</span>
                    <div className="text-xl sm:text-2xl font-black text-slate-700 mt-1">
                      {formatINRAmount(earningsSummary?.pendingSetupINR)}
                    </div>
                  </div>
                )}
                {(Number(earningsSummary?.refundedINR) || 0) > 0 && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                    <span className="text-xs font-semibold text-slate-500">Refunded</span>
                    <div className="text-xl sm:text-2xl font-black text-rose-700 mt-1">
                      {formatINRAmount(earningsSummary?.refundedINR)}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500">
                UniCoach charges 0% commission. Only Razorpay's payment fee (~2% + GST) is deducted.
              </p>
            </div>

            {/* Earnings Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                <span>Earnings</span>
                <span className="text-xs font-normal text-slate-500">({earnings.length} paid booking{earnings.length === 1 ? '' : 's'})</span>
              </h3>

              {earnings.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <Wallet className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-medium text-slate-600">No paid bookings yet.</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Your earnings from paid sessions, Priority DMs and SOP reviews will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[760px]">
                    <thead>
                      <tr className="text-slate-400 uppercase font-bold border-b border-slate-100">
                        <th className="pb-3 pr-3 font-semibold">Date</th>
                        <th className="pb-3 pr-3 font-semibold">Service</th>
                        <th className="pb-3 pr-3 font-semibold">Student</th>
                        <th className="pb-3 pr-3 font-semibold text-right">Paid</th>
                        <th className="pb-3 pr-3 font-semibold text-right">Razorpay fee</th>
                        <th className="pb-3 pr-3 font-semibold text-right">GST</th>
                        <th className="pb-3 pr-3 font-semibold text-right">You get</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {earnings.map((row) => {
                        const pendingCapture = row.settlementStatus === 'PENDING_CAPTURE';
                        const meta = SETTLEMENT_STATUS_META[row.settlementStatus] || { label: row.settlementStatus || '—', className: 'bg-slate-50 text-slate-600 border-slate-200' };
                        const rowDate = row.paidAt || row.startUtc;
                        return (
                          <tr key={row._id || row.bookingRef} className="hover:bg-slate-50/80 transition-colors align-top">
                            <td className="py-3.5 pr-3 text-slate-600 whitespace-nowrap">
                              {rowDate ? new Date(rowDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                            </td>
                            <td className="py-3.5 pr-3 text-slate-800">
                              <span className="font-semibold block">{row.serviceTitle || '—'}</span>
                              {row.bookingRef && (
                                <span className="font-mono text-[10px] text-slate-400">{row.bookingRef}</span>
                              )}
                            </td>
                            <td className="py-3.5 pr-3 text-slate-700">{row.studentName || '—'}</td>
                            <td className="py-3.5 pr-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                              {formatINRAmount(row.grossINR)}
                            </td>
                            <td className="py-3.5 pr-3 text-right text-slate-600 whitespace-nowrap">
                              {pendingCapture ? '—' : formatINRAmount(row.gatewayFeeINR)}
                            </td>
                            <td className="py-3.5 pr-3 text-right text-slate-600 whitespace-nowrap">
                              {pendingCapture ? '—' : formatINRAmount(row.gatewayTaxINR)}
                            </td>
                            <td className="py-3.5 pr-3 text-right font-bold text-emerald-700 whitespace-nowrap">
                              {pendingCapture ? '—' : formatINRAmount(row.mentorNetINR)}
                            </td>
                            <td className="py-3.5">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border whitespace-nowrap ${meta.className}`}>
                                {meta.label}
                              </span>
                              {row.settlementStatus === 'ON_HOLD' && row.onHoldUntil && (
                                <span className="block text-[10px] text-slate-500 mt-1 whitespace-nowrap">
                                  Auto-release on {new Date(row.onHoldUntil).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              )}
                              {row.settlementStatus === 'RELEASED' && row.releasedAt && (
                                <span className="block text-[10px] text-slate-500 mt-1 whitespace-nowrap">
                                  Released {new Date(row.releasedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · reaches bank in ~2 days
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Legacy manual payout history (pre-Razorpay Route) — only shown if any exist */}
            {!payoutsLoading && payouts.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                  <span>Past manual payouts (legacy)</span>
                  <span className="text-xs font-normal text-slate-500">({payouts.length} total)</span>
                </h3>
                <div className="divide-y divide-slate-100 overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-slate-400 uppercase font-bold border-b border-slate-100">
                        <th className="pb-3 font-semibold">Reference</th>
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold">Amount</th>
                        <th className="pb-3 font-semibold">Method & Details</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Receipt / Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payouts.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 font-mono font-bold text-indigo-600">
                            {p.payoutRef}
                          </td>
                          <td className="py-3.5 text-slate-600">
                            {new Date(p.createdAt || p.requestedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-3.5 font-bold text-slate-900">
                            ₹{p.amountINR?.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 text-slate-700">
                            <span className="font-semibold">{p.payoutMethod}: </span>
                            <span className="font-mono text-[11px] text-slate-500">
                              {p.payoutMethod === 'UPI' ? p.payoutDetails?.upiId : `${p.payoutDetails?.bankName} (••${p.payoutDetails?.accountNumber?.slice(-4)})`}
                            </span>
                          </td>
                          <td className="py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              p.status === 'PAID'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : p.status === 'REQUESTED' || p.status === 'PROCESSING'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-600">
                            {p.transactionRef ? (
                              <span className="font-mono text-[11px] text-slate-700 font-semibold" title="Bank UTR Reference">
                                UTR: {p.transactionRef}
                              </span>
                            ) : p.adminRemarks ? (
                              <span className="text-[11px] text-slate-500 italic">{p.adminRemarks}</span>
                            ) : (
                              <span className="text-slate-400 italic">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 6: PROFILE & SETTINGS ── */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm max-w-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">Creator Profile & Scheduling Constraints</h3>
            <p className="text-xs text-slate-500 mb-6">Manage how students view your profile and the safety buffer around calls.</p>

            {/* Visual Branding Summary & Shortcut */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-indigo-50/40 border border-slate-200/80 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-14 h-14 rounded-full ring-2 ring-white shadow-sm overflow-hidden bg-gradient-to-tr from-amber-400 to-[#DE5C2B] text-white font-black text-xl flex items-center justify-center flex-shrink-0">
                  {profileForm.avatarUrl ? (
                    <img src={profileForm.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span>{profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'S'}</span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">Storefront Logo & Banner</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {profileForm.avatarUrl ? '✓ Custom logo active' : 'No logo uploaded'} · {profileForm.coverImageUrl ? '✓ Custom banner active' : 'No banner set'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200/80 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Upload Photos</span>
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headline (Role / College)</label>
                <input
                  type="text"
                  placeholder="e.g. MS in CS at TU Munich | Ex-Mercedes"
                  value={profileForm.headline}
                  onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bio / About Me</label>
                <textarea
                  rows="3"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rest Buffer Between Calls (Mins)</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={profileForm.bufferMinutes}
                    onChange={(e) => setProfileForm({ ...profileForm, bufferMinutes: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Notice Required (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="72"
                    value={profileForm.noticePeriodHours}
                    onChange={(e) => setProfileForm({ ...profileForm, noticePeriodHours: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        )}

        {/* ── TAB 7: PROFILE / STOREFRONT CUSTOMIZER ── */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Public Storefront & Profile</h2>
                <p className="text-xs text-slate-500 mt-0.5">Customize how students see your creator storefront, biography, and credentials.</p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`${window.location.origin}/@${mentor?.handle || handle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>View Live Storefront</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Profile Editor Form */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* ════════ STOREFRONT BRANDING: BANNER & AVATAR UPLOAD ════════ */}
                  <div className="space-y-5 pb-6 border-b border-slate-150">
                    {/* Cover Banner Section */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Storefront Cover Banner</span>
                        </label>
                        <span className="text-[11px] text-slate-400 font-medium">Recommended: 1200 × 350 px</span>
                      </div>

                      <div className="relative w-full h-40 sm:h-48 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 group shadow-inner">
                        {profileForm.coverImageUrl ? (
                          <>
                            <img
                              src={profileForm.coverImageUrl}
                              alt="Storefront Banner"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors" />
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-slate-300 p-4 text-center">
                            <ImageIcon className="w-8 h-8 text-indigo-400/80 mb-2" />
                            <p className="text-xs font-bold text-white">No banner image set</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Upload your custom storefront banner or enter an image URL</p>
                          </div>
                        )}

                        {/* Banner Action Buttons */}
                        <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
                          <label
                            htmlFor="banner-file-input"
                            className="px-3.5 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-900 text-xs font-bold shadow-md backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                          >
                            {uploadingBanner ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                            ) : (
                              <Camera className="w-3.5 h-3.5 text-slate-700" />
                            )}
                            <span>{uploadingBanner ? 'Uploading...' : profileForm.coverImageUrl ? 'Change Banner' : 'Upload Banner'}</span>
                          </label>
                          <input
                            id="banner-file-input"
                            type="file"
                            accept="image/*"
                            disabled={uploadingBanner}
                            onChange={handleBannerUpload}
                            className="hidden"
                          />

                          {profileForm.coverImageUrl && (
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto('cover')}
                              className="p-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white shadow-md transition-all cursor-pointer"
                              title="Remove banner"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* URL input fallback */}
                      <div className="mt-2">
                        <input
                          type="url"
                          placeholder="Or paste banner image URL (https://...)"
                          value={profileForm.coverImageUrl}
                          onChange={(e) => setProfileForm({ ...profileForm, coverImageUrl: e.target.value })}
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-slate-900 focus:outline-none bg-slate-50/50 truncate"
                        />
                      </div>
                    </div>

                    {/* Profile Photo / Logo Section */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Profile Photo / Creator Logo</span>
                        </label>
                        <span className="text-[11px] text-slate-400 font-medium">Square 400 × 400 px</span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                        {/* Avatar Circle with Hover Overlay */}
                        <div className="relative w-20 h-20 rounded-full ring-4 ring-white shadow-md overflow-hidden group flex-shrink-0 bg-gradient-to-tr from-amber-400 to-[#DE5C2B] text-white flex items-center justify-center">
                          {profileForm.avatarUrl ? (
                            <img
                              src={profileForm.avatarUrl}
                              alt={profileForm.name || 'Avatar'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-black">{profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'S'}</span>
                          )}

                          <label
                            htmlFor="avatar-file-input"
                            className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white"
                          >
                            <Camera className="w-5 h-5 mb-0.5" />
                            <span className="text-[9px] font-bold">Change</span>
                          </label>
                        </div>

                        {/* Upload Controls & URL fallback */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <label
                              htmlFor="avatar-file-input"
                              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                            >
                              {uploadingAvatar ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                              ) : (
                                <Upload className="w-3.5 h-3.5" />
                              )}
                              <span>{uploadingAvatar ? 'Uploading...' : 'Upload New Photo'}</span>
                            </label>
                            <input
                              id="avatar-file-input"
                              type="file"
                              accept="image/*"
                              disabled={uploadingAvatar}
                              onChange={handleAvatarUpload}
                              className="hidden"
                            />

                            {profileForm.avatarUrl && (
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto('avatar')}
                                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-white text-rose-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove Photo</span>
                              </button>
                            )}
                          </div>

                          <div>
                            <input
                              type="url"
                              placeholder="Or paste profile photo URL (https://...)"
                              value={profileForm.avatarUrl}
                              onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:border-slate-900 focus:outline-none bg-white truncate"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Creator Info Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 pt-1 border-t border-slate-100">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base sm:text-lg font-bold text-slate-900 whitespace-nowrap">{profileForm.name || 'Sagar Punia'}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200/80 shrink-0">
                          Verified Mentor
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">@{mentor?.handle || handle}</p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200/80 text-[11px] text-emerald-700 font-semibold self-start sm:self-auto shrink-0 shadow-2xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>0% Platform Fee Protected</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-slate-900 focus:outline-none"
                        placeholder="Your Name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Storefront URL Handle</label>
                      <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 font-mono">
                        <span>/@</span>
                        <input
                          type="text"
                          disabled
                          value={mentor?.handle || handle}
                          className="bg-transparent text-slate-800 font-bold ml-1 focus:outline-none flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Headline (Role, Company or University) *</label>
                    <input
                      type="text"
                      required
                      value={profileForm.headline}
                      onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-slate-900 focus:outline-none"
                      placeholder="e.g. MS CS at TU Munich | Ex-Mercedes-Benz"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Bio & Mentoring Expertise</label>
                    <textarea
                      rows={4}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-slate-900 focus:outline-none resize-none"
                      placeholder="Tell students about your journey, admits, and how you help with SOPs, admissions, scholarships, and visa..."
                    />
                  </div>

                  {/* Social links: shown as icons on the public storefront */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-0.5">Social Links</label>
                    <p className="text-[11px] text-slate-400 mb-2.5">Shown as icons on your public profile. Paste the full link; leave a box empty to hide it.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {MENTOR_SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
                        <div key={key}>
                          <label htmlFor={`mentor-social-${key}`} className="block text-[11px] font-semibold text-slate-600 mb-1">{label}</label>
                          <input
                            id={`mentor-social-${key}`}
                            type="url"
                            inputMode="url"
                            value={profileForm.socialLinks?.[key] || ''}
                            onChange={(e) => setProfileForm({ ...profileForm, socialLinks: { ...profileForm.socialLinks, [key]: e.target.value } })}
                            onBlur={(e) => {
                              // "linkedin.com/in/me" -> "https://linkedin.com/in/me"
                              const value = e.target.value.trim();
                              if (value && !/^https?:\/\//i.test(value)) {
                                setProfileForm((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: `https://${value}` } }));
                              }
                            }}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-slate-900 focus:outline-none"
                            placeholder={placeholder}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Buffer Between Calls (Minutes)</label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={profileForm.bufferMinutes}
                        onChange={(e) => setProfileForm({ ...profileForm, bufferMinutes: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-slate-900 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Rest gap to prevent back-to-back fatigue</span>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Minimum Notice Required (Hours)</label>
                      <input
                        type="number"
                        min="1"
                        max="72"
                        value={profileForm.noticePeriodHours}
                        onChange={(e) => setProfileForm({ ...profileForm, noticePeriodHours: Number(e.target.value) })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-slate-900 focus:outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">No surprise instant bookings</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Live Mobile Storefront Preview */}
              <div className="lg:col-span-5 bg-gradient-to-b from-slate-100 to-slate-200/60 rounded-3xl p-6 border border-slate-200/80">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-slate-600" />
                    <span className="text-xs font-bold text-slate-700">Live Student Preview</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Mobile Mockup</span>
                </div>

                {/* Mock Phone Frame */}
                <div className="bg-white rounded-2xl border-4 border-slate-900 shadow-xl overflow-hidden max-w-[320px] mx-auto">
                  <div className="bg-slate-900 py-1 flex justify-center">
                    <div className="w-12 h-1 bg-slate-700 rounded-full" />
                  </div>

                  <div className="bg-[#FAF9F6] text-center border-b border-slate-100 overflow-hidden">
                    {/* Mock phone banner */}
                    {profileForm.coverImageUrl ? (
                      <div className="w-full h-20 overflow-hidden">
                        <img src={profileForm.coverImageUrl} alt="Banner" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-full h-14 bg-gradient-to-r from-[#8561E5] via-indigo-600 to-[#DE5C2B]" />
                    )}

                    <div className="p-4 pt-0">
                      {profileForm.avatarUrl ? (
                        <img
                          src={profileForm.avatarUrl}
                          alt="Avatar"
                          className="w-16 h-16 rounded-full object-cover mx-auto shadow-md mb-2 -mt-8 ring-3 ring-white bg-white"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-[#DE5C2B] text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md mb-2 -mt-8 ring-3 ring-white">
                          {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                      )}
                      <h4 className="text-sm font-black text-slate-900">{profileForm.name || 'Sagar Punia'}</h4>
                      <p className="text-[11px] text-slate-500 font-medium line-clamp-2 mt-0.5">
                        {profileForm.headline || 'MS CS at TU Munich | Ex-Mercedes'}
                      </p>
                      <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-bold">
                        <span>● Online · 0% Fee Verified</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-white space-y-2 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available Offerings</span>
                    {services.slice(0, 2).map((svc) => (
                      <div key={svc._id} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-bold text-slate-900 truncate">{svc.title}</p>
                          <p className="text-[10px] text-slate-500 font-medium">₹{svc.priceInINR} · 0% fee</p>
                        </div>
                        <button type="button" className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold flex-shrink-0">
                          Book
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                    <a
                      href={`${window.location.origin}/@${mentor?.handle || handle}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-bold text-[#DE5C2B] hover:underline flex items-center justify-center gap-1"
                    >
                      <span>Open Full Storefront</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 8: INSTAGRAM AUTO DM AUTOMATION ── */}
        {activeTab === 'instagram_dm' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                  <InstagramIcon className="w-6 h-6 text-[#E1306C]" />
                  <span>Instagram Auto DM Automation</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automatically send booking links & free SOP guides when students comment on your Instagram Reels or Posts.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Connected: @{instagramConfig.handle}</span>
                </span>
              </div>
            </div>

            {/* 4 Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Auto DMs Delivered</span>
                <p className="text-2xl font-black text-slate-900 mt-1">142</p>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">↑ 34 this week</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Storefront Link Clicks</span>
                <p className="text-2xl font-black text-slate-900 mt-1">89</p>
                <span className="text-[11px] text-indigo-600 font-semibold mt-1 block">62.6% Click-through</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Paid Bookings Made</span>
                <p className="text-2xl font-black text-slate-900 mt-1">12</p>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">₹5,988 in earnings</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Zero Fee Savings</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">₹898 saved</p>
                <span className="text-[11px] text-slate-400 font-medium mt-1 block">100% money in your pocket</span>
              </div>
            </div>

            {/* Automation Setup & Live DM Simulator */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-2xs space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Auto-Reply Trigger Rule</h3>
                    <p className="text-xs text-slate-500">When anyone comments any keyword on your reels, DM triggers within 5 seconds.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setInstagramConfig(prev => ({ ...prev, autoDmEnabled: !prev.autoDmEnabled }))}
                    className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer flex items-center ${
                      instagramConfig.autoDmEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Comment Trigger Keywords (comma separated)</label>
                  <input
                    type="text"
                    value={instagramConfig.triggerKeywords}
                    onChange={(e) => setInstagramConfig({ ...instagramConfig, triggerKeywords: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:border-slate-900 focus:outline-none"
                    placeholder="IELTS, SOP, ADMIT, VISA, MENTOR"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Any comment containing one of these words will receive the instant DM.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Direct Message (DM) Template</label>
                  <textarea
                    rows={4}
                    value={instagramConfig.replyMessage}
                    onChange={(e) => setInstagramConfig({ ...instagramConfig, replyMessage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-slate-900 focus:outline-none resize-none"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>Use tag <code className="text-indigo-600 font-bold">{"{{storefront_link}}"}</code> for your auto-link</span>
                    <span>Character count: {instagramConfig.replyMessage.length}/500</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setFeedback({ type: 'success', text: 'Instagram Auto DM settings saved and active!' })}
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Save Automation Rules
                </button>
              </div>

              {/* Right Column: Live Instagram DM Preview */}
              <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <InstagramIcon className="w-4 h-4 text-[#E1306C]" />
                    <span className="text-xs font-bold">Student DM Screen</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Direct Message Preview</span>
                </div>

                {/* Simulated Chat Window */}
                <div className="space-y-4 text-xs">
                  <div className="text-center py-2">
                    {profileForm.avatarUrl ? (
                      <img
                        src={profileForm.avatarUrl}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full object-cover mx-auto shadow-sm mb-1 ring-2 ring-white/20"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 to-[#DE5C2B] text-white font-black text-lg flex items-center justify-center mx-auto shadow-sm mb-1">
                        {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : 'S'}
                      </div>
                    )}
                    <p className="font-bold text-white text-xs">{profileForm.name || 'Sagar Punia'}</p>
                    <p className="text-[10px] text-slate-400">Instagram · 12.4k followers</p>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-slate-800 text-slate-200 px-3.5 py-2 rounded-2xl rounded-bl-xs max-w-[80%]">
                      <p className="text-[10px] text-slate-400 mb-0.5">Student commented: "IELTS"</p>
                      <p className="font-semibold text-white">Hey! Can I get the SOP template and book a call?</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <div className="bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white p-3 rounded-2xl rounded-br-xs max-w-[85%] shadow-md">
                      <p className="text-[11px] leading-relaxed">
                        {instagramConfig.replyMessage.replace('{{storefront_link}}', `${window.location.host}/@${mentor?.handle || handle}`)}
                      </p>
                      <span className="text-[9px] text-white/80 mt-1 block text-right">Just now · Automated</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 9: MEMBERSHIPS & SUBSCRIPTIONS ── */}
        {activeTab === 'memberships' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Crown className="w-6 h-6 text-amber-500" />
                  <span>Creator Memberships & Subscriptions</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Build predictable recurring monthly income with private communities, group Q&A calls, and mentorship passes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const name = prompt('Enter Membership Tier Name:');
                  const price = prompt('Enter Monthly Price in INR (e.g. 999):');
                  if (name && price) {
                    setMembershipsList(prev => [
                      ...prev,
                      {
                        id: `tier-${Date.now()}`,
                        name,
                        priceInINR: Number(price),
                        billingCycle: 'MONTHLY',
                        subscribersCount: 0,
                        perks: ['Exclusive monthly mastermind call', 'Priority document reviews']
                      }
                    ]);
                    setFeedback({ type: 'success', text: `Membership tier "${name}" created!` });
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Tier</span>
              </button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Active Subscribers</span>
                <p className="text-2xl font-black text-slate-900 mt-1">20</p>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">100% active renewals</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Monthly Recurring (MRR)</span>
                <p className="text-2xl font-black text-slate-900 mt-1">₹18,982</p>
                <span className="text-[11px] text-indigo-600 font-semibold mt-1 block">Expected on 1st of month</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Platform Commission</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">₹0 (0% Fee)</p>
                <span className="text-[11px] text-slate-400 font-medium mt-1 block">UniCoach takes 0% cut</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-xs font-semibold text-slate-500">Churn Rate</span>
                <p className="text-2xl font-black text-slate-900 mt-1">0.0%</p>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">High student retention</span>
              </div>
            </div>

            {/* Tiers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {membershipsList.map((tier) => (
                <div key={tier.id} className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                        {tier.billingCycle}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {tier.subscribersCount} active subscribers
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-1">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 my-3">
                      <span className="text-3xl font-black text-slate-900">₹{tier.priceInINR.toLocaleString('en-IN')}</span>
                      <span className="text-xs text-slate-400">/ month</span>
                    </div>

                    <div className="space-y-2 mt-4 pt-4 border-t border-slate-100">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Included Perks</span>
                      {tier.perks.map((p, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600">Active on Storefront</span>
                    <button
                      type="button"
                      onClick={() => {
                        const perk = prompt('Add new perk to this tier:');
                        if (perk) {
                          setMembershipsList(prev => prev.map(t => t.id === tier.id ? { ...t, perks: [...t.perks, perk] } : t));
                        }
                      }}
                      className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      + Add Perk
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB 10: SHARE & GROW GROWTH HUB ── */}
        {activeTab === 'share_grow' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Share2 className="w-6 h-6 text-[#DE5C2B]" />
                <span>Share & Grow Your Mentorship</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Custom promotional assets, Instagram Story posters, QR codes, and embed widgets to share with students.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Direct Link & QR Code */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#DE5C2B] flex items-center justify-center font-bold">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Your Storefront Link & QR Code</h3>
                    <p className="text-xs text-slate-400">Put this in your Instagram bio, YouTube descriptions, or WhatsApp</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 font-mono text-xs text-slate-800">
                  <span className="flex-1 truncate">{window.location.origin}/@{mentor?.handle || handle}</span>
                  <button
                    type="button"
                    onClick={() => {
                      handleCopyText(`${window.location.origin}/@${mentor?.handle || handle}`, 'Storefront link copied!');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>

                {/* QR Code Graphic Box */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center overflow-hidden">
                      {qrCodeDataUrl ? (
                        <img src={qrCodeDataUrl} alt="Storefront QR Code" className="w-12 h-12 object-contain" />
                      ) : (
                        <QrCode className="w-10 h-10 text-slate-400 animate-pulse" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Download QR Code</p>
                      <p className="text-[11px] text-slate-400">Scan to visit your live storefront</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveQrCode}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 shadow-2xs cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Save QR</span>
                  </button>
                </div>
              </div>

              {/* 2. Instagram Story Poster Generator */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#E1306C] flex items-center justify-center font-bold">
                    <InstagramIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Instagram Story Poster</h3>
                    <p className="text-xs text-slate-400">Ready-to-share vertical poster formatted for Stories</p>
                  </div>
                </div>

                {/* Poster Mini Preview */}
                <div className="bg-gradient-to-br from-[#FF4E00] to-[#111111] p-5 rounded-2xl text-white text-center shadow-md">
                  {profileForm.avatarUrl ? (
                    <img
                      src={profileForm.avatarUrl}
                      alt="Avatar"
                      className="w-14 h-14 rounded-full object-cover mx-auto mb-2 shadow-sm ring-2 ring-white"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white text-slate-900 font-black text-lg flex items-center justify-center mx-auto mb-2 shadow-sm">
                      {profileForm.name ? profileForm.name.charAt(0).toUpperCase() : (mentor?.name?.charAt(0) || 'S')}
                    </div>
                  )}
                  <p className="font-extrabold text-sm text-white">{profileForm.name || mentor?.name || 'Sagar Punia'}</p>
                  <p className="text-[11px] text-amber-200 font-medium mt-0.5">{profileForm.headline || mentor?.headline || 'Study Abroad Mentor'}</p>
                  <div className="my-2.5 inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black tracking-wider uppercase">
                    Book 1:1 Session · 0% Platform Fee
                  </div>
                  <div className="my-2 flex justify-center">
                    {qrCodeDataUrl ? (
                      <div className="p-1 bg-white rounded-lg shadow-sm">
                        <img src={qrCodeDataUrl} alt="Storefront QR Code" className="w-16 h-16 object-contain" />
                      </div>
                    ) : null}
                  </div>
                  <p className="text-[10px] font-mono text-white/80">{window.location.host}/@{mentor?.handle || handle}</p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadStoryGraphic}
                  disabled={isGeneratingStory}
                  className="w-full py-2.5 rounded-xl bg-[#111111] hover:bg-black disabled:opacity-60 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isGeneratingStory ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Story Graphic...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Story Graphic</span>
                    </>
                  )}
                </button>
              </div>

              {/* 3. Embeddable Website Widget */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#DE5C2B] flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Website & Blog Embed</h3>
                    <p className="text-xs text-slate-400">Embed your booking button into WordPress, Notion, or personal portfolio</p>
                  </div>
                </div>

                <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto">
                  {`<iframe src="${window.location.origin}/@${mentor?.handle || handle}?embed=true" width="100%" height="450" frameborder="0"></iframe>`}
                </pre>

                <button
                  type="button"
                  onClick={() => {
                    handleCopyText(`<iframe src="${window.location.origin}/@${mentor?.handle || handle}?embed=true" width="100%" height="450" frameborder="0"></iframe>`, 'Embed code copied to clipboard!');
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Embed Code</span>
                </button>
              </div>

              {/* 4. WhatsApp Direct Group Share */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">WhatsApp Broadcast & Groups</h3>
                    <p className="text-xs text-slate-400">One-click broadcast to student study abroad groups</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                  "Hey everyone! I'm now taking 1:1 strategy calls and reviewing SOPs directly on UniCoach with 0% platform fee. Book a slot or check free templates here: {window.location.origin}/@{mentor?.handle || handle}"
                </p>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Hey! You can now book a 1:1 mentorship session or get your SOP reviewed with me with 0% platform fee: ${window.location.origin}/@${mentor?.handle || handle}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Share on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 11: ANALYTICS & INSIGHTS ── */}
        {activeTab === 'analytics' && (
          <CreatorAnalyticsChartsView stats={stats} services={services} />
        )}

        {/* ── TAB 12: ANNOUNCEMENTS & ALERTS (ADMIN NOTIFICATIONS) ── */}
        {activeTab === 'notifications' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Notification Center Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#FFF7ED] text-[#DE5C2B] flex items-center justify-center font-bold shadow-xs">
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        Announcements & Alerts
                      </h2>
                      {unreadNotificationsCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#DE5C2B] text-white">
                          {unreadNotificationsCount} New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Direct broadcasts, policy updates, and payout advisories from the UniCoach Admin Team.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => loadNotifications(handle)}
                    disabled={notificationsLoading}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    title="Refresh Notifications"
                  >
                    <ArrowUpDown className={`w-3.5 h-3.5 ${notificationsLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Refresh</span>
                  </button>
                  {unreadNotificationsCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllNotificationsRead}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark all as read</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Pills - Responsive Wrapped Without Scroller */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-4 mt-4 border-t border-slate-100">
                {[
                  { id: 'ALL', label: 'All', count: notifications.length },
                  { id: 'UNREAD', label: 'Unread', count: unreadNotificationsCount },
                  { id: 'URGENT', label: '🚨 Urgent', count: notifications.filter(n => n.priority === 'URGENT' || n.category === 'URGENT').length },
                  { id: 'PAYOUT', label: '💰 Payouts', count: notifications.filter(n => n.category === 'PAYOUT').length },
                  { id: 'ANNOUNCEMENT', label: '📢 Announcements', count: notifications.filter(n => n.category === 'ANNOUNCEMENT').length },
                  { id: 'SYSTEM', label: '⚙️ System', count: notifications.filter(n => n.category === 'SYSTEM').length }
                ].map(filter => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setNotificationFilter(filter.id)}
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      notificationFilter === filter.id
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    <span>{filter.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      notificationFilter === filter.id ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                    }`}>
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications List */}
            {notificationsLoading && notifications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-2xs">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#DE5C2B] mb-2" />
                <p className="text-xs text-slate-500 font-medium">Checking for latest announcements...</p>
              </div>
            ) : (() => {
              const filteredList = notifications.filter(n => {
                if (notificationFilter === 'UNREAD') return !n.isRead;
                if (notificationFilter === 'URGENT') return n.priority === 'URGENT' || n.category === 'URGENT';
                if (notificationFilter === 'PAYOUT') return n.category === 'PAYOUT';
                if (notificationFilter === 'ANNOUNCEMENT') return n.category === 'ANNOUNCEMENT';
                if (notificationFilter === 'SYSTEM') return n.category === 'SYSTEM';
                return true;
              });

              if (filteredList.length === 0) {
                return (
                  <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-2xs">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">No notifications to show</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      {notificationFilter === 'UNREAD' 
                        ? "You're all caught up! No unread messages." 
                        : "No announcements found matching this category."}
                    </p>
                  </div>
                );
              }

              return (
                <div className="space-y-3.5">
                  {filteredList.map((item) => {
                    const isUrgent = item.priority === 'URGENT' || item.category === 'URGENT';
                    const isPayout = item.category === 'PAYOUT';
                    const isSystem = item.category === 'SYSTEM';

                    let badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                    let categoryLabel = '📢 Platform Announcement';
                    if (isUrgent) {
                      badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                      categoryLabel = '🚨 Urgent Alert';
                    } else if (isPayout) {
                      badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                      categoryLabel = '💰 Payout Update';
                    } else if (isSystem) {
                      badgeColor = 'bg-purple-50 text-purple-700 border-purple-200';
                      categoryLabel = '⚙️ System Notice';
                    }

                    return (
                      <div
                        key={item._id}
                        className={`rounded-2xl border transition-all p-5 shadow-2xs relative ${
                          !item.isRead
                            ? 'bg-gradient-to-r from-orange-50/40 via-white to-white border-orange-200 shadow-xs'
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        {/* Unread dot indicator */}
                        {!item.isRead && (
                          <div className="absolute top-5 right-5 flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#DE5C2B] animate-pulse" />
                            <span className="text-[10px] font-bold text-[#DE5C2B] uppercase tracking-wider">Unread</span>
                          </div>
                        )}

                        <div className="flex flex-col gap-3">
                          {/* Top metadata tags */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${badgeColor}`}>
                              {categoryLabel}
                            </span>

                            {item.priority === 'URGENT' && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white">
                                CRITICAL
                              </span>
                            )}
                            {item.priority === 'HIGH' && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white">
                                High Priority
                              </span>
                            )}

                            {item.targetType === 'ALL' ? (
                              <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                                <span>•</span> Broadcast to All Creators
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                                <span>•</span> Direct Notice to You
                              </span>
                            )}

                            <span className="text-[11px] text-slate-400">
                              • {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className={`text-base font-bold text-slate-900 ${!item.isRead ? 'text-slate-950' : ''}`}>
                            {item.title}
                          </h3>

                          {/* Message Body */}
                          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                            {item.message}
                          </div>

                          {/* Action Footer */}
                          <div className="pt-3 mt-1 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                              {item.actionLink && (
                                <a
                                  href={item.actionLink.startsWith('http') || item.actionLink.startsWith('/') ? item.actionLink : `https://${item.actionLink}`}
                                  target={item.actionLink.startsWith('/') ? '_self' : '_blank'}
                                  rel="noreferrer"
                                  onClick={() => {
                                    if (!item.isRead) handleMarkNotificationRead(item._id);
                                  }}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF7ED] text-[#DE5C2B] hover:bg-[#FFEDD5] text-xs font-bold transition-all cursor-pointer"
                                >
                                  <span>{item.actionText || 'Take Action'}</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              <span className="text-[11px] text-slate-400 font-medium">
                                Sender: <strong className="text-slate-600">{item.senderAdmin || 'UniCoach Admin Team'}</strong>
                              </span>
                            </div>

                            <div>
                              {!item.isRead ? (
                                <button
                                  type="button"
                                  onClick={() => handleMarkNotificationRead(item._id)}
                                  className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Check className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Mark as read</span>
                                </button>
                              ) : (
                                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Read</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* ── CREATE SERVICE MODAL (Redesigned & Responsive) ── */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200/80 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Sticky Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-50 border border-orange-200/80 text-[#DE5C2B] flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">Add New Mentorship Offering</h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium">Create 1:1 sessions, audit packages, or digital products</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateService} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3.5 sm:py-4 space-y-3 sm:space-y-3.5">
                {/* Visual Service Format Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Service Format</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { type: 'ONE_ON_ONE', icon: Video, title: '1:1 Video Session', desc: 'Live Video Call' },
                      { type: 'SOP_REVIEW', icon: FileText, title: 'SOP & Resume Audit', desc: 'Written Feedback' },
                      { type: 'PRIORITY_DM', icon: MessageSquare, title: 'Priority DM Query', desc: 'Direct Text Q&A' },
                      { type: 'DIGITAL_ASSET', icon: Download, title: 'Digital Resource', desc: 'Instant PDF / File' }
                    ].map(opt => {
                      const Icon = opt.icon;
                      const isSel = newService.type === opt.type;
                      return (
                        <button
                          key={opt.type}
                          type="button"
                          onClick={() => setNewService({ ...newService, type: opt.type })}
                          className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                            isSel
                              ? 'bg-orange-50/80 border-[#DE5C2B] ring-2 ring-[#DE5C2B]/20 shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200/80 text-slate-700'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSel ? 'bg-[#DE5C2B] text-white shadow-xs' : 'bg-white text-slate-500 border border-slate-200'
                          }`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className={`text-[11px] sm:text-xs font-bold block leading-tight ${isSel ? 'text-slate-900' : 'text-slate-800'}`}>
                              {opt.title}
                            </span>
                            <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">
                              {opt.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Service Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. 1:1 Admission & Visa Strategy Consultation"
                    required
                    value={newService.title}
                    onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/20 focus:border-[#DE5C2B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description (What student gets)</label>
                  <textarea
                    rows="2"
                    placeholder="Brief overview of what you will cover in this session, topics discussed, prep checklist, etc."
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/20 focus:border-[#DE5C2B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹ INR) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs sm:text-sm">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        required
                        value={newService.priceInINR}
                        onChange={(e) => setNewService({ ...newService, priceInINR: Number(e.target.value) })}
                        className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/20 focus:border-[#DE5C2B]"
                      />
                    </div>
                  </div>

                  {newService.type === 'ONE_ON_ONE' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Mins)</label>
                      <select
                        value={newService.durationMinutes}
                        onChange={(e) => setNewService({ ...newService, durationMinutes: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/20"
                      >
                        <option value={15}>15 Mins</option>
                        <option value={30}>30 Mins (Recommended)</option>
                        <option value={45}>45 Mins</option>
                        <option value={60}>60 Mins</option>
                      </select>
                    </div>
                  )}

                  {newService.type === 'PRIORITY_DM' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Guaranteed Reply SLA</label>
                      <select
                        value={newService.maxDeliveryHours || 48}
                        onChange={(e) => setNewService({ ...newService, maxDeliveryHours: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
                      >
                        <option value={24}>24 Hours (Fast)</option>
                        <option value={48}>48 Hours (Standard)</option>
                        <option value={72}>72 Hours</option>
                      </select>
                    </div>
                  )}

                  {newService.type === 'ONE_ON_ONE' && (
                    <div className="col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-700">Package Offering</label>
                        <span className="text-[10px] text-slate-400">Allow students to purchase multiple sessions</span>
                      </div>
                      <select
                        value={newService.bundleCount || 1}
                        onChange={(e) => setNewService({ ...newService, bundleCount: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
                      >
                        <option value={1}>Single 1:1 Session</option>
                        <option value={3}>3 Sessions Package Bundle (Recommended)</option>
                        <option value={5}>5 Sessions Comprehensive Bundle</option>
                      </select>
                    </div>
                  )}

                  {newService.type === 'DIGITAL_ASSET' && (
                    <div className="col-span-2 pt-2 border-t border-slate-100 space-y-2">
                      <label className="block text-xs font-semibold text-slate-700">Digital Resource / File Delivery</label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <label className="flex-1 border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-2.5 text-center cursor-pointer transition-colors">
                          <input
                            type="file"
                            accept=".pdf,.zip,.doc,.docx,.epub,.txt"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Download className="w-4 h-4 mx-auto text-slate-400 mb-0.5" />
                          <span className="text-xs font-semibold text-slate-700 block">
                            {resourceUploadLoading ? 'Uploading...' : 'Upload File (PDF/ZIP)'}
                          </span>
                          <span className="text-[10px] text-slate-400">Zero-cost local hosting</span>
                        </label>

                        <div className="flex-1">
                          <span className="text-[11px] font-semibold text-slate-600 block mb-1">Or External Resource Link:</span>
                          <input
                            type="url"
                            placeholder="https://drive.google.com/... or Notion"
                            value={newService.digitalAsset?.resourceLink || ''}
                            onChange={(e) => setNewService({
                              ...newService,
                              digitalAsset: {
                                ...newService.digitalAsset,
                                resourceLink: e.target.value,
                                fileUrl: e.target.value,
                                fileName: newService.digitalAsset?.fileName || newService.title || 'Resource Link'
                              }
                            })}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                          />
                        </div>
                      </div>

                      {uploadedAsset && (
                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
                          <span className="truncate max-w-[240px] font-medium">{uploadedAsset.fileName} ({uploadedAsset.fileSize})</span>
                          <span className="text-[10px] font-bold uppercase bg-emerald-200 px-2 py-0.5 rounded">Ready</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Collapsible Intake Questions Config */}
                <div className="pt-2.5 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowIntakeQuestionsConfig(!showIntakeQuestionsConfig)}
                      className="text-xs font-semibold text-slate-700 hover:text-[#DE5C2B] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Intake Questions</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        newService.customQuestions.length > 0 ? 'bg-orange-100 text-[#DE5C2B]' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {newService.customQuestions.length}
                      </span>
                      {showIntakeQuestionsConfig ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowIntakeQuestionsConfig(true);
                        handleAddQuestion();
                      }}
                      className="text-[11px] font-bold text-[#DE5C2B] hover:text-[#c2410c] flex items-center gap-1 py-1 px-2 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Question</span>
                    </button>
                  </div>

                  {showIntakeQuestionsConfig && (
                    <div className="mt-2.5 space-y-2 animate-in fade-in duration-150">
                      <p className="text-[10px] text-slate-400">
                        Collect answers from students before checkout (e.g. Target Country, CGPA, Drive link).
                      </p>
                      {newService.customQuestions.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic py-1">
                          No questions added yet. Click "+ Add Question" above.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {newService.customQuestions.map((q, idx) => (
                            <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase text-slate-400">
                                  Question #{idx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQuestion(idx)}
                                  className="text-slate-400 hover:text-rose-600 p-0.5 cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <input
                                type="text"
                                placeholder="e.g. What is your Target Country & Degree?"
                                required
                                value={q.questionText}
                                onChange={(e) => handleQuestionChange(idx, 'questionText', e.target.value)}
                                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:border-[#DE5C2B]"
                              />

                              <div className="flex items-center justify-between text-xs">
                                <select
                                  value={q.type}
                                  onChange={(e) => handleQuestionChange(idx, 'type', e.target.value)}
                                  className="px-2 py-1 rounded-lg border border-slate-200 text-[11px] bg-white"
                                >
                                  <option value="TEXT">Short Text</option>
                                  <option value="TEXTAREA">Long Paragraph</option>
                                  <option value="URL">Link (Google Drive / Resume)</option>
                                </select>

                                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600">
                                  <input
                                    type="checkbox"
                                    checked={q.required}
                                    onChange={(e) => handleQuestionChange(idx, 'required', e.target.checked)}
                                    className="rounded text-[#DE5C2B] focus:ring-[#DE5C2B]"
                                  />
                                  <span>Required</span>
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-[#0F172A] hover:bg-[#DE5C2B] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
                  <span>Save &amp; Publish Service</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE COUPON MODAL (UniCoach Feature) ── */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Tag className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Create Promo Code</h3>
              </div>
              <button type="button" onClick={() => setIsCouponModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Coupon Code *
                </label>
                <input
                  type="text"
                  placeholder="e.g. EARLY20 or SPECIAL50"
                  required
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    <option value="PERCENTAGE">Percentage (% Off)</option>
                    <option value="FLAT">Flat Amount (₹ INR Off)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {newCoupon.discountType === 'PERCENTAGE' ? 'Discount Percentage (%) *' : 'Discount Amount (₹ INR) *'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={newCoupon.discountType === 'PERCENTAGE' ? '100' : '100000'}
                    required
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Max Allowed Uses (0 = Unlimited)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newCoupon.maxUses}
                    onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expiry Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newCoupon.expiresAt}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full mt-2 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create & Activate Promo Code'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── SHARE PROFILE MODAL (UniCoach Feature) ── */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Share Your Mentor Profile</h3>
                <p className="text-xs text-slate-500">Reach students on WhatsApp, LinkedIn, or social bio</p>
              </div>
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">Your Public Booking URL</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/@${mentor?.handle || handle}`}
                  className="flex-1 bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-semibold"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/@${mentor?.handle || handle}`);
                    setFeedback({ type: 'success', text: 'Profile link copied to clipboard!' });
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-[#DE5C2B] text-white text-xs font-bold flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-bold">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Hey! You can book a 1:1 study abroad consultation, SOP review, or ask questions directly with me on my UniCoach profile: ${window.location.origin}/@${mentor?.handle || handle}`)}`}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${window.location.origin}/@${mentor?.handle || handle}`)}`}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-orange-50 hover:bg-orange-100 text-[#DE5C2B] border border-orange-200 flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 className="w-4 h-4 text-[#DE5C2B]" />
                <span>LinkedIn</span>
              </a>
            </div>

            <div className="pt-2 text-center">
              <a
                href={`${window.location.origin}/@${mentor?.handle || handle}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-[#DE5C2B] hover:underline inline-flex items-center gap-1"
              >
                <span>Open public page in new tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT SERVICE & PRICING MODAL ── */}
      {isEditServiceModalOpen && editingService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 max-w-lg w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Sticky Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-3.5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200/80 text-[#DE5C2B] flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">Edit Offering &amp; Pricing</h3>
                  <p className="text-[11px] sm:text-xs text-slate-500">Update what students see and what they pay in ₹</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditServiceModalOpen(false);
                  setEditingService(null);
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveEditedService} className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-3.5 sm:py-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Service Title *</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#DE5C2B]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Description &amp; Scope</label>
                  <textarea
                    rows={2}
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs sm:text-sm resize-none focus:outline-none focus:border-[#DE5C2B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Price in ₹ (INR) *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs sm:text-sm">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="50"
                        value={editForm.priceInINR}
                        onChange={(e) => setEditForm({ ...editForm, priceInINR: Math.max(0, Number(e.target.value)) })}
                        className="w-full pl-7 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-extrabold text-slate-900"
                        required
                      />
                    </div>
                  </div>

                  {editingService.type === 'ONE_ON_ONE' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Call Duration (Minutes)</label>
                      <select
                        value={editForm.durationMinutes}
                        onChange={(e) => setEditForm({ ...editForm, durationMinutes: Number(e.target.value) })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white"
                      >
                        <option value={15}>15 Minutes</option>
                        <option value={30}>30 Minutes</option>
                        <option value={45}>45 Minutes</option>
                        <option value={60}>60 Minutes</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="px-4 sm:px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditServiceModalOpen(false);
                    setEditingService(null);
                  }}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-[#DE5C2B] text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{actionLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ FLOATING BOTTOM-RIGHT WIDGETS (Enhance Profile) ═══ */}
      <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2">
        {/* Enhance Profile Pill Button */}
        <button
          type="button"
          onClick={() => setIsEnhanceModalOpen(true)}
          className="bg-gradient-to-r from-[#5856D6] to-[#4338CA] hover:from-[#4F46E5] hover:to-[#3730A3] text-white px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-full text-[11px] sm:text-xs font-bold shadow-xl flex items-center gap-1.5 sm:gap-2.5 transition-all hover:scale-105 active:scale-95 cursor-pointer relative border border-white/20"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{pendingCount > 0 ? 'Enhance Profile' : 'All-Star Profile'}</span>
          {pendingCount > 0 ? (
            <span className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-rose-500 text-white text-[9px] sm:text-[10px] font-black flex items-center justify-center shadow-xs">
              {pendingCount}
            </span>
          ) : (
            <span className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-emerald-500 text-white text-[9px] sm:text-[10px] font-black flex items-center justify-center shadow-xs">
              ✓
            </span>
          )}
        </button>
      </div>

      {/* ═══ ENHANCE PROFILE CHECKLIST MODAL ═══ */}
      {isEnhanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full p-4 sm:p-7 shadow-2xl space-y-4 sm:space-y-5 border border-slate-100 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200/80 whitespace-nowrap">
                    Profile Optimization
                  </span>
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
                    {pendingCount === 0 ? '🎉 All tasks completed' : `${pendingCount} action${pendingCount > 1 ? 's' : ''} remaining`}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-1.5 tracking-tight">
                  Enhance Your Creator Profile
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Complete these steps to rank higher on UniCoach, earn verified mentor status, and convert 3x more visitors into bookings.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsEnhanceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Health Score Progress Bar */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-white border border-indigo-100 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-indigo-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Profile Strength Score</span>
                </span>
                <span className="text-indigo-700 font-black text-sm">
                  {profileCompletionPct}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-indigo-100/80 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-600 to-[#DE5C2B] rounded-full transition-all duration-500"
                  style={{ width: `${profileCompletionPct}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {profileCompletionPct === 100
                  ? 'Your profile is 100% complete! You are qualified for featured homepage placement.'
                  : `Complete ${pendingCount} more step${pendingCount > 1 ? 's' : ''} to unlock All-Star mentor badge and top student search rankings.`}
              </p>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2.5 sm:space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Action Checklist
              </h4>

              {profileChecklist.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.isDone
                      ? 'bg-slate-50/70 border-slate-200/60 opacity-80'
                      : 'bg-white border-indigo-200/90 shadow-2xs hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <div className="mt-0.5 flex-shrink-0">
                      {item.isDone ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-indigo-400 flex items-center justify-center" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span className={`text-xs font-bold ${item.isDone ? 'text-slate-600 line-through' : 'text-slate-900'}`}>
                          {item.title}
                        </span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 whitespace-nowrap">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-shrink-0 items-center justify-end pl-7 sm:pl-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {item.isDone ? (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        ✓ Done
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEnhanceModalOpen(false);
                          item.onAction();
                        }}
                        className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>{item.actionLabel}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400 text-center sm:text-left">
                Changes sync live to your public link
              </span>
              <button
                type="button"
                onClick={() => setIsEnhanceModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ INSTAGRAM AUTO DM MODAL ═══ */}
      {isInstagramModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center">
                  <InstagramIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Instagram Auto DM</h3>
                  <p className="text-[11px] text-slate-500">Auto-reply to comments with your booking link</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsInstagramModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs text-slate-600">
              <p className="font-semibold text-slate-900">How it works:</p>
              <p>1. When anyone comments on your Instagram posts (e.g. "mentor", "book", "guide"), UniCoach Auto-DM instantly messages them.</p>
              <p>2. Sends your direct booking link with <strong>0% platform commission</strong> so you keep 100% of all earnings.</p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">Your Instagram Handle</label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">@</span>
                <input
                  type="text"
                  placeholder="your_insta_handle"
                  defaultValue={mentor?.handle || handle}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:border-[#DE5C2B]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsInstagramModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsInstagramModalOpen(false);
                  setFeedback({ type: 'success', text: 'Instagram Auto DM integration activated! Auto replies enabled.' });
                }}
                className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Connect Instagram
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ REFERRAL PROGRAM MODAL ═══ */}
      {isReferralModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#F4511E] text-white flex items-center justify-center font-black">
                  ₹
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Creator Referral Program</h3>
                  <p className="text-[11px] text-slate-500">Earn rewards for inviting mentors</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReferralModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 text-xs text-orange-950 space-y-1.5">
              <p className="font-bold">Share your creator invite link</p>
              <p className="text-[11px] text-orange-800">
                When another mentor signs up and publishes their first service on UniCoach, you get referral perks and priority promotion on the marketplace!
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Referral Link</label>
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-2 border border-slate-200">
                <span className="text-xs font-mono font-bold text-slate-800 flex-1 truncate px-2">
                  {window.location.origin}/join?ref={mentor?.handle || handle}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/join?ref=${mentor?.handle || handle}`);
                    setFeedback({ type: 'success', text: 'Referral link copied! Share it with creators.' });
                    setIsReferralModalOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-[#DE5C2B] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsReferralModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT / CUSTOM MEETING LINK MODAL ── */}
      {editingMeetingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-2xs">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Meeting Link</h3>
                  <p className="text-[11px] text-slate-400">Google Meet, Zoom, or Teams URL</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => setEditingMeetingBooking(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomMeeting} className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{editingMeetingBooking.studentName}</span>
                  <span className="font-mono text-[11px] text-slate-400">{editingMeetingBooking.bookingRef}</span>
                </div>
                <p className="text-slate-600">{editingMeetingBooking.serviceId?.title || '1:1 Mentorship Session'}</p>
                {editingMeetingBooking.startUtc && (
                  <p className="text-indigo-600 font-semibold pt-0.5">
                    📅 {new Date(editingMeetingBooking.startUtc).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Meeting URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://meet.google.com/xxx-yyyy-zzz or https://zoom.us/j/..."
                  value={customMeetingUrl}
                  onChange={(e) => setCustomMeetingUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Paste your permanent Google Meet, personal Zoom invite, or MS Teams link.
                </p>
              </div>

              <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
                💡 <strong>Next Step:</strong> After saving, click <strong>"Email Invite"</strong> on the booking card to instantly email the new link to <strong>{editingMeetingBooking.studentEmail}</strong>.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMeetingBooking(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMeetingUrl || !customMeetingUrl.trim()}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {savingMeetingUrl ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Meeting Link</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══ CONFIGURE BANK & PAYOUT DETAILS MODAL ═══ */}
      {isBankDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#DE5C2B] flex items-center justify-center font-bold">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Bank & Payout Details</h3>
                  <p className="text-xs text-slate-500">Your earnings are paid out to this bank account automatically</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBankDetailsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
              <span className="font-bold text-slate-900 block mb-1">How payouts work</span>
              Every paid booking is split automatically by Razorpay. UniCoach charges <strong>0% commission</strong> — only Razorpay's payment fee (~2% + GST) is deducted.
              Your share is held until the session is completed, then settled by Razorpay straight to this bank account (usually within 2 working days).
              Razorpay needs your PAN and address to verify your payout account.
            </div>

            <form onSubmit={handleSaveBankDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  placeholder="Name as on bank passbook / statement"
                  value={bankForm.accountHolderName}
                  onChange={(e) => setBankForm(p => ({ ...p, accountHolderName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/20 focus:border-[#DE5C2B]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank Account Number *
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    placeholder="9 to 18 digits"
                    value={bankForm.accountNumber}
                    onChange={(e) => setBankForm(p => ({ ...p, accountNumber: e.target.value.replace(/\D/g, '') }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/20 focus:border-[#DE5C2B]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Account Number *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Re-enter account number"
                    value={bankForm.confirmAccountNumber}
                    onChange={(e) => setBankForm(p => ({ ...p, confirmAccountNumber: e.target.value.replace(/\D/g, '') }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/20 focus:border-[#DE5C2B]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC0001234"
                    maxLength={11}
                    value={bankForm.ifscCode}
                    onChange={(e) => setBankForm(p => ({ ...p, ifscCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/20 focus:border-[#DE5C2B]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. HDFC Bank, SBI, ICICI"
                    value={bankForm.bankName}
                    onChange={(e) => setBankForm(p => ({ ...p, bankName: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/20 focus:border-[#DE5C2B]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  Verification details (for Razorpay)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      PAN *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ABCDE1234F"
                      maxLength={10}
                      value={bankForm.pan}
                      onChange={(e) => setBankForm(p => ({ ...p, pan: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/20 focus:border-[#DE5C2B]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={bankForm.phone}
                      onChange={(e) => setBankForm(p => ({ ...p, phone: e.target.value.replace(/[^\d+]/g, '') }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/20 focus:border-[#DE5C2B]"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  placeholder="House / flat no., street"
                  value={bankForm.addressLine1}
                  onChange={(e) => setBankForm(p => ({ ...p, addressLine1: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/20 focus:border-[#DE5C2B]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Address Line 2
                </label>
                <input
                  type="text"
                  placeholder="Area, landmark (optional)"
                  value={bankForm.addressLine2}
                  onChange={(e) => setBankForm(p => ({ ...p, addressLine2: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/20 focus:border-[#DE5C2B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="City"
                    value={bankForm.city}
                    onChange={(e) => setBankForm(p => ({ ...p, city: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/20 focus:border-[#DE5C2B]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State *
                  </label>
                  <select
                    value={bankForm.state}
                    onChange={(e) => setBankForm(p => ({ ...p, state: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/20 focus:border-[#DE5C2B]"
                    required
                  >
                    <option value="">Select state</option>
                    {bankForm.state && !INDIAN_STATES_AND_UTS.includes(bankForm.state) && (
                      <option value={bankForm.state}>{bankForm.state}</option>
                    )}
                    {INDIAN_STATES_AND_UTS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="6 digits"
                    maxLength={6}
                    value={bankForm.postalCode}
                    onChange={(e) => setBankForm(p => ({ ...p, postalCode: e.target.value.replace(/\D/g, '') }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#DE5C2B]/20 focus:border-[#DE5C2B]"
                    required
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Payouts go to bank accounts only — UPI IDs can't receive automatic payouts.
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBankDetailsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingBankDetails}
                  className="px-5 py-2.5 rounded-xl bg-[#DE5C2B] hover:bg-[#c94f24] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {savingBankDetails ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Details...</span>
                    </>
                  ) : (
                    <span>Save Bank Details</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};

export default UnicoachDashboardPage;

