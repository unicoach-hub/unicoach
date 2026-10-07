import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  { value: 250, suffix: 'k+', label: 'Students Counselled', prefix: '' },
  { value: 15,  suffix: 'k',  label: 'Visa Applications',   prefix: '' },
  { value: 1000, suffix: '+', label: 'Scholarships Secured', prefix: '₹', postfix: ' Cr' },
  { value: 98,    suffix: '%', label: 'Visa Success Rate',   prefix: '' },
];

const CountUp = ({ target, suffix = '', prefix = '', postfix = '' }) => {
  const display = target.toLocaleString('en-IN');

  return (
    <span>
      {prefix}{display}{postfix}{suffix}
    </span>
  );
};

const Stats = () => (
  <section className="py-24 relative overflow-hidden"
    style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)' }}>

    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
          Numbers That Speak For Themselves
        </h2>
        <p className="text-indigo-100 text-sm md:text-base">
          We don't just guide — we deliver results, year after year.
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            className="rounded-2xl p-8 text-center flex flex-col justify-center min-h-[200px]"
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(12px)', 
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
            }}
          >
            <p className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2 drop-shadow-sm">
              <CountUp
                target={stat.value}
                suffix={stat.suffix}
                prefix={stat.prefix}
                postfix={stat.postfix}
              />
            </p>
            <p className="text-white/80 text-sm font-semibold">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default Stats;
