"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  showValue?: boolean;
  animationDuration?: number;
  children?: React.ReactNode;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = "hsl(var(--primary))",
  backgroundColor = "hsl(var(--muted))",
  label,
  showValue = true,
  animationDuration = 1.5,
  children
}) => {
  const normalizedValue = Math.min(Math.max(value, 0), max);
  const percentage = (normalizedValue / max) * 100;
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const center = size / 2;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          opacity={0.3}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: animationDuration,
            ease: "easeInOut"
          }}
        />
      </svg>
      
      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children || (
          <>
            {showValue && (
              <motion.div
                className="text-2xl font-bold"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: animationDuration * 0.5 }}
              >
                {Math.round(normalizedValue)}
                <span className="text-sm opacity-60">%</span>
              </motion.div>
            )}
            {label && (
              <motion.div
                className="text-xs text-muted-foreground mt-1 max-w-[80px] leading-tight"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: animationDuration * 0.7 }}
              >
                {label}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

interface SkillRadarProps {
  data: Array<{
    skill: string;
    value: number;
    max?: number;
  }>;
  size?: number;
  className?: string;
}

export const SkillRadar: React.FC<SkillRadarProps> = ({
  data,
  size = 200,
  className = ""
}) => {
  const center = size / 2;
  const radius = size * 0.35;
  const maxValue = data[0]?.max || 100;

  // Calculate points for the polygon
  const points = data.map((item, index) => {
    const angle = (index / data.length) * 2 * Math.PI - Math.PI / 2;
    const valueRadius = (item.value / maxValue) * radius;
    const x = center + Math.cos(angle) * valueRadius;
    const y = center + Math.sin(angle) * valueRadius;
    return { x, y, angle, label: item.skill, value: item.value };
  });

  // Background grid circles
  const gridCircles = [0.2, 0.4, 0.6, 0.8, 1.0].map(ratio => ratio * radius);

  return (
    <div className={`relative ${className}`}>
      <svg width={size} height={size} className="overflow-visible">
        {/* Background grid */}
        {gridCircles.map((r, index) => (
          <circle
            key={index}
            cx={center}
            cy={center}
            r={r}
            stroke="hsl(var(--border))"
            strokeWidth={1}
            fill="none"
            opacity={0.3}
          />
        ))}

        {/* Grid lines */}
        {points.map((point, index) => (
          <line
            key={index}
            x1={center}
            y1={center}
            x2={center + Math.cos(point.angle) * radius}
            y2={center + Math.sin(point.angle) * radius}
            stroke="hsl(var(--border))"
            strokeWidth={1}
            opacity={0.3}
          />
        ))}

        {/* Skill polygon */}
        <motion.polygon
          points={points.map(p => `${p.x},${p.y}`).join(' ')}
          fill="hsl(var(--primary))"
          fillOpacity={0.2}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* Skill points */}
        {points.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={4}
            fill="hsl(var(--primary))"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          />
        ))}

        {/* Labels */}
        {points.map((point, index) => {
          const labelRadius = radius + 25;
          const labelX = center + Math.cos(point.angle) * labelRadius;
          const labelY = center + Math.sin(point.angle) * labelRadius;
          
          return (
            <motion.text
              key={index}
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-xs font-medium fill-current"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              {point.label}
            </motion.text>
          );
        })}
      </svg>

      {/* Value indicators */}
      {points.map((point, index) => (
        <motion.div
          key={index}
          className="absolute text-xs font-semibold bg-primary text-primary-foreground px-1 py-0.5 rounded"
          style={{
            left: point.x - 10,
            top: point.y - 20,
            fontSize: '10px'
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + index * 0.1 }}
        >
          {point.value}
        </motion.div>
      ))}
    </div>
  );
};