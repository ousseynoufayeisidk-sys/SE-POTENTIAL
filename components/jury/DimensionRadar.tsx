'use client';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface DimensionRadarProps {
  people: number;
  execution: number;
  business: number;
  impact: number;
}

export function DimensionRadar({ people, execution, business, impact }: DimensionRadarProps) {
  const data = [
    { dimension: 'PEOPLE', value: people, fullMark: 100 },
    { dimension: 'EXECUTION', value: execution, fullMark: 100 },
    { dimension: 'BUSINESS', value: business, fullMark: 100 },
    { dimension: 'IMPACT', value: impact, fullMark: 100 },
  ];

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#14212B20" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: '#14212B', fontSize: 14, fontWeight: 600 }}
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#14212B80', fontSize: 12 }} />
          <Radar
            name="Score"
            dataKey="value"
            stroke="#0E6B4F"
            fill="#0E6B4F"
            fillOpacity={0.6}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-baobab">{people}%</div>
          <div className="text-sm text-nuit/60">PEOPLE</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-baobab">{execution}%</div>
          <div className="text-sm text-nuit/60">EXECUTION</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-baobab">{business}%</div>
          <div className="text-sm text-nuit/60">BUSINESS</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-baobab">{impact}%</div>
          <div className="text-sm text-nuit/60">IMPACT</div>
        </div>
      </div>
    </div>
  );
}
