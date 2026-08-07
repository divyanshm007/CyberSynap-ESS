import { useState } from 'react';
import { Download, ChevronDown, FileText, Sheet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';

interface Props {
  onExportCSV?: () => void;
  onExportPDF?: () => void;
  label?: string;
  className?: string;
}

function exportToCSV(data: Record<string, unknown>[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${filename}.csv`; a.click();
  URL.revokeObjectURL(url);
}

export { exportToCSV };

export default function ExportButton({ onExportCSV, onExportPDF, label = 'Export', className }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-sm font-medium text-[var(--text)] hover:bg-[var(--raised)] transition-colors"
      >
        <Download size={14} />
        {label}
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.96 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg overflow-hidden py-1"
            >
              {onExportCSV && (
                <button
                  onClick={() => { onExportCSV(); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--raised)] transition-colors"
                >
                  <Sheet size={14} className="text-green-500" />
                  Export CSV
                </button>
              )}
              {onExportPDF && (
                <button
                  onClick={() => { onExportPDF(); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--text)] hover:bg-[var(--raised)] transition-colors"
                >
                  <FileText size={14} className="text-red-500" />
                  Export PDF
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
