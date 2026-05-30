import React from 'react';

const AnalyticsChart = ({ data = [] }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '220px',
        backgroundColor: 'var(--gray-100)',
        border: '1px dashed var(--gray-300)',
        borderRadius: 'var(--radius-md)',
        color: 'var(--gray-400)'
      }}>
        No hay datos de tendencias disponibles
      </div>
    );
  }

  // SVG dimensions
  const width = 600;
  const height = 240;
  const paddingX = 45;
  const paddingY = 30;

  // Find max values to scale the graph correctly
  const maxVal = Math.max(
    ...data.map(item => Math.max(item.vistas || 0, item.clicks_whatsapp || 0)),
    5 // minimum scale ceiling
  );

  // X & Y scaling functions
  const getX = (index) => {
    return paddingX + (index * (width - 2 * paddingX) / (data.length - 1));
  };

  const getY = (val) => {
    return height - paddingY - (val * (height - 2 * paddingY) / maxVal);
  };

  // Generate SVG path for a line
  const generatePath = (key) => {
    if (data.length < 2) return '';
    return data.map((item, index) => {
      const x = getX(index);
      const y = getY(item[key] || 0);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // Generate SVG path for filled area under the line
  const generateAreaPath = (key) => {
    if (data.length < 2) return '';
    const linePath = generatePath(key);
    const firstX = getX(0);
    const lastX = getX(data.length - 1);
    const baseY = height - paddingY;
    return `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  const vistasLine = generatePath('vistas');
  const vistasArea = generateAreaPath('vistas');
  
  const clicksLine = generatePath('clicks_whatsapp');
  const clicksArea = generateAreaPath('clicks_whatsapp');

  // Format date for X axis (e.g. "30/05")
  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    return `${parts[2]}/${parts[1]}`;
  };

  // Select key indices for X axis labels to prevent overlapping
  const labelInterval = Math.max(Math.floor(data.length / 5), 1);

  // Generate Y-axis gridlines (5 divisions)
  const yGridlines = [];
  for (let i = 0; i <= 4; i++) {
    const val = Math.round((maxVal / 4) * i);
    const y = getY(val);
    yGridlines.push({ val, y });
  }

  return (
    <div style={{ width: '100%', position: 'relative' }}>
      {/* Legend */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-md)',
        fontSize: '0.85rem',
        fontWeight: '600'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--primary-500)' }} />
          <span style={{ color: 'var(--gray-500)' }}>Vistas (Views)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--secondary-500)' }} />
          <span style={{ color: 'var(--gray-500)' }}>Clicks WhatsApp</span>
        </div>
      </div>

      {/* SVG Drawing */}
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        width="100%" 
        height="100%" 
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Blue gradient for views */}
          <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary-500)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--primary-500)" stopOpacity="0.0" />
          </linearGradient>
          {/* Orange/Green gradient for clicks */}
          <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--secondary-500)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--secondary-500)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Gridlines & Y-Axis Labels */}
        {yGridlines.map((grid, idx) => (
          <g key={idx}>
            <line 
              x1={paddingX} 
              y1={grid.y} 
              x2={width - paddingX} 
              y2={grid.y} 
              stroke="var(--gray-200)" 
              strokeWidth="1"
              strokeDasharray="4,4" 
            />
            <text 
              x={paddingX - 10} 
              y={grid.y + 4} 
              textAnchor="end" 
              fontSize="0.75rem" 
              fill="var(--gray-400)"
              fontWeight="600"
            >
              {grid.val}
            </text>
          </g>
        ))}

        {/* Filled Areas */}
        {vistasArea && <path d={vistasArea} fill="url(#viewsGrad)" />}
        {clicksArea && <path d={clicksArea} fill="url(#clicksGrad)" />}

        {/* Lines */}
        {vistasLine && (
          <path 
            d={vistasLine} 
            fill="none" 
            stroke="var(--primary-500)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        )}
        {clicksLine && (
          <path 
            d={clicksLine} 
            fill="none" 
            stroke="var(--secondary-500)" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
        )}

        {/* Highlight points on lines */}
        {data.map((item, idx) => {
          if (data.length > 15 && idx % 2 !== 0) return null; // reduce point density if too many days
          const x = getX(idx);
          
          return (
            <g key={idx}>
              {/* Vista dot */}
              <circle 
                cx={x} 
                cy={getY(item.vistas || 0)} 
                r="4" 
                fill="white" 
                stroke="var(--primary-500)" 
                strokeWidth="2" 
              />
              {/* Click dot */}
              <circle 
                cx={x} 
                cy={getY(item.clicks_whatsapp || 0)} 
                r="4" 
                fill="white" 
                stroke="var(--secondary-500)" 
                strokeWidth="2" 
              />
            </g>
          );
        })}

        {/* X-Axis Labels */}
        {data.map((item, idx) => {
          if (idx % labelInterval !== 0 && idx !== data.length - 1) return null;
          return (
            <text 
              key={idx}
              x={getX(idx)} 
              y={height - 8} 
              textAnchor="middle" 
              fontSize="0.75rem" 
              fill="var(--gray-400)"
              fontWeight="600"
            >
              {formatDateLabel(item.fecha)}
            </text>
          );
        })}

        {/* Base line */}
        <line 
          x1={paddingX} 
          y1={height - paddingY} 
          x2={width - paddingX} 
          y2={height - paddingY} 
          stroke="var(--gray-300)" 
          strokeWidth="1.5" 
        />
      </svg>
    </div>
  );
};

export default AnalyticsChart;
