import React from 'react';

// 1. Circular/Doughnut Chart for Categories
export const CategoryDoughnut = ({ categoryCounts }) => {
  const categories = Object.keys(categoryCounts);
  const total = Object.values(categoryCounts).reduce((sum, val) => sum + val, 0);

  const colors = {
    technical: '#6366f1', // Indigo
    cultural: '#a855f7', // Purple
    sports: '#10b981', // Emerald
    seminar: '#f59e0b', // Amber
    other: '#64748b', // Muted Slate
  };

  // If no registrations yet
  if (total === 0) {
    return (
      <div className="chart-wrapper">
        <p style={{ color: 'var(--text-muted)' }}>No registration data available</p>
      </div>
    );
  }

  // Calculate paths for doughnut sectors
  let accumulatedAngle = 0;
  const radius = 60;
  const innerRadius = 40;
  const cx = 100;
  const cy = 100;

  const sectors = categories.map((cat) => {
    const val = categoryCounts[cat];
    const percentage = total > 0 ? val / total : 0;
    const angle = percentage * 360;

    if (val === 0) return null;

    // Helper to calculate coordinates
    const polarToCartesian = (centerX, centerY, r, angleInDegrees) => {
      const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
      return {
        x: centerX + r * Math.cos(angleInRadians),
        y: centerY + r * Math.sin(angleInRadians),
      };
    };

    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle = endAngle;

    const startOuter = polarToCartesian(cx, cy, radius, startAngle);
    const endOuter = polarToCartesian(cx, cy, radius, endAngle);
    const startInner = polarToCartesian(cx, cy, innerRadius, startAngle);
    const endInner = polarToCartesian(cx, cy, innerRadius, endAngle);

    const largeArcFlag = angle > 180 ? 1 : 0;

    // SVG path string for a sector of a doughnut
    const d = [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
      `L ${endInner.x} ${endInner.y}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`,
      'Z',
    ].join(' ');

    return {
      category: cat,
      path: d,
      color: colors[cat] || colors.other,
      value: val,
      percentage: Math.round(percentage * 100),
    };
  }).filter(Boolean);

  return (
    <div>
      <div className="chart-wrapper">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <defs>
            {sectors.map((sec, idx) => (
              <radialGradient id={`grad-${idx}`} key={idx} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={sec.color} stopOpacity="1" />
                <stop offset="100%" stopColor={sec.color} stopOpacity="0.8" />
              </radialGradient>
            ))}
          </defs>
          {sectors.map((sec, idx) => (
            <path
              key={idx}
              d={sec.path}
              fill={`url(#grad-${idx})`}
              stroke="var(--bg-main)"
              strokeWidth="2"
              style={{ transition: 'all 0.3s ease' }}
              title={`${sec.category}: ${sec.value} (${sec.percentage}%)`}
            />
          ))}
        </svg>
      </div>
      <div className="chart-legend">
        {sectors.map((sec, idx) => (
          <div key={idx} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: sec.color }} />
            <span style={{ textTransform: 'capitalize' }}>
              {sec.category}: {sec.value} ({sec.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 2. Horizontal Bar Chart for Ratings (1-5 stars)
export const RatingsBarChart = ({ ratingCounts, totalReviews }) => {
  const ratings = [5, 4, 3, 2, 1];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      {ratings.map((stars) => {
        const count = ratingCounts[stars] || 0;
        const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

        return (
          <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ width: '50px', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>
              {stars} Stars
            </span>
            <div className="progress-bar-container" style={{ flex: 1 }}>
              <div
                className="progress-bar-fill"
                style={{
                  width: `${percent}%`,
                  background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
                }}
              />
            </div>
            <span style={{ width: '40px', fontSize: '13px', textAlign: 'right', color: 'var(--text-muted)' }}>
              {percent}%
            </span>
            <span style={{ width: '30px', fontSize: '13px', textAlign: 'right', fontWeight: '500' }}>
              ({count})
            </span>
          </div>
        );
      })}
    </div>
  );
};
