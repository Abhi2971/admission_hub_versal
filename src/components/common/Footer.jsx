import React from 'react';
import { Link } from 'react-router-dom';

const S = {
  footer: {
    background: '#0a0f1e',
    fontFamily: "'DM Sans', sans-serif",
    padding: '3rem 1.5rem 2rem',
    marginTop: 'auto',
  },
  inner: {
    maxWidth: 960,
    margin: '0 auto',
  },
  top: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 32,
    paddingBottom: '2rem',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    marginBottom: '1.5rem',
  },

  /* Brand */
  brandWrap: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 },
  brandIcon: {
    width: 34, height: 34, borderRadius: 9,
    background: '#185FA5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 700, color: '#E6F1FB',
    flexShrink: 0,
    fontFamily: "'Syne', sans-serif",
  },
  brandName: {
    fontSize: 15, fontWeight: 600, color: '#f1f5f9',
    fontFamily: "'Syne', sans-serif",
  },
  brandTagline: {
    fontSize: 13, color: 'rgba(255,255,255,0.35)',
    fontWeight: 300, lineHeight: 1.5,
    maxWidth: 220,
  },

  /* Links */
  linksWrap: {
    display: 'flex', gap: 40, flexWrap: 'wrap',
  },
  linkGroup: { display: 'flex', flexDirection: 'column', gap: 10 },
  groupLabel: {
    fontSize: 10, fontWeight: 600, letterSpacing: '1px',
    textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
    marginBottom: 2,
  },
  link: {
    fontSize: 13, color: 'rgba(255,255,255,0.5)',
    textDecoration: 'none',
    transition: 'color 0.15s ease',
  },
  linkBtn: {
    fontSize: 13, color: 'rgba(255,255,255,0.5)',
    background: 'none', border: 'none', padding: 0,
    cursor: 'pointer', textAlign: 'left',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'color 0.15s ease',
  },

  /* Bottom bar */
  bottom: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
  },
  copyright: {
    fontSize: 12, color: 'rgba(255,255,255,0.2)',
  },
  madWith: {
    fontSize: 12, color: 'rgba(255,255,255,0.2)',
  },
};

const NAV_LINKS = [
  {
    label: 'Platform',
    links: [
      { to: '/courses',  text: 'Courses'  },
      { to: '/colleges', text: 'Colleges' },
      { to: '/signup',   text: 'Sign up'  },
      { to: '/login',    text: 'Sign in'  },
    ],
  },
  {
    label: 'Company',
    links: [
      { to: '#', text: 'About'   },
      { to: '#', text: 'Contact' },
    ],
  },
  {
    label: 'Legal',
    links: [
      { to: '#', text: 'Privacy' },
      { to: '#', text: 'Terms'   },
    ],
  },
];

const Footer = () => (
  <footer style={S.footer}>
    <style>{`
      .footer-link:hover { color: rgba(255,255,255,0.85) !important; }
    `}</style>

    <div style={S.inner}>
      <div style={S.top}>
        {/* Brand */}
        <div>
          <div style={S.brandWrap}>
            <div style={S.brandIcon}>A</div>
            <span style={S.brandName}>AdmissionHub</span>
          </div>
          <p style={S.brandTagline}>
            Your gateway to discovering colleges, getting AI guidance, and applying seamlessly.
          </p>
        </div>

        {/* Link groups */}
        <div style={S.linksWrap}>
          {NAV_LINKS.map(({ label, links }) => (
            <div key={label} style={S.linkGroup}>
              <div style={S.groupLabel}>{label}</div>
              {links.map(({ to, text }) =>
                to === '#' ? (
                  <button key={text} className="footer-link" style={S.linkBtn}>{text}</button>
                ) : (
                  <Link key={text} to={to} className="footer-link" style={S.link}>{text}</Link>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={S.bottom}>
        <span style={S.copyright}>
          &copy; {new Date().getFullYear()} AdmissionHub. All rights reserved.
        </span>
        <span style={S.madWith}>
          Built for students across India
        </span>
      </div>
    </div>
  </footer>
);

export default Footer;