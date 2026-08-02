import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Flame, User, Star, Users, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardUser {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  email: string;
  avatar_url?: string;
  position?: string;
  total_points: number;
}

export default function AcademyLeaderboard() {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, avatar_url, position, total_points')
        .order('total_points', { ascending: false, nullsFirst: false })
        .limit(10);

      if (error) {
        console.error('Error fetching leaderboard profiles:', error);
      }

      if (data && data.length > 0) {
        const formatted = data.map((d: any) => {
          const fullName = [d.first_name, d.last_name].filter(Boolean).join(' ').trim() || d.email?.split('@')[0] || 'Usuario';
          return {
            id: d.id,
            first_name: d.first_name,
            last_name: d.last_name,
            full_name: fullName,
            email: d.email || '',
            avatar_url: d.avatar_url,
            position: d.position || 'Representante',
            total_points: d.total_points || 0
          };
        });
        setLeaders(formatted);
      } else {
        setLeaders([]);
      }
    } catch (e) {
      console.error('Error fetching real leaderboard:', e);
      setLeaders([]);
    } finally {
      setLoading(false);
    }
  };

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-tr from-yellow-500 to-amber-300 text-white font-black shadow-lg shadow-yellow-500/30 text-xs">
          🥇 1°
        </div>
      );
    }
    if (index === 1) {
      return (
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-800 font-black shadow-md text-xs">
          🥈 2°
        </div>
      );
    }
    if (index === 2) {
      return (
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-tr from-amber-700 to-orange-400 text-white font-black shadow-md text-xs">
          🥉 3°
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center h-7 w-7 rounded-full bg-muted text-muted-foreground font-bold text-xs">
        {index + 1}°
      </div>
    );
  };

  const getInitials = (user: LeaderboardUser) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.full_name) {
      return user.full_name.slice(0, 2).toUpperCase();
    }
    return 'CH';
  };

  return (
    <Card className="border-border bg-card shadow-sm overflow-hidden">
      <CardHeader className="p-5 pb-3 border-b border-border bg-muted/20 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-black text-foreground">Top Capital Humano</CardTitle>
            <p className="text-[11px] text-muted-foreground">Ranking real por puntos acumulados en cursos</p>
          </div>
        </div>
        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 text-[10px] uppercase font-black">
          <Flame className="h-3 w-3 mr-1 fill-amber-500" /> Ranking
        </Badge>
      </CardHeader>

      <CardContent className="p-4 space-y-2">
        {loading ? (
          <div className="py-8 text-center text-xs text-muted-foreground animate-pulse">
            Cargando ranking de Capital Humano...
          </div>
        ) : leaders.length === 0 ? (
          <div className="py-8 text-center bg-muted/20 rounded-2xl p-4 border border-dashed border-border">
            <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
            <p className="text-xs font-semibold text-foreground">Aún no hay usuarios con puntos</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Los colaboradores aparecerán aquí al aprobar sus primeros cursos.
            </p>
          </div>
        ) : (
          leaders.map((leader, idx) => (
            <div
              key={leader.id || idx}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                idx === 0
                  ? 'border-amber-400/40 bg-amber-500/5 shadow-sm'
                  : 'border-border/60 bg-card hover:bg-muted/30'
              }`}
            >
              <div className="flex items-center gap-3">
                {getRankBadge(idx)}
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarImage src={leader.avatar_url} />
                  <AvatarFallback className="text-xs font-bold bg-muted">
                    {getInitials(leader)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 max-w-[140px] sm:max-w-[180px]">
                  <p className="text-xs font-bold text-foreground truncate">{leader.full_name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {leader.position || leader.email}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1 justify-end">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  {leader.total_points} pts
                </span>
                <span className="text-[10px] text-muted-foreground">acumulados</span>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

