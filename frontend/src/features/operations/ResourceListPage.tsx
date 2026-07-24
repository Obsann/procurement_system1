import { useCallback, useEffect, useState } from 'react';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

type Row = Record<string, unknown>;
type Action = { label: string; path: (row: Row) => string; method?: 'post' | 'patch' };
type ResourceListPageProps = {
  title: string; endpoint: string; emptyMessage: string; actions?: Action[]; readOnly?: boolean;
};
type ApiList = { results?: Row[] } | Row[];

const labelFor = (row: Row) => String(row.title || row.pr_number || row.rfq_number || row.po_number || row.grn_number || row.legal_name || row.action || row.id);
const statusFor = (row: Row) => String(row.status || row.action || 'Active');

export function ResourceListPage({ title, endpoint, emptyMessage, actions = [], readOnly = false }: ResourceListPageProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<Row | null>(null);
  const [draft, setDraft] = useState('{}');
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true); setError('');
    api.get<ApiList>(endpoint, { params: filter ? { search: filter } : undefined })
      .then(({ data }) => setRows(Array.isArray(data) ? data : data.results || []))
      .catch(() => setError('This information could not be loaded. Please try again.'))
      .finally(() => setLoading(false));
  }, [endpoint, filter]);

  useEffect(() => { load(); }, [load]);
  const select = (row: Row) => { setSelected(row); setDraft(JSON.stringify(row, null, 2)); setError(''); };
  const create = () => { setSelected(null); setDraft('{}'); setError(''); };

  const save = async () => {
    try {
      setSaving(true); setError('');
      const body = JSON.parse(draft) as Row;
      if (selected?.id) await api.patch(`${endpoint}${selected.id}/`, body);
      else await api.post(endpoint, body);
      create(); load();
    } catch (err: unknown) {
      const response = (err as { response?: { data?: { error?: { message?: string } } } }).response;
      setError(response?.data?.error?.message || 'Save failed. Check the JSON fields and permissions.');
    } finally { setSaving(false); }
  };

  const runAction = async (action: Action) => {
    if (!selected) return;
    try { setSaving(true); setError(''); await api[action.method || 'post'](action.path(selected)); load(); }
    catch { setError(`${action.label} could not be completed.`); }
    finally { setSaving(false); }
  };

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h2 className="text-2xl font-bold text-slate-100">{title}</h2><p className="text-sm text-slate-400 mt-1">Create, update, search, and progress workflow records.</p></div>
      {!readOnly && <Button onClick={create}>New record</Button>}
    </div>
    <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
      <Card><CardHeader><div className="flex gap-2"><CardTitle className="flex-1">Records</CardTitle><input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search" className="w-36 rounded bg-slate-800 px-2 text-sm" /></div></CardHeader><CardContent>
        {loading && <p className="text-slate-400">Loading…</p>}{!loading && rows.length === 0 && <p className="text-slate-400">{emptyMessage}</p>}
        <div className="divide-y divide-slate-800">{rows.map((row) => <button key={String(row.id)} onClick={() => select(row)} className="flex w-full items-center justify-between gap-4 py-3 text-left hover:bg-slate-800/40"><span className="truncate text-sm text-slate-100">{labelFor(row)}</span><span className="rounded-full bg-slate-800 px-2.5 py-1 text-xs text-slate-300">{statusFor(row).replaceAll('_', ' ')}</span></button>)}</div>
      </CardContent></Card>
      {!readOnly && <Card><CardHeader><CardTitle>{selected ? 'Edit record' : 'Create record'}</CardTitle></CardHeader><CardContent className="space-y-3">
        <p className="text-xs text-slate-400">Use the API field names. Related records are their UUIDs.</p>
        <textarea value={draft} onChange={(e) => setDraft(e.target.value)} className="h-72 w-full rounded border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-slate-200" aria-label="Record JSON" />
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <div className="flex flex-wrap gap-2"><Button onClick={save} isLoading={saving}>{selected ? 'Save changes' : 'Create'}</Button>{selected && actions.map((action) => <Button key={action.label} variant="secondary" onClick={() => runAction(action)} disabled={saving}>{action.label}</Button>)}</div>
      </CardContent></Card>}
    </div>
  </div>;
}
