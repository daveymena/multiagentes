import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  delay?: number;
}

export function StatsCard({ title, value, icon, trend, className, delay = 0 }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "relative p-6 rounded-2xl glass border border-border/50 overflow-hidden group",
        "hover:border-primary/30 transition-all duration-300",
        className
      )}
    >
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full",
              trend.isPositive 
                ? "bg-success/10 text-success" 
                : "bg-destructive/10 text-destructive"
            )}>
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
        
        <h3 className="text-3xl font-display font-bold text-foreground mb-1">
          {value}
        </h3>
        <p className="text-sm text-muted-foreground">{title}</p>
      </div>
    </motion.div>
  );
}
