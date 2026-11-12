import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { DEFAULT_CURVE_POINTS } from '../utils/imageProcessing';
import './ToneCurve.css';

const SIZE = 200;

function toSvg(p) {
  return { cx: p.x * SIZE, cy: (1 - p.y) * SIZE };
}

function fromSvg(cx, cy) {
  return {
    x: Math.max(0, Math.min(1, cx / SIZE)),
    y: Math.max(0, Math.min(1, 1 - cy / SIZE)),
  };
}

function buildPath(points) {
  const sorted = [...points].sort((a, b) => a.x - b.x);
  return sorted
    .map((p, i) => {
      const { cx, cy } = toSvg(p);
      return `${i === 0 ? 'M' : 'L'} ${cx},${cy}`;
    })
    .join(' ');
}

export default function ToneCurve({ darkMode, points, onChange, onCommit, onReset }) {
  const stroke = darkMode ? '#ffffff' : '#000000';
  const grid = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const refLine = darkMode ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.16)';
  const svgRef = useRef(null);
  const dragIndex = useRef(null);
  const [local, setLocal] = useState(points || DEFAULT_CURVE_POINTS);
  const latestRef = useRef(points || DEFAULT_CURVE_POINTS);

  useEffect(() => {
    if (points) latestRef.current = points;
  }, [points]);

  const curvePoints = points || local;

  const path = useMemo(() => buildPath(curvePoints), [curvePoints]);

  const clientToSvg = (clientX, clientY) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const cx = ((clientX - rect.left) / rect.width) * SIZE;
    const cy = ((clientY - rect.top) / rect.height) * SIZE;
    return { cx, cy };
  };

  const updatePoint = useCallback((nextPoints) => {
    latestRef.current = nextPoints;
    setLocal(nextPoints);
    onChange?.(nextPoints);
  }, [onChange]);

  const onPointerDown = (index) => (e) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragIndex.current = index;
  };

  const onPointerMove = (e) => {
    if (dragIndex.current == null) return;
    const pos = clientToSvg(e.clientX, e.clientY);
    if (!pos) return;
    const current = latestRef.current;
    const next = current.map((p, i) => {
      if (i !== dragIndex.current) return p;
      if (i === 0) return { x: 0, y: fromSvg(pos.cx, pos.cy).y };
      if (i === current.length - 1) return { x: 1, y: fromSvg(pos.cx, pos.cy).y };
      const pt = fromSvg(pos.cx, pos.cy);
      const minX = current[i - 1].x + 0.02;
      const maxX = current[i + 1].x - 0.02;
      return { x: Math.max(minX, Math.min(maxX, pt.x)), y: pt.y };
    });
    updatePoint(next);
  };

  const onPointerUp = () => {
    if (dragIndex.current == null) return;
    dragIndex.current = null;
    onCommit?.(latestRef.current);
  };

  const handleReset = () => {
    const reset = DEFAULT_CURVE_POINTS.map((p) => ({ ...p }));
    latestRef.current = reset;
    setLocal(reset);
    onReset?.(reset);
  };

  return (
    <Box className={`tone-curve ${darkMode ? 'dark' : 'light'}`}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="tone-curve-svg"
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <defs>
          <pattern id="curve-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={grid} strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={SIZE} height={SIZE} fill="url(#curve-grid)" />

        <line
          x1="0"
          y1={SIZE}
          x2={SIZE}
          y2="0"
          stroke={refLine}
          strokeWidth="1"
          strokeDasharray="4,4"
        />

        <path
          d={path}
          fill="none"
          stroke={stroke}
          strokeWidth="1.5"
          strokeLinecap="square"
          strokeLinejoin="round"
        />

        {curvePoints.map((p, i) => {
          const { cx, cy } = toSvg(p);
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r="5"
              fill={stroke}
              className="control-point"
              onPointerDown={onPointerDown(i)}
              style={{ cursor: 'grab', touchAction: 'none' }}
            />
          );
        })}
      </svg>
      <Button size="small" className="curve-reset-btn" onClick={handleReset}>
        Reset Curve
      </Button>
    </Box>
  );
}
