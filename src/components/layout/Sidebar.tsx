import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Bell, 
  MessageSquare, 
  BarChart3, 
  LayoutDashboard,
  PlayCircle,
  Send,
  Settings,
  FileText
} from 'lucide-react';

const sections = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/notifications/dashboard', icon: LayoutDashboard }
    ]
  },
  {
    title: 'Configuración',
    items: [
      { label: 'Plantillas', href: '/notifications/templates', icon: MessageSquare },
      { label: 'Reglas', href: '/notifications/rules', icon: Bell }
    ]
  },
  {
    title: 'Acciones',
    items: [
      { label: 'Ejecutar Regla', href: '/notifications/execute', icon: PlayCircle },
      { label: 'Enviar Notificación', href: '/notifications/send', icon: Send }
    ]
  },
  {
    title: 'Monitoreo',
    items: [
      { label: 'Logs', href: '/notifications/logs', icon: BarChart3 }
    ]
  }
];

export const Sidebar: React.FC = () => {
  return (
    <aside
      className="hidden lg:flex w-64 min-w-[16rem] max-w-[16rem] h-screen backdrop-blur border-r border-white/5 text-white flex-col overflow-visible relative sticky top-0 z-40"
      style={{ background: 'var(--sidebar-bg)' }}
    >
      <div className="px-6 pt-8 pb-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-workspace-surface flex items-center justify-center shadow-accent border border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-workspace-accent/30 blur-xl" />
            <Bell className="relative h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.5em] text-white/40">Console</p>
            <p className="text-lg font-semibold text-white">Notificaciones</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-8 min-h-0">
        {sections.map((section) => (
          <div key={section.title} className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 px-2 font-semibold">
              {section.title}
            </p>
            <div className="space-y-1.5">
              {section.items.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white/10 text-white shadow-lg shadow-black/30 border border-white/10'
                        : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/5'
                    }`
                  }
                >
                  <item.icon className="h-5 w-5 opacity-80 flex-shrink-0" />
                  <span className="flex-1">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-6 border-t border-white/5 pt-4">
        <div className="text-xs text-white/40 px-2">
          <p className="mb-1">Sistema de Notificaciones</p>
          <p className="text-[10px]">Centralizado en Insights</p>
        </div>
      </div>
    </aside>
  );
};
