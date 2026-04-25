import type { LucideProps } from 'lucide-react';
import type { ComponentType } from 'react';
import {
  Sunrise, BarChart2, Target, Radio, CheckCircle, Newspaper,
  Trophy, RefreshCw, Moon, Lightbulb, Zap, Rocket,
  Sun, Medal, BookOpen, MessageCircle, Shield, ClipboardList,
  TrendingUp, Brain, Settings2, HelpCircle, Flame, Waves,
  CloudLightning, Smile, AlertTriangle, Layers, Lock,
  Copy, Clipboard, Globe, Camera, Save, X, RotateCw,
  ArrowLeftRight, Download, CalendarDays, Settings, Diamond,
  Sparkles, ChevronDown, ChevronUp, CalendarRange, PlayCircle,
  ChevronRight, AlertCircle, Home, MessageSquare, Send, Music,
  LayoutGrid, ChevronLeft, Plus, Trash2, Star, Package, Users,
  StickyNote, Store,
} from 'lucide-react';

type LI = ComponentType<LucideProps>;

const MAP: Record<string, LI> = {
  Sunrise, BarChart2, Target, Radio, CheckCircle, Newspaper,
  Trophy, RefreshCw, Moon, Lightbulb, Zap, Rocket,
  Sun, Medal, BookOpen, MessageCircle, Shield, ClipboardList,
  TrendingUp, Brain, Settings2, HelpCircle, Flame, Waves,
  CloudLightning, Smile, AlertTriangle, Layers, Lock,
  Copy, Clipboard, Globe, Camera, Save, X, RotateCw,
  ArrowLeftRight, Download, CalendarDays, Settings, Diamond,
  Sparkles, ChevronDown, ChevronUp, CalendarRange, PlayCircle,
  ChevronRight, AlertCircle, Home, MessageSquare, Send, Music,
  LayoutGrid, ChevronLeft, Plus, Trash2, Star, Package, Users,
  StickyNote, Store,
};

export interface IconProps {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

/** Renders a Lucide icon by string name. Returns null if unknown. */
export function Icon({ name, size = 16, className, strokeWidth = 1.75 }: IconProps) {
  const Comp = MAP[name] as LI | undefined;
  if (!Comp) return null;
  return <Comp size={size} className={className} strokeWidth={strokeWidth} />;
}

// Re-export individual icons for direct use in components
export {
  Sunrise, BarChart2, Target, Radio, CheckCircle, Newspaper,
  Trophy, RefreshCw, Moon, Lightbulb, Zap, Rocket,
  Sun, Medal, BookOpen, MessageCircle, Shield, ClipboardList,
  TrendingUp, Brain, Settings2, HelpCircle, Flame, Waves,
  CloudLightning, Smile, AlertTriangle, Layers, Lock,
  Copy, Clipboard, Globe, Camera, Save, X, RotateCw,
  ArrowLeftRight, Download, CalendarDays, Settings, Diamond,
  Sparkles, ChevronDown, ChevronUp, CalendarRange, PlayCircle,
  ChevronRight, AlertCircle, Home, MessageSquare, Send, Music,
  LayoutGrid, ChevronLeft, Plus, Trash2, Star, Package, Users,
  StickyNote, Store,
} from 'lucide-react';
