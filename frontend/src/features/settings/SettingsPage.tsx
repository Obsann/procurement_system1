import React from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAuth } from '../../hooks/useAuth';
import { displayName } from '../../lib/user';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="View your profile and system information."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border-default">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-text-primary">User Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-secondary">Name</label>
              <div className="mt-1 text-text-primary">{displayName(user)}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Email</label>
              <div className="mt-1 text-text-primary">{user?.email || 'N/A'}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Department</label>
              <div className="mt-1 text-text-primary">{user?.department?.name || 'N/A'}</div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Roles</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {user?.roles?.map(role => (
                  <StatusBadge key={role.id} status={role.name} />
                ))}
                {!user?.roles?.length && <span className="text-text-muted">No roles assigned</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border-default">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-text-primary">System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-secondary">Version</label>
              <div className="mt-1 text-text-primary">v1.0.0</div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-secondary">Environment</label>
              <div className="mt-1 text-text-primary">{import.meta.env.MODE || 'development'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
