import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '@/utils/cn';

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'default';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  variant = 'danger', loading, onConfirm, onCancel,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="relative z-10 w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl p-6"
          >
            <button onClick={onCancel} className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--raised)]">
              <X size={16} />
            </button>
            <div className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center mb-4',
              variant === 'danger' ? 'bg-red-500/12' : variant === 'warning' ? 'bg-amber-500/12' : 'bg-[var(--plasma-soft)]',
            )}>
              <AlertTriangle size={20} className={cn(
                variant === 'danger' ? 'text-red-500' : variant === 'warning' ? 'text-amber-500' : 'text-[var(--plasma)]',
              )} />
            </div>
            <h3 className="text-base font-semibold text-[var(--text)] mb-1">{title}</h3>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">{description}</p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 rounded-lg border border-[var(--border)] text-sm font-medium text-[var(--text)] hover:bg-[var(--raised)] transition-colors"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={cn(
                  'flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50',
                  variant === 'danger' ? 'bg-red-500 hover:bg-red-600' :
                  variant === 'warning' ? 'bg-amber-500 hover:bg-amber-600' :
                  'bg-[var(--plasma)] hover:bg-blue-600',
                )}
              >
                {loading ? 'Processing…' : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
