import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Search } from 'lucide-react';
import { useAuth } from '@/hooks';
import { query } from '@/services/storage.service';
import { PageHeader, StatusBadge } from '@/components/shared';
import { fmtDate } from '@/utils/date';
import { formatBytes } from '@/utils/format';
import type { Document, DocCategory } from '@/types';
import toast from 'react-hot-toast';

const CATEGORY_LABELS: Record<DocCategory, string> = {
  contract: 'Contract', policy: 'Policy', certificate: 'Certificate',
  id_proof: 'ID Proof', appraisal: 'Appraisal', offer_letter: 'Offer Letter', other: 'Other',
};

export default function Documents() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState<string>('all');

  const docs = useMemo(() =>
    query<Document>('documents', d => d.userId === user!.id || d.isShared)
      .sort((a,b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()),
    [user]);

  const filtered = docs.filter(d =>
    (cat === 'all' || d.category === cat) &&
    (d.name.toLowerCase().includes(search.toLowerCase())));

  const categories = ['all', ...Array.from(new Set(docs.map(d => d.category)))];

  const MIME_ICON: Record<string, string> = {
    'application/pdf': '📄', 'image/jpeg': '🖼️', 'image/png': '🖼️',
    'application/msword': '📝', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Documents" subtitle="Your personal and shared company documents." />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents…"
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--plasma)]" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${cat === c ? 'bg-[var(--plasma)] text-white' : 'border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--raised)]'}`}>
              {c === 'all' ? 'All' : CATEGORY_LABELS[c as DocCategory] ?? c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((doc, i) => (
          <motion.div key={doc.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--raised)] flex items-center justify-center text-xl flex-shrink-0">
                {MIME_ICON[doc.mimeType] ?? '📁'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text)] truncate">{doc.name}</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{formatBytes(doc.size)} · {fmtDate(doc.uploadedAt)}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <StatusBadge variant={doc.category} size="sm" />
              <button onClick={() => toast.success('Download started!')}
                className="flex items-center gap-1 text-xs text-[var(--plasma)] hover:underline">
                <Download size={12}/> Download
              </button>
            </div>
            {doc.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {doc.tags.map(t => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--raised)] text-[var(--text-muted)]">{t}</span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
        {!filtered.length && (
          <div className="col-span-3 text-center py-12 text-sm text-[var(--text-muted)]">No documents found.</div>
        )}
      </div>
    </div>
  );
}
