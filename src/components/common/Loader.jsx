import React from 'react';

const SIZES = {
  sm: 20,
  md: 32,
  lg: 48,
};

const COLORS = {
  blue:  '#185FA5',
  white: '#ffffff',
  gray:  '#6b7280',
};

const Loader = ({ size = 'md', color = 'blue' }) => {
  const px  = SIZES[size]  ?? SIZES.md;
  const hex = COLORS[color] ?? COLORS.blue;
  const border = px <= 20 ? 2 : px <= 32 ? 3 : 4;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: px,
        height: px,
        borderRadius: '50%',
        border: `${border}px solid ${hex}22`,
        borderTopColor: hex,
        animation: 'loader-spin 0.75s linear infinite',
        flexShrink: 0,
      }} />
      <style>{`
        @keyframes loader-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Loader;