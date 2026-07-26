import { useState } from 'react';
import { Eye, EyeOff, Lock, Bell, Moon, Sun } from 'lucide-react';
import { PageHeader, Card, Input, Button } from '../components/ui';
import { users, currentUserId, roleLabels } from '../mockData';

export function Settings() {
  const currentUser = users.find(u => u.id === currentUserId) || users[0];
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [notifApprovals, setNotifApprovals] = useState(true);
  const [notifRFQs, setNotifRFQs] = useState(true);
  const [notifPOs, setNotifPOs] = useState(true);
  const [notifReceipts, setNotifReceipts] = useState(true);
  const [notifSystem, setNotifSystem] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl">
      <PageHeader title="Profile & Settings" description="Manage your account preferences" />

      {/* Profile card */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-accent-violet/20 flex items-center justify-center text-accent-violet text-2xl font-bold shrink-0">
            {currentUser.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-lg font-semibold text-text-primary">{currentUser.name}</p>
            <p className="text-sm text-text-secondary">{currentUser.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-accent-indigo/20 text-accent-indigo">{roleLabels[currentUser.role]}</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-bg-surface-hover text-text-secondary">{currentUser.department}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Change password */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-text-muted" />Change Password</h3>
        <div className="space-y-4">
          <div className="relative">
            <Input label="Current Password" type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
            <button type="button" className="absolute right-3 top-[38px] text-text-muted hover:text-text-secondary" onClick={() => setShowCurrent(!showCurrent)}>
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <div className="relative">
            <Input label="New Password" type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
            <button type="button" className="absolute right-3 top-[38px] text-text-muted hover:text-text-secondary" onClick={() => setShowNew(!showNew)}>
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
          <Button variant="primary" icon={<Lock className="w-4 h-4" />}>Update Password</Button>
        </div>
      </Card>

      {/* Notification preferences */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-text-muted" />Notification Preferences</h3>
        <div className="space-y-4">
          {[
            { label: 'Approval requests', desc: 'Get notified when items need your approval', value: notifApprovals, setter: setNotifApprovals },
            { label: 'RFQ updates', desc: 'Bid submissions and RFQ deadline reminders', value: notifRFQs, setter: setNotifRFQs },
            { label: 'Purchase Order updates', desc: 'PO status changes and financial reviews', value: notifPOs, setter: setNotifPOs },
            { label: 'Goods Receipt alerts', desc: 'Delivery confirmations and partial receipts', value: notifReceipts, setter: setNotifReceipts },
            { label: 'System announcements', desc: 'Platform updates and maintenance notices', value: notifSystem, setter: setNotifSystem },
          ].map(pref => (
            <div key={pref.label} className="flex items-center justify-between p-3 rounded-lg bg-bg-surface-hover">
              <div>
                <p className="text-sm font-medium text-text-primary">{pref.label}</p>
                <p className="text-xs text-text-muted">{pref.desc}</p>
              </div>
              <button
                className={`w-12 h-6 rounded-full transition-all duration-200 relative ${pref.value ? 'bg-accent-indigo' : 'bg-bg-deep border border-border-default'}`}
                onClick={() => pref.setter(!pref.value)}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200 ${pref.value ? 'left-6.5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Theme */}
      <Card className="p-6">
        <h3 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2">
          {darkMode ? <Moon className="w-5 h-5 text-text-muted" /> : <Sun className="w-5 h-5 text-text-muted" />}
          Theme
        </h3>
        <div className="flex items-center gap-3">
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${darkMode ? 'bg-accent-indigo text-white' : 'bg-bg-surface-hover text-text-secondary border border-border-default'}`} onClick={() => setDarkMode(true)}>
            <Moon className="w-4 h-4" /> Dark
          </button>
          <button className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${!darkMode ? 'bg-accent-indigo text-white' : 'bg-bg-surface-hover text-text-secondary border border-border-default'}`} onClick={() => setDarkMode(false)}>
            <Sun className="w-4 h-4" /> Light
          </button>
        </div>
      </Card>
    </div>
  );
}
