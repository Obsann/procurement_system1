import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Bell } from 'lucide-react';
import { useGetNotificationsQuery, useMarkReadMutation, useMarkAllReadMutation } from '../../store/api/notificationsApi';
import { formatDateTime } from '../../lib/format';
import { Notification } from '../../types';
import { useToast } from '../../components/ui/useToast';
import { apiErrorMessage } from '../../lib/apiError';

export const NotificationsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = useGetNotificationsQuery({ page });
  const [markRead] = useMarkReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] = useMarkAllReadMutation();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleMarkAllRead = async () => {
    try {
      await markAllRead().unwrap();
      addToast('success', 'All notifications marked as read');
    } catch (error) {
      addToast('error', apiErrorMessage(error, 'Failed to mark all as read'));
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await markRead(notification.id).unwrap();
      } catch (error) {
        console.error('Failed to mark read', error);
      }
    }

    if (notification.entity_type && notification.entity_id) {
      if (notification.entity_type === 'requisition') {
        navigate(`/requisitions/${notification.entity_id}`);
      } else if (notification.entity_type === 'purchase_order') {
        navigate(`/purchase-orders/${notification.entity_id}`);
      }
    }
  };

  const unreadCount = data?.results.filter(n => !n.is_read).length || 0;
  const description = `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description={description}
        actions={
          <Button
            variant="secondary"
            onClick={handleMarkAllRead}
            disabled={!data?.results.length || isMarkingAll || unreadCount === 0}
            isLoading={isMarkingAll}
          >
            Mark all as read
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse h-24 border-border-default">
              <CardContent className="h-full" />
            </Card>
          ))}
        </div>
      ) : !data?.results.length ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          description="You don't have any notifications yet."
        />
      ) : (
        <div className="space-y-4">
          {data.results.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-colors hover:bg-bg-surface-hover ${
                !notification.is_read ? 'border-l-4 border-l-blue-500 bg-slate-800/30' : 'border-border-default'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-1">
                  <h4 className={`text-sm ${!notification.is_read ? 'font-bold text-slate-100' : 'font-medium text-slate-300'}`}>
                    {notification.title}
                  </h4>
                  <span className="text-xs text-slate-500">
                    {formatDateTime(notification.created_at)}
                  </span>
                </div>
                <p className="text-sm text-slate-400">
                  {notification.message}
                </p>
              </CardContent>
            </Card>
          ))}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="secondary"
              disabled={!data.previous}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-400">
              Page {page} of {Math.ceil((data.count || 1) / 10)}
            </span>
            <Button
              variant="secondary"
              disabled={!data.next}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
