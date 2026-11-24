import {
  createIcons,
  Activity, ArrowRight, ArrowUpRight, BookOpen, Brain, Building2, Calculator, CalendarCheck, Check,
  ChevronDown, Clock, ClipboardList, FileSearch, FileText, Fingerprint, Gauge, Globe, Headset,
  HeartHandshake, HeartPulse, Layers, Link, Lock, Mail, MapPin, MessageCircle, Newspaper, PawPrint,
  Phone, Pill, Quote, ScanLine, Search, Send, Server, Share2, ShieldCheck, Smile, Sparkles,
  Stethoscope, Target, Users, Video, X, Zap, Bell, Plus, Minus, Laptop,
} from 'lucide';

export function renderIcons(root = document) {
  createIcons({
    root,
    attrs: { 'stroke-width': 2, 'aria-hidden': 'true' },
    icons: {
      Activity, ArrowRight, ArrowUpRight, BookOpen, Brain, Building2, Calculator, CalendarCheck, Check,
      ChevronDown, Clock, ClipboardList, FileSearch, FileText, Fingerprint, Gauge, Globe, Headset,
      HeartHandshake, HeartPulse, Layers, Link, Lock, Mail, MapPin, MessageCircle, Newspaper, PawPrint,
      Phone, Pill, Quote, ScanLine, Search, Send, Server, Share2, ShieldCheck, Smile, Sparkles,
      Stethoscope, Target, Users, Video, X, Zap, Bell, Plus, Minus, Laptop,
    },
  });
}
