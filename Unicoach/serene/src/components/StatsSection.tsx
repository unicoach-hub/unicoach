import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { value: 250, suffix: 'k+', label: 'Students Counselled', prefix: '' },
  { value: 15, suffix: 'k', label: 'Visa Applications', prefix: '' },
  { value: 1000, suffix: '+', label: 'Scholarships Secured', prefix: '₹', postfix: ' Cr' },
  { value: 98, suffix: '%', label: 'Visa Success Rate', prefix: '' },
];

const CountUp: React.FC<{ target: number; suffix: string; prefix?: string; postfix?: string; duration?: number }> = ({
  target,
  suffix,
  prefix = '',
  postfix = '',
}) => {
  const display = target.toLocaleString('en-IN');

  return (
    <span>
      {prefix}
      {display}
      {postfix}
      {suffix}
    </span>
  );
};

export const StatsSection: React.FC = () => {
  return (
    <section
      id="stats-section"
      className="py-28 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0a1628 0%, #0f1d3a 40%, #0a1628 100%)' }}
    >
      {/* Star particles */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.1 }}
          animate={{ opacity: [0.1, 0.6, 0.1] }}
          transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
          className="absolute w-1 h-1 bg-white rounded-full pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Glow orbs */}
      <div className="absolute top-[-15%] right-[10%] w-[400px] h-[400px] bg-cyan-500/[0.06] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[20%] w-[300px] h-[300px] bg-indigo-500/[0.06] rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-[1320px] mx-auto px-6 md:px-10 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2
            className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight font-instrument"
          >
            Numbers That{' '}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Speak For Themselves
            </span>
          </h2>
          <p className="text-white/45 text-sm md:text-base font-medium">
            We don't just guide — we deliver results, year after year.
          </p>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-2xl p-8 text-center flex flex-col justify-center min-h-[180px] group hover:-translate-y-1.5 transition-transform duration-300"
              style={{
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
              }}
            >
              <p
                className="text-4xl md:text-5xl font-black tracking-tight mb-2 bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent"
                style={{
                  textShadow: '0 0 40px rgba(34, 211, 238, 0.3)',
                }}
              >
                <CountUp
                  target={stat.value}
                  suffix={stat.suffix}
                  prefix={stat.prefix}
                  postfix={stat.postfix}
                />
              </p>
              <p className="text-white/50 text-sm font-bold uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
