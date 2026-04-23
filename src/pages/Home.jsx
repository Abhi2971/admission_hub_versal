import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/design.css';

/* ─── Keyframe injection (kept for compatibility) ───────────────────────────── */
const KEYFRAMES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes countUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ─── SVG Icons ───────────────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  </svg>
);
const AIIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const DocIcon = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
  </svg>
);
const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

/* ─── Decorative blob ─────────────────────────────────────────────────────── */
const Blob = ({ style }) => (
  <div style={{
    position: 'absolute',
    borderRadius: '60% 40% 70% 30% / 50% 60% 40% 50%',
    filter: 'blur(60px)',
    pointerEvents: 'none',
    animation: 'drift 8s ease-in-out infinite',
    ...style,
  }} />
);

/* ─── Main ────────────────────────────────────────────────────────────────── */
const Home = () => {
  return (
    <div className="font-sans bg-white overflow-x-hidden">
      <style>{KEYFRAMES}</style>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center p-6 md:p-12 lg:p-16 bg-gradient-to-r from-[#f0f7ff] to-[#ffffff] via-[#f5f3ff] glass-card anim-fade-up-1">
        {/* Decorative blobs */}
        <Blob style={{ width: 500, height: 500, background: 'rgba(24,95,165,0.07)', top: -100, right: -100 }} />
        <Blob style={{ width: 400, height: 400, background: 'rgba(83,74,183,0.06)', bottom: -80, left: -80, animationDelay: '3s' }} />
        <Blob style={{ width: 200, height: 200, background: 'rgba(59,109,17,0.05)', top: '40%', left: '20%', animationDelay: '5s' }} />

        {/* Dot grid background */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,rgba(24,95,165,0.08)1px,transparent1px)] bg-[size:32px_32px] mask-[radial-gradient(ellipse_80%_80%_at_50%_50%,black,transparent)]" />

        <div className="relative max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[rgba(24,95,165,0.08)] border border-[rgba(24,95,165,0.15)] rounded-full px-4 py-2 mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-[#185FA5] animate-pulse" />
            <span className="text-sm font-medium text-[#185FA5]">AI-Powered Admissions Platform</span>
          </div>

          <h1 className="h1 text-[#0a0f1e] mb-6 fade-up-2">
            Your Journey to the <span className="relative text-[#185FA5]">
              Right College
              <span className="shimmer-line absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#185FA5] via-[#534AB7] to-[#185FA5]" />
            </span> Starts Here
          </h1>

          <p className="text-[#4b5563] text-base max-w-xl mx-auto mb-9 fade-up-3">
            Discover hundreds of colleges, get AI-powered career guidance, and apply to multiple courses — all from one seamless platform.
          </p>

          <div className="flex gap-3 justify-center flex-wrap mb-12 fade-up-4">
            <Link to="/signup" className="btn-primary anim-fade-up-4">Get started free <ArrowRight /></Link>
            <Link to="/colleges" className="btn-secondary anim-fade-up-4">Browse colleges</Link>
          </div>

          <div className="flex gap-5 justify-center flex-wrap fade-up-5">
            {['Free to apply', 'AI recommendations', 'Track applications'].map(t => (
              <div key={t} className="inline-flex items-center gap-1 text-sm text-[#6b7280]">
                <span className="w-4 h-4 flex items-center justify-center rounded-full bg-[#EAF3DE] text-[#27500A]"><CheckIcon /></span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-[#0a0f1e] py-10">
        <div className="container grid grid-cols-3 gap-4 text-center">
          {[{ num: '500+', label: 'Colleges listed' }, { num: '10K+', label: 'Students enrolled' }, { num: '98%', label: 'Satisfaction rate' }].map(({ num, label }) => (
            <div key={label} className="stat-card">
              <div className="stat-value text-white font-bold text-2xl mb-1">{num}</div>
              <div className="text-sm text-[rgba(255,255,255,0.45)]">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 bg-[#fafafa]">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="text-xs font-semibold tracking-wider uppercase text-[#185FA5] mb-3">Why AdmissionHub</div>
            <h2 className="h2 text-[#0a0f1e]">Everything you need to get admitted</h2>
          </div>
          <div className="grid grid-cols-3 gap-5">
            {[{ icon: <SearchIcon />, title: 'Discover Colleges', body: 'Search and filter from hundreds of colleges and courses across India by location, domain, and fees.', accent: '#185FA5' },
               { icon: <AIIcon />, title: 'AI Career Guidance', body: 'Get personalised course recommendations powered by AI — based on your interests, skills, and career goals.', accent: '#534AB7' },
               { icon: <DocIcon />, title: 'Easy Applications', body: 'Apply to multiple colleges, upload documents, confirm admissions, and track every status in one place.', accent: '#3B6D11' }].map(({ icon, title, body, accent }) => (
              <div key={title} className="glass-card border-t-4" style={{ borderTopColor: accent }}>
                <div className="w-14 h-14 flex items-center justify-center rounded-xl mb-5" style={{ background: 'rgba(0,0,0,0.05)' }}>{icon}</div>
                <h3 className="h2 text-[#0a0f1e] mb-3">{title}</h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED COLLEGES */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl mx-auto">
          <div className="flex items-end justify-between flex-wrap gap-3 mb-10">
            <div>
              <div className="text-xs font-semibold tracking-wider uppercase text-[#185FA5] mb-2">Top institutions</div>
              <h2 className="h2 text-[#0a0f1e]">Featured Colleges</h2>
            </div>
            <Link to="/colleges" className="inline-flex items-center gap-1 text-[#185FA5] hover:underline">View all <ArrowRight /></Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[{ name: 'IIT Bombay', loc: 'Mumbai, Maharashtra', code: 'IIT', color: '#185FA5', bg: '#E6F1FB' },
               { name: 'AIIMS Delhi', loc: 'New Delhi', code: 'AII', color: '#3B6D11', bg: '#EAF3DE' },
               { name: 'IIM Ahmedabad', loc: 'Ahmedabad, Gujarat', code: 'IIM', color: '#534AB7', bg: '#EEEDFE' },
               { name: 'NIT Trichy', loc: 'Tiruchirappalli, Tamil Nadu', code: 'NIT', color: '#BA7517', bg: '#FAEEDA' },
               { name: 'Delhi University', loc: 'New Delhi', code: 'DU', color: '#A32D2D', bg: '#FCEBEB' },
               { name: 'BITS Pilani', loc: 'Pilani, Rajasthan', code: 'BIT', color: '#185FA5', bg: '#E6F1FB' }].map(({ name, loc, code, color, bg }) => (
              <div key={name} className="glass-card flex items-center gap-4 p-4">
                <div className="w-11 h-11 flex items-center justify-center rounded-md" style={{ background: bg, color }}>{code}</div>
                <div>
                  <div className="text-[#0a0f1e] font-medium mb-1">{name}</div>
                  <div className="text-sm text-[#9ca3af]">{loc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="relative mx-4 my-12 rounded-2xl bg-gradient-to-br from-[#0a0f1e] to-[#1a2744] p-10 text-center max-w-4xl mx-auto overflow-hidden">
        <div className="absolute w-72 h-72 rounded-full border border-[rgba(255,255,255,0.04)] top-[-80px] right-[-80px]" />
        <div className="absolute w-48 h-48 rounded-full border border-[rgba(255,255,255,0.06)] bottom-[-60px] left-[-60px]" />
        <div className="absolute w-36 h-36 rounded-full bg-[rgba(24,95,165,0.15)] top-[20%] left-[10%] blur-[40px]" />
        <div className="relative">
          <div className="text-xs font-semibold tracking-wider uppercase text-[rgba(255,255,255,0.4)] mb-4">Start today — it's free</div>
          <h2 className="h2 text-white mb-4">Ready to find your perfect college?</h2>
          <p className="text-white/50 max-w-xl mx-auto mb-9">Join thousands of students who found their dream college through AdmissionHub.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/signup" className="btn-primary">Create free account <ArrowRight /></Link>
            <Link to="/login" className="btn-outline bg-white/5 text-white hover:bg-white/10 border border-white/10">Sign in</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;