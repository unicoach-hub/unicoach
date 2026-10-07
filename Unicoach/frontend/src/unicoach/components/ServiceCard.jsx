import { ArrowRight } from 'lucide-react';

const CATEGORY_LABELS = {
  ONE_ON_ONE: '1:1 Video Call',
  SOP_REVIEW: 'SOP & Resume Audit',
  PRIORITY_DM: 'Priority DM',
  DIGITAL_ASSET: 'Digital Product'
};

/**
 * ServiceCard
 * Clean, modern card matching UniCoach Storefront design
 */
const ServiceCard = ({ service, isSelected, onSelect }) => {
  const categoryLabel = CATEGORY_LABELS[service.type] || service.category || 'Digital Product';
  const originalPrice = service.originalPriceINR || (service.priceInINR > 0 ? Math.round(service.priceInINR * 1.3) : null);

  return (
    <div
      onClick={() => onSelect(service)}
      className={`group relative bg-white rounded-3xl p-6 transition-all duration-200 cursor-pointer border text-left flex flex-col justify-between min-h-[190px] sm:min-h-[200px] ${
        isSelected
          ? 'border-[#DE5C2B] ring-2 ring-[#DE5C2B]/20 shadow-md'
          : 'border-slate-100 hover:border-slate-300/80 hover:shadow-lg hover:-translate-y-0.5 shadow-sm'
      }`}
    >
      {/* Top Details */}
      <div>
        {/* Category Label (Image 1: small muted text e.g. "Digital Product") */}
        <span className="text-xs font-semibold text-slate-500 block mb-2">
          {categoryLabel}
        </span>

        {/* Title */}
        <h3 className="font-outfit text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-[#DE5C2B] transition-colors mb-1.5">
          {service.title}
        </h3>

        {/* Description / Subtitle */}
        {service.description && (
          <p className="text-xs sm:text-[13px] text-slate-600 line-clamp-2 leading-relaxed">
            {service.description}
          </p>
        )}
      </div>

      {/* Bottom Row: Price & Circular Action Arrow Button */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100/80">
        <div className="flex items-baseline gap-1.5">
          <span className="font-outfit text-lg sm:text-xl font-black text-slate-900">
            ₹{service.priceInINR?.toLocaleString('en-IN') || '0'}
          </span>
          {originalPrice && originalPrice > service.priceInINR && (
            <span className="text-xs font-semibold text-slate-400 line-through">
              ₹{originalPrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>

        {/* Black Circular Action Button with Arrow (Image 1) */}
        <div className="w-9 h-9 rounded-full bg-slate-900 group-hover:bg-[#DE5C2B] text-white flex items-center justify-center transition-all shadow-sm group-hover:scale-105 flex-shrink-0">
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
