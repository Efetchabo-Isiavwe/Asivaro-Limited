import React from 'react';

interface CurrencyProps {
  amount: number;
  symbol?: string;
  className?: string;
  compact?: boolean;
}

export const formatNaira = (amount: number, symbol: string = '₦', compact: boolean = false): string => {
  if (compact && Math.abs(amount) >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(2)}M`;
  }
  if (compact && Math.abs(amount) >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}k`;
  }
  return `${symbol}${Number(amount || 0).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const Currency: React.FC<CurrencyProps> = ({
  amount,
  symbol = '₦',
  className = '',
  compact = false,
}) => {
  return <span className={className}>{formatNaira(amount, symbol, compact)}</span>;
};
