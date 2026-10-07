// ════════════════════════════════════════════════════════════════════════════════
// MentorTestimonialSection.jsx — Mentor testimonials (original copy)
// Used on /unicoach/for-mentors
// ════════════════════════════════════════════════════════════════════════════════

import { motion } from 'framer-motion';

const TESTIMONIALS = [
  {
    quote: 'Love the integrations with Calendar, Zoom and WhatsApp. Makes my life easier!',
    name: 'Aishwarya Srinivasan',
    role: 'LinkedIn Top Voice',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&auto=format&fit=crop&q=80'
  },
  {
    quote: 'The entire experience is just so seamless. My followers love it',
    name: 'Joerg Storm',
    role: '300K on LinkedIn',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80'
  },
  {
    quote: 'UniCoach is my go-to platform for scheduling 1:1 sessions and hosting webinars!',
    name: 'Xinran Waibel',
    role: 'Founder of Data Engineer Things',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&auto=format&fit=crop&q=80'
  },
  {
    quote: 'All my monetisation now happens in one place. Zero friction, zero headache.',
    name: 'Siddharth Dayani',
    role: 'VP of Growth & Mentor',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80'
  },
  {
    quote: 'The team is extremely helpful and cares a lot about feedback. They keep rolling out new features too!',
    name: 'Anshuman Sharma',
    role: 'Engineering Director',
    image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=160&auto=format&fit=crop&q=80'
  },
  {
    quote: 'I love UniCoach! It has made it seamless to schedule mentoring sessions! Big fan of UniCoach\'s WhatsApp integration.',
    name: 'Pooja Dutt',
    role: 'Principal Cloud Architect',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&auto=format&fit=crop&q=80'
  }
];

export const MentorTestimonialSection = () => {
  return (
    <section className="bg-[#182B30] text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-12 relative overflow-hidden select-none">
      
      {/* Background glow highlights */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-teal-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1340px] mx-auto relative z-10 text-center">
        
        {/* Title */}
        <h2 className="font-outfit text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-14 sm:mb-16">
          Don&apos;t Just Take Our Word for It
        </h2>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7 text-left">
          {TESTIMONIALS.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="bg-[#F1F4F5] rounded-[32px] p-7 sm:p-8 flex flex-col justify-between min-h-[220px] sm:min-h-[240px] shadow-xl hover:shadow-2xl transition-all"
            >
              {/* Top Quote Content */}
              <div>
                <span className="text-4xl sm:text-5xl font-serif text-slate-300 block leading-none mb-3">
                  &ldquo;
                </span>
                <p className="text-slate-900 text-sm sm:text-base font-semibold leading-relaxed">
                  {item.quote}
                </p>
              </div>

              {/* Author Footer */}
              <div className="flex items-center gap-3 pt-6 mt-4 border-t border-slate-200/60">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-xs"
                />
                <div>
                  <div className="font-outfit text-sm font-bold text-slate-950 leading-tight">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {item.role}
                  </div>
                </div>
              </div>

            </motion.div>
          ))}
        </div>

      </div>

    </section>
  );
};
