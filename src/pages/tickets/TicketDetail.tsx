import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send } from 'lucide-react';
import { v4 as uuid } from 'uuid';
import { useAuth } from '@/hooks';
import { getById, update } from '@/services/storage.service';
import { StatusBadge } from '@/components/shared';
import { timeAgo } from '@/utils/date';
import { ROUTES } from '@/constants';
import type { Ticket, TicketComment } from '@/types';
import toast from 'react-hot-toast';

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [ticket, setTicket] = useState(() => getById<Ticket>('tickets', id!));

  if (!ticket) return <div className="text-sm text-[var(--text-muted)] p-8">Ticket not found.</div>;

  const addComment = () => {
    if (!comment.trim()) return;
    const newComment: TicketComment = { id: uuid(), userId: user!.id, message: comment, isInternal: false, createdAt: new Date().toISOString() };
    const updated = update<Ticket>('tickets', ticket.id, { comments: [...ticket.comments, newComment] });
    setTicket(updated);
    setComment('');
    toast.success('Comment added.');
  };

  return (
    <div className="max-w-2xl space-y-5">
      <button onClick={() => navigate(ROUTES.TICKETS)} className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)]">
        <ArrowLeft size={14}/> Back to Tickets
      </button>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-mono text-[var(--plasma)] mb-1">{ticket.ticketNumber}</p>
            <h2 className="text-base font-semibold text-[var(--text)]">{ticket.subject}</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">Raised {timeAgo(ticket.createdAt)}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <StatusBadge variant={ticket.priority} size="md" />
            <StatusBadge variant={ticket.status}   size="md" />
          </div>
        </div>
        <div className="flex gap-3 mb-5">
          <StatusBadge variant={ticket.category} size="sm" />
        </div>
        <p className="text-sm text-[var(--text)] leading-relaxed whitespace-pre-wrap border border-[var(--border)] rounded-lg p-4 bg-[var(--raised)]">
          {ticket.description}
        </p>
      </div>

      {/* Comments */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <p className="text-sm font-semibold text-[var(--text)] mb-4">Comments ({ticket.comments.length})</p>
        <div className="space-y-3 mb-4">
          {ticket.comments.map(c => (
            <div key={c.id} className={`flex gap-3 ${c.userId === user?.id ? 'flex-row-reverse' : ''}`}>
              <div className="w-7 h-7 rounded-full bg-[var(--plasma-soft)] flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-[var(--plasma)]">
                {c.userId === user?.id ? 'ME' : 'HR'}
              </div>
              <div className={`max-w-[75%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                c.userId === user?.id ? 'bg-[var(--plasma)] text-white' : 'bg-[var(--raised)] text-[var(--text)]'}`}>
                <p>{c.message}</p>
                <p className={`text-[10px] mt-1 ${c.userId === user?.id ? 'text-white/60' : 'text-[var(--text-muted)]'}`}>{timeAgo(c.createdAt)}</p>
              </div>
            </div>
          ))}
          {!ticket.comments.length && <p className="text-xs text-[var(--text-muted)]">No comments yet.</p>}
        </div>
        {ticket.status !== 'closed' && (
          <div className="flex gap-2">
            <input value={comment} onChange={e => setComment(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && addComment()}
              placeholder="Add a comment…"
              className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--raised)] text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--plasma)]" />
            <button onClick={addComment} className="p-2 rounded-lg bg-[var(--plasma)] text-white hover:opacity-90">
              <Send size={14}/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
