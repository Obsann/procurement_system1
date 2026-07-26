import { useState } from 'react';
import { Plus, Search, Mail, Phone, MapPin, X, UserCircle } from 'lucide-react';
import { PageHeader, StatusBadge, Button, Input, Card } from '../components/ui';
import { suppliers } from '../mockData';
import type { Supplier } from '../types';

export function SupplierDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const filtered = suppliers.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false;
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const openDrawer = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setDrawerOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <PageHeader title="Supplier Directory" description="Manage supplier relationships and contacts" actions={<Button variant="primary" icon={<Plus className="w-4 h-4" />}>Add Supplier</Button>} />

      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]"><Input placeholder="Search suppliers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} icon={<Search className="w-4 h-4" />} /></div>
          <div className="flex items-center gap-2">
            {['all', 'ACTIVE', 'INACTIVE', 'PENDING'].map(status => (
              <button key={status} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === status ? 'bg-accent-indigo text-white' : 'bg-bg-surface-hover text-text-muted hover:text-text-secondary'}`} onClick={() => setStatusFilter(status)}>
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Supplier cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(supplier => (
          <Card key={supplier.id} className="p-5 cursor-pointer hover:bg-bg-surface-hover transition-all" onClick={() => openDrawer(supplier)}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-indigo/10 flex items-center justify-center text-accent-indigo font-bold text-sm">{supplier.name.charAt(0)}</div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{supplier.name}</p>
                  <p className="text-xs text-text-muted">{supplier.category}</p>
                </div>
              </div>
              <StatusBadge status={supplier.status} />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-text-secondary"><UserCircle className="w-3.5 h-3.5 text-text-muted" />{supplier.contactPerson}</div>
              <div className="flex items-center gap-2 text-xs text-text-secondary"><Mail className="w-3.5 h-3.5 text-text-muted" />{supplier.email}</div>
              <div className="flex items-center gap-2 text-xs text-text-secondary"><Phone className="w-3.5 h-3.5 text-text-muted" />{supplier.phone}</div>
              <div className="flex items-center gap-2 text-xs text-text-secondary"><MapPin className="w-3.5 h-3.5 text-text-muted" />{supplier.address}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Side drawer */}
      {drawerOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute right-0 top-0 bottom-0 w-[480px] bg-bg-surface border-l border-border-default shadow-xl overflow-y-auto animate-slideInRight" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-accent-indigo/10 flex items-center justify-center text-accent-indigo font-bold text-lg">{selectedSupplier.name.charAt(0)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{selectedSupplier.name}</h3>
                    <StatusBadge status={selectedSupplier.status} />
                  </div>
                </div>
                <button onClick={() => setDrawerOpen(false)} className="text-text-muted hover:text-text-primary transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <Card className="p-4 space-y-3">
                <h4 className="text-sm font-semibold text-text-primary">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><UserCircle className="w-4 h-4 text-text-muted" /><span className="text-sm text-text-secondary">{selectedSupplier.contactPerson}</span></div>
                  <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-text-muted" /><span className="text-sm text-text-secondary">{selectedSupplier.email}</span></div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-text-muted" /><span className="text-sm text-text-secondary">{selectedSupplier.phone}</span></div>
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-text-muted" /><span className="text-sm text-text-secondary">{selectedSupplier.address}</span></div>
                </div>
              </Card>

              <Card className="p-4 space-y-3">
                <h4 className="text-sm font-semibold text-text-primary">Category</h4>
                <p className="text-sm text-text-secondary">{selectedSupplier.category}</p>
              </Card>

              <Card className="p-4">
                <h4 className="text-sm font-semibold text-text-primary mb-3">Contacts List</h4>
                <div className="space-y-3">
                  {selectedSupplier.contacts.map(contact => (
                    <div key={contact.id} className="flex items-start gap-3 p-3 rounded-lg bg-bg-surface-hover">
                      <div className="w-8 h-8 rounded-full bg-accent-violet/10 flex items-center justify-center text-accent-violet text-xs font-bold">{contact.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{contact.name}</p>
                        <p className="text-xs text-text-muted">{contact.role}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-text-secondary">{contact.email}</span>
                          <span className="text-xs text-text-secondary">{contact.phone}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex items-center gap-3">
                <Button variant="primary">Edit Supplier</Button>
                <Button variant="danger">Deactivate</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
