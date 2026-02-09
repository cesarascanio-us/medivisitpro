import { LucideIcon, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trending?: number;
  variant?: "default" | "success" | "warning" | "primary" | "destructive";
}

export const StatsCard = ({ title, value, subtitle, icon: Icon, trending, variant = "default" }: StatsCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "primary": return "from-emerald-500/20 to-teal-500/5 border-emerald-500/20 text-emerald-400 accent-emerald-400";
      case "success": return "from-teal-500/20 to-blue-500/5 border-teal-500/20 text-teal-400 accent-teal-400";
      case "warning": return "from-amber-500/20 to-orange-500/5 border-amber-500/20 text-amber-400 accent-amber-400";
      case "destructive": return "from-red-500/20 to-rose-500/5 border-red-500/20 text-red-400 accent-red-400";
      default: return "from-slate-800/50 to-slate-900/20 border-white/5 text-slate-400 accent-slate-400";
    }
  };

  const accentColor = getVariantStyles().split(' ').pop()?.replace('accent-', '');

  return (
    <Card className="medical-card-hover overflow-hidden group border-white/5 relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${getVariantStyles().split(' ').slice(0, 2).join(' ')} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-2xl bg-slate-900/50 border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
            <Icon className={`h-6 w-6 ${accentColor}`} />
          </div>
          {trending !== undefined && (
            <div className="flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 tracking-tighter">
              <TrendingUp className="h-3 w-3" />
              {trending}%
            </div>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1 group-hover:text-slate-300 transition-colors">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black text-white tracking-tighter tabular-nums drop-shadow-md">
              {value}
            </h3>
          </div>
          {subtitle && (
            <p className="text-[10px] text-slate-500 mt-2 font-medium group-hover:text-slate-400 transition-colors">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};