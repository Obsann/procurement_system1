import { useState } from 'react';
import { CheckCircle2, Bell, ShoppingCart, Package, Settings, CheckCheck } from 'lucide-react';
import { PageHeader, Button, Card } from '../components/ui';
import { notifications } from '../mockData';
import type { NotificationType } from '../types';

const typeIcons: Record<NotificationType, React.ReactNode> = {
  approval: <CheckCircle2 className="w-5 h-5 text-success" />,
  rfq: <ShoppingCart className="w-5 h-5 text-accent-indigo" />,
  po: <Package className="w-5 h-5 text-info" />,
  receipt: <Package className="w-5 h-5 text-warning" />,
  system: <Settings className="w-5 h-5 text-text-muted" />,
};

export function Notifications() {
  const [items, setItems] = useState(notifications);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const unreadCount = items.filter(n => !n.read).length;

  const filtered = items.filter(n => {
    if (filter === 'unread' && n.read) return false;
    if (filter === 'read' && !n.read) return false;
    return true;
  });

  const markAsRead = (id: string) => {
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setItems(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Group by date
  const grouped: Record<string, typeof filtered> = {};
  filtered.forEach(n => {
    const date = new Date(n.timestamp).toLocaleDateString();
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(n);
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread notifications`}
        actions={
          <div className="flex items-center gap-3">
            {unreadCount > 0 && <Button variant="secondary" icon={<CheckCheck className="w-4 h-4" />} onClick={markAllRead}>Mark all as read</Button>}
          </div>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(['all', 'unread', 'read'] as const).map(f => (
          <button key={f} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-accent-indigo text-white' : 'bg-bg-surface border border-border-default text-text-secondary hover:text-text-primary'}`} onClick={() => setFilter(f)}>
            {f === 'all' ? `All (${items.length})` : f === 'unread' ? `Unread (${unreadCount})` : `Read (${items.length - unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notification list grouped by date */}
      {Object.keys(grouped).length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-surface-hover border border-border-default flex items-center justify-center"><Bell className="w-8 h-8 text-text-muted" /></div>
          <p className="text-text-secondary mb-2">No notifications</p>
          <p className="text-xs text-text-muted">You're all caught up!</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-text-muted uppercase mb-3">{date}</p>
              <div className="space-y-2">
                {items.map(n => (
                  <Card key={n.id} className={`p-4 flex items-start gap-3 cursor-pointer hover:bg-bg-surface-hover transition-all ${!n.read ? 'border-l-2 border-l-accent-indigo' : ''}`}>
                    <div className="shrink-0 mt-0.5">{typeIcons[n.type]}</div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${!n.read ? 'text-text-primary' : 'text-text-secondary'}`}>{n.title}</p>
                      <p className="text-xs text-text-muted mt-0.5">{n.message}</p>
                      <p className="text-xs text-text-muted mt-1">{new Date(n.timestamp).toLocaleTimeString()}</p>
                    </div>
                    {!n.read && (
                      <button className="shrink-0 text-xs text-accent-indigo hover:text-accent-violet transition-colors font-medium" onClick={() => markAsRead(n.id)}>Mark as read</button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
