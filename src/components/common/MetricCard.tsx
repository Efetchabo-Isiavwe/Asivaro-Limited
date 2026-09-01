import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Currency } from './Currency';

interface MetricCardProps {
  id?: string;
  title: string;
  value: number | string;
  isCurrency?: boolean;
  currencySymbol?: string;
  change?: number; // percentage
  period?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  subtitle?: string;
  badge?: string;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'blue' | 'neutral';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  id,
  title,
  value,
  isCurrency = false,
  currencySymbol = '₦',
  change,
  period = 'vs last month',
  icon: Icon,
  iconColor = 'text-neutral-900',
  iconBg = 'bg-neutral-100',
  subtitle,
  badge,
  badgeColor = 'neutral',
  onClick,
}) => {
  const badgeClasses = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-neutral-100 text-neutral-600 border-neutral-200',
  }[badgeColor];

  return (
    <div
      id={id}
      onClick={onClick}
      className={`relative bg-white rounded-xl p-5 border border-neutral-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-neutral-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            {title}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-neutral-900">
              {isCurrency && typeof value === 'number' ? (
                <Currency amount={value} symbol={currencySymbol} />
              ) : (
                value
              )}
            </span>
          </div>
        </div>

        <div className={`p-2.5 rounded-lg ${iconBg} ${iconColor} shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
        {change !== undefined ? (
          <div className="flex items-center gap-1.5 font-medium">
            {change > 0 ? (
              <span className="flex items-center text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +{change}%
              </span>
            ) : change < 0 ? (
              <span className="flex items-center text-rose-600">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> {change}%
              </span>
            ) : (
              <span className="flex items-center text-neutral-500">
                <Minus className="w-3.5 h-3.5 mr-0.5" /> 0%
              </span>
            )}
            <span className="text-neutral-600">{period}</span>
          </div>
        ) : subtitle ? (
          <span className="text-neutral-600">{subtitle}</span>
        ) : (
          <span className="text-neutral-600">Active real-time data</span>
        )}

        {badge && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeClasses}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};
