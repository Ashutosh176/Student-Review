import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { verificationApi, type VerificationRelationship } from '@/api/verification.api';
import { apiErrorMessage } from '@/api/client';
import { Badge } from './Badge';
import { OptionCard } from './WizardShell';

const RELATIONSHIP_LABEL: Record<VerificationRelationship, string> = {
  CURRENT_STUDENT: 'Current Student',
  ALUMNI: 'Former Student / Alumni',
  FORMER_STUDENT: 'Former Student / Alumni',
};

function RelationshipPicker({ value, onChange }: { value: VerificationRelationship | null; onChange: (v: VerificationRelationship) => void }) {
  return (
    <>
      <OptionCard selected={value === 'CURRENT_STUDENT'} onClick={() => onChange('CURRENT_STUDENT')}>
        Current Student
      </OptionCard>
      <OptionCard selected={value === 'ALUMNI'} onClick={() => onChange('ALUMNI')}>
        Former Student / Alumni
      </OptionCard>
    </>
  );
}

export function VerificationGate({
  institutionId,
  institutionName,
  onVerified,
}: {
  institutionId: string;
  institutionName: string;
  onVerified?: () => void;
}) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'email' | 'document'>('email');
  const [relationship, setRelationship] = useState<VerificationRelationship | null>(null);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [note, setNote] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [resendAvailableAt, setResendAvailableAt] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState(0);

  const query = useQuery({ queryKey: ['verifications', 'mine'], queryFn: verificationApi.mine });
  const current = query.data?.find((v) => v.institutionId === institutionId);

  useEffect(() => {
    if (current?.status === 'VERIFIED') onVerified?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.status]);

  useEffect(() => {
    if (!resendAvailableAt) return;
    const id = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((resendAvailableAt - Date.now()) / 1000));
      setCooldown(remaining);
      if (remaining <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [resendAvailableAt]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ['verifications', 'mine'] });

  const startMutation = useMutation({
    mutationFn: () => verificationApi.start({ institutionId, relationship: relationship!, universityEmail: email }),
    onSuccess: () => {
      setResendAvailableAt(Date.now() + 60_000);
      invalidate();
    },
  });

  const verifyMutation = useMutation({
    mutationFn: () => verificationApi.verifyOtp({ institutionId, code }),
    onSuccess: invalidate,
  });

  const resendMutation = useMutation({
    mutationFn: () => verificationApi.resendOtp(institutionId),
    onSuccess: () => {
      setResendAvailableAt(Date.now() + 60_000);
      invalidate();
    },
  });

  const documentMutation = useMutation({
    mutationFn: () => verificationApi.submitDocument({ institutionId, relationship: relationship!, note: note || undefined, document: file! }),
    onSuccess: invalidate,
  });

  const cancelMutation = useMutation({
    mutationFn: () => verificationApi.cancel(institutionId),
    onSuccess: () => {
      setEmail('');
      setCode('');
      setRelationship(null);
      invalidate();
    },
  });

  if (query.isLoading) return <p className="text-[12.5px] text-sub">Checking verification status…</p>;

  if (current?.status === 'VERIFIED') {
    return (
      <div className="card bg-surface">
        <Badge kind="verified">✓ Verified</Badge>
        <p className="mt-2 text-[12.5px] text-sub">
          You're verified as {RELATIONSHIP_LABEL[current.relationship]} at {institutionName}.
        </p>
      </div>
    );
  }

  if (current?.status === 'PENDING' && current.method === 'DOCUMENT_UPLOAD') {
    return (
      <div className="card bg-surface">
        <Badge kind="pending">Pending admin review</Badge>
        <p className="mt-2 text-[12.5px] text-sub">
          Your document is being reviewed by an admin. You'll be notified once it's approved — come back here to write your review then.
        </p>
        {cancelMutation.isError && <p className="mt-2 text-xs text-danger">{apiErrorMessage(cancelMutation.error)}</p>}
        <button type="button" className="mt-2 text-[12px] text-sub hover:underline" disabled={cancelMutation.isPending} onClick={() => cancelMutation.mutate()}>
          {cancelMutation.isPending ? 'Cancelling…' : 'Cancel and start over'}
        </button>
      </div>
    );
  }

  if (current?.status === 'PENDING' && current.method === 'EMAIL_OTP') {
    return (
      <div className="card bg-surface">
        <h4 className="mb-1 text-sm font-semibold">Enter your verification code</h4>
        <p className="mb-3 text-[12.5px] text-sub">We sent a 6-digit code to {current.universityEmail}.</p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="123456"
          inputMode="numeric"
          className="mb-2 w-full rounded-md border border-line px-3 py-2.5 text-center text-lg tracking-[0.3em] outline-none focus:border-brand"
        />
        {verifyMutation.isError && <p className="mb-2 text-xs text-danger">{apiErrorMessage(verifyMutation.error)}</p>}
        {resendMutation.isError && <p className="mb-2 text-xs text-danger">{apiErrorMessage(resendMutation.error)}</p>}
        {cancelMutation.isError && <p className="mb-2 text-xs text-danger">{apiErrorMessage(cancelMutation.error)}</p>}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            className="text-[12.5px] text-brand hover:underline disabled:cursor-not-allowed disabled:text-sub disabled:no-underline"
            disabled={cooldown > 0 || resendMutation.isPending}
            onClick={() => resendMutation.mutate()}
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : resendMutation.isPending ? 'Sending…' : 'Resend code'}
          </button>
          <button type="button" className="btn btn-primary btn-sm" disabled={code.length !== 6 || verifyMutation.isPending} onClick={() => verifyMutation.mutate()}>
            {verifyMutation.isPending ? 'Verifying…' : 'Verify'}
          </button>
        </div>
        <button
          type="button"
          className="mt-2 text-[12px] text-sub hover:underline"
          disabled={cancelMutation.isPending}
          onClick={() => cancelMutation.mutate()}
        >
          {cancelMutation.isPending ? 'Cancelling…' : 'Use a different email'}
        </button>
      </div>
    );
  }

  // No active attempt (first time, or previous REJECTED/EXPIRED) — offer both paths.
  return (
    <div className="card bg-surface">
      <h4 className="mb-1 text-sm font-semibold">Verify your student identity</h4>
      <p className="mb-3 text-[12.5px] text-sub">Only verified students or alumni can write a review for {institutionName}.</p>
      {current?.status === 'REJECTED' && current.rejectionReason && (
        <p className="mb-3 rounded-md bg-danger/10 p-2 text-[12px] text-danger">Your last submission was rejected: {current.rejectionReason}</p>
      )}
      <div className="mb-3 flex gap-2 text-[12.5px]">
        <button type="button" className={`btn btn-sm ${tab === 'email' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('email')}>
          University email
        </button>
        <button type="button" className={`btn btn-sm ${tab === 'document' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('document')}>
          Upload ID / document instead
        </button>
      </div>

      <RelationshipPicker value={relationship} onChange={setRelationship} />

      {tab === 'email' ? (
        <>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu.in"
            className="mb-2 w-full rounded-md border border-line px-3 py-2.5 text-sm outline-none focus:border-brand"
          />
          <p className="mb-2 rounded-md bg-warning-bg px-2.5 py-2 text-[11.5px] text-warning">
            Heads-up: the code is sent to your college mailbox, which your college's IT team can technically see. If you'd rather your college not
            know you're using StudentReview, use "Upload ID / document instead" — it never touches college email.
          </p>
          {startMutation.isError && <p className="mb-2 text-xs text-danger">{apiErrorMessage(startMutation.error)}</p>}
          <button
            type="button"
            className="btn btn-primary btn-sm w-full justify-center"
            disabled={!relationship || !email || startMutation.isPending}
            onClick={() => startMutation.mutate()}
          >
            {startMutation.isPending ? 'Sending code…' : 'Send verification code'}
          </button>
        </>
      ) : (
        <>
          <p className="mb-2 text-[11.5px] text-sub">
            Upload an ID card or degree certificate — only StudentReview's admin reviews it, and your college is never contacted. Your document is
            deleted if you erase your account. (Also use this if your official email no longer works.)
          </p>
          <input
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="mb-2 w-full text-[12.5px]"
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note, e.g. graduated 2019, official email deactivated"
            rows={2}
            className="mb-2 w-full rounded-md border border-line p-2.5 text-[12.5px] outline-none focus:border-brand"
          />
          {documentMutation.isError && <p className="mb-2 text-xs text-danger">{apiErrorMessage(documentMutation.error)}</p>}
          <button
            type="button"
            className="btn btn-primary btn-sm w-full justify-center"
            disabled={!relationship || !file || documentMutation.isPending}
            onClick={() => documentMutation.mutate()}
          >
            {documentMutation.isPending ? 'Submitting…' : 'Submit for admin review'}
          </button>
        </>
      )}
    </div>
  );
}
