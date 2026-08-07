import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Phone, MapPin, Calendar, Briefcase, Users, Heart, CreditCard, Save, X } from 'lucide-react';
import { useAuth } from '@/hooks';
import { update } from '@/services/storage.service';
import { PageHeader, StatusBadge } from '@/components/shared';
import { fmtDate } from '@/utils/date';
import { getInitials } from '@/utils';
import toast from 'react-hot-toast';

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-[var(--raised)]">
      <span className="text-[var(--text-muted)] mt-0.5">{icon}</span>
      <div>
        <p className="text-[11px] uppercase tracking-wide text-[var(--text-muted)] font-semibold">{label}</p>
        <p className="text-sm text-[var(--text)] font-medium mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function Profile() {
  const { user, session, setSession } = useAuth() as any;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ phone: user?.phone ?? '', bio: user?.bio ?? '', location: user?.location ?? '' });

  if (!user) return null;

  const handleSave = () => {
    update('users', user.id, form as any);
    // Update session
    if (session) {
      const updated = { ...session, user: { ...session.user, ...form } };
      localStorage.setItem('cybersynap_auth', JSON.stringify(updated));
      setSession(updated);
    }
    toast.success('Profile updated.');
    setEditing(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        subtitle="View and manage your personal information."
        actions={
          editing ? (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text-muted)] hover:bg-[var(--raised)]">
                <X size={14} /> Cancel
              </button>
              <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--plasma)] text-white text-sm font-medium hover:opacity-90">
                <Save size={14} /> Save Changes
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] text-sm text-[var(--text)] hover:bg-[var(--raised)]">
              <Edit3 size={14} /> Edit Profile
            </button>
          )
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Avatar card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col items-center text-center"
        >
          <div className="w-24 h-24 rounded-2xl overflow-hidden bg-[var(--plasma-soft)] flex items-center justify-center mb-4">
            {user.avatar
              ? <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
              : <span className="text-2xl font-bold text-[var(--plasma)]">{getInitials(`${user.firstName} ${user.lastName}`)}</span>
            }
          </div>
          <h2 className="text-base font-bold text-[var(--text)]">{user.firstName} {user.lastName}</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{user.designation}</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{user.department}</p>
          <div className="mt-3 flex items-center gap-2">
            <StatusBadge variant={user.status} size="md" />
            <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--raised)] px-2 py-0.5 rounded-full">{user.employeeId}</span>
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--border)] w-full">
            <p className="text-xs text-[var(--text-muted)] text-left mb-2 font-semibold uppercase tracking-wide">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {user.skills.map((s: string) => (
                <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--plasma-soft)] text-[var(--plasma)]">{s}</span>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right: Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}
          className="lg:col-span-2 space-y-4"
        >
          {/* Work Info */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">Work Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <InfoItem icon={<Briefcase size={14}/>} label="Designation" value={user.designation} />
              <InfoItem icon={<Users size={14}/>} label="Department" value={user.department} />
              <InfoItem icon={<Calendar size={14}/>} label="Joined On" value={fmtDate(user.joinDate)} />
              <InfoItem icon={<MapPin size={14}/>} label="Location" value={editing ? '' : user.location} />
            </div>
            {editing && (
              <div className="mt-3">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Location</label>
                <input value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--raised)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--plasma)]" />
              </div>
            )}
          </div>

          {/* Personal Info */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">Personal Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <InfoItem icon={<Calendar size={14}/>} label="Date of Birth" value={fmtDate(user.dateOfBirth)} />
              <InfoItem icon={<Heart size={14}/>} label="Blood Group" value={user.bloodGroup} />
              <InfoItem icon={<Phone size={14}/>} label="Phone" value={editing ? '' : user.phone} />
              <InfoItem icon={<CreditCard size={14}/>} label="Bank Account" value={user.bankAccount} />
            </div>
            {editing && (
              <div className="mt-3">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--raised)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--plasma)]" />
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">Bio</p>
            {editing ? (
              <textarea value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} rows={3}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--raised)] text-sm text-[var(--text)] focus:outline-none focus:border-[var(--plasma)] resize-none" />
            ) : (
              <p className="text-sm text-[var(--text-muted)] leading-relaxed">{user.bio || 'No bio added yet.'}</p>
            )}
          </div>

          {/* Emergency Contact */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-3">Emergency Contact</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <InfoItem icon={<Users size={14}/>} label="Name" value={user.emergencyContact.name} />
              <InfoItem icon={<Heart size={14}/>} label="Relation" value={user.emergencyContact.relation} />
              <InfoItem icon={<Phone size={14}/>} label="Phone" value={user.emergencyContact.phone} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
