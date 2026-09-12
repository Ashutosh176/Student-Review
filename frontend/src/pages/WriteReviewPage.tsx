import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { institutionsApi } from '@/api/institutions.api';
import { reviewsApi } from '@/api/reviews.api';
import { verificationApi } from '@/api/verification.api';
import { apiErrorMessage } from '@/api/client';
import { WizardShell, OptionCard } from '@/components/WizardShell';
import { StarPicker } from '@/components/StarPicker';
import { Badge } from '@/components/Badge';
import { categoryLabel } from '@/components/RatingBar';
import { AddInstitutionModal } from '@/components/AddInstitutionModal';
import { VerificationGate } from '@/components/VerificationGate';
import type { CreateInstitutionInput } from '@/api/admin.api';
import type { RatingCategory } from '@/types';

const TOTAL_STEPS = 9;
const RATING_CATEGORIES: RatingCategory[] = [
  'OVERALL',
  'PLACEMENT',
  'FACULTY',
  'INFRASTRUCTURE',
  'ADMINISTRATION',
  'CAMPUS_LIFE',
  'VALUE_FOR_MONEY',
  'HOSTEL',
];

export function WriteReviewPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [collegeQuery, setCollegeQuery] = useState('');
  const [addCollegeOpen, setAddCollegeOpen] = useState(false);
  const [submittedCollegeName, setSubmittedCollegeName] = useState<string | null>(null);
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [institutionName, setInstitutionName] = useState<string | null>(null);
  const [institutionSlug, setInstitutionSlug] = useState<string | null>(null);
  const [relationship, setRelationship] = useState<'CURRENT_STUDENT' | 'ALUMNI' | 'FORMER_STUDENT' | null>(null);
  const [courseId, setCourseId] = useState<string | undefined>(undefined);
  const [batchYear, setBatchYear] = useState(new Date().getFullYear());
  const [ratings, setRatings] = useState<Record<RatingCategory, number>>({
    OVERALL: 0,
    PLACEMENT: 0,
    FACULTY: 0,
    INFRASTRUCTURE: 0,
    ADMINISTRATION: 0,
    CAMPUS_LIFE: 0,
    VALUE_FOR_MONEY: 0,
    HOSTEL: 0,
  });
  const [recommend, setRecommend] = useState<boolean | null>(null);
  const [body, setBody] = useState('');
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);

  const preselectedSlug = params.get('college');

  const preselected = useQuery({
    queryKey: ['institution', preselectedSlug],
    queryFn: () => institutionsApi.getBySlug(preselectedSlug!),
    enabled: Boolean(preselectedSlug) && !institutionId,
  });
  useEffect(() => {
    if (preselected.data && !institutionId) {
      setInstitutionId(preselected.data.id);
      setInstitutionName(preselected.data.name);
      setInstitutionSlug(preselected.data.slug);
    }
  }, [preselected.data, institutionId]);

  const searchQuery = useQuery({
    queryKey: ['institutions', 'wizard-search', collegeQuery],
    queryFn: () => institutionsApi.search(collegeQuery, 6),
    enabled: collegeQuery.length > 1,
  });

  const institutionDetail = useQuery({
    queryKey: ['institution-detail-for-review', institutionSlug],
    queryFn: () => institutionsApi.getBySlug(institutionSlug!),
    enabled: Boolean(institutionSlug),
  });

  const submitInstitutionMutation = useMutation({
    mutationFn: (input: CreateInstitutionInput) => institutionsApi.submit(input),
    onSuccess: (inst) => {
      setAddCollegeOpen(false);
      setSubmittedCollegeName(inst.name);
    },
  });

  const verificationsQuery = useQuery({ queryKey: ['verifications', 'mine'], queryFn: verificationApi.mine });
  const isVerifiedForSelectedInstitution = verificationsQuery.data?.some((v) => v.institutionId === institutionId && v.status === 'VERIFIED') ?? false;

  const submitMutation = useMutation({
    mutationFn: () =>
      reviewsApi.create({
        institutionId: institutionId!,
        courseId,
        relationship: relationship!,
        batchYear,
        body,
        recommend: recommend!,
        ratings: RATING_CATEGORIES.filter((c) => ratings[c] > 0).map((c) => ({ category: c, value: ratings[c] })),
        guidelinesAccepted: true,
      }),
  });

  function next() {
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }
  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  const stepLabels = [
    'Your college',
    'Your relationship',
    'Course / program',
    'Year / batch',
    'Ratings',
    'Recommendation',
    'Your experience',
    'Guidelines',
    'Submit',
  ];

  if (submitMutation.isSuccess) {
    return (
      <WizardShell step={TOTAL_STEPS} total={TOTAL_STEPS} label="Done">
        <div className="text-center">
          <div className="mx-auto mb-4.5 flex h-[60px] w-[60px] items-center justify-center rounded-full bg-success-bg text-2xl text-success">✓</div>
          <h2 className="mb-2 text-xl">Review submitted</h2>
          <p className="mx-auto max-w-xs text-[13.5px] text-sub">
            Thanks for helping other students. Your review is in the moderation queue and will publish shortly.
          </p>
          <button className="btn btn-primary mt-5" onClick={() => navigate(institutionSlug ? `/college/${institutionSlug}` : '/')}>
            Back to college profile
          </button>
        </div>
      </WizardShell>
    );
  }

  return (
    <WizardShell step={step} total={TOTAL_STEPS} label={stepLabels[step - 1]}>
      <Helmet>
        <title>Write a Review — StudentReview</title>
      </Helmet>

      {step === 1 && (
        <div>
          <h2 className="mb-2 text-xl">Which college is this review about?</h2>
          <p className="mb-5 text-[13.5px] text-sub">Search for your college or university.</p>
          {submittedCollegeName ? (
            <div className="card bg-surface text-center">
              <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-success-bg text-xl text-success">✓</div>
              <p className="mb-1 text-sm font-semibold">"{submittedCollegeName}" submitted for approval</p>
              <p className="text-[12.5px] text-sub">
                An admin will review it shortly. You'll get a notification once it's approved — come back here to write your review then.
              </p>
              <button className="btn btn-ghost mt-3" onClick={() => setSubmittedCollegeName(null)}>
                Search for a different college
              </button>
            </div>
          ) : institutionId && institutionName ? (
            <>
              <OptionCard selected onClick={() => {}}>
                {institutionName}
              </OptionCard>
              <VerificationGate institutionId={institutionId} institutionName={institutionName} />
            </>
          ) : (
            <>
              <input
                value={collegeQuery}
                onChange={(e) => setCollegeQuery(e.target.value)}
                placeholder="Search for a college..."
                className="mb-3 w-full rounded-md border border-line px-3 py-2.5 text-sm outline-none focus:border-brand"
              />
              {searchQuery.data?.map((inst) => (
                <OptionCard
                  key={inst.id}
                  selected={false}
                  onClick={() => {
                    setInstitutionId(inst.id);
                    setInstitutionName(inst.name);
                    setInstitutionSlug(inst.slug);
                  }}
                >
                  {inst.name}
                </OptionCard>
              ))}
              <button type="button" className="mt-2 text-[12.5px] text-brand hover:underline" onClick={() => setAddCollegeOpen(true)}>
                Can't find your college? Add it
              </button>
            </>
          )}
          {!submittedCollegeName && (
            <div className="mt-6 flex justify-end">
              <button disabled={!institutionId || !isVerifiedForSelectedInstitution} onClick={next} className="btn btn-primary">
                Continue
              </button>
            </div>
          )}
        </div>
      )}

      <AddInstitutionModal
        open={addCollegeOpen}
        onClose={() => setAddCollegeOpen(false)}
        onSubmit={(input) => submitInstitutionMutation.mutate(input)}
        submitting={submitInstitutionMutation.isPending}
        error={submitInstitutionMutation.error}
        heading="Add your college"
        helperText="It'll be reviewed by an admin before it's listed publicly — you'll be notified once it's approved."
        submitLabel="Submit for approval"
        submittingLabel="Submitting…"
      />

      {step === 2 && (
        <div>
          <h2 className="mb-2 text-xl">What's your relationship to this college?</h2>
          <p className="mb-5 text-[13.5px] text-sub">This helps other students weigh your perspective.</p>
          {(['CURRENT_STUDENT', 'ALUMNI', 'FORMER_STUDENT'] as const).map((r) => (
            <OptionCard key={r} selected={relationship === r} onClick={() => setRelationship(r)}>
              {{ CURRENT_STUDENT: 'Current Student', ALUMNI: 'Alumni', FORMER_STUDENT: 'Former Student' }[r]}
            </OptionCard>
          ))}
          <div className="mt-6 flex justify-between">
            <button onClick={back} className="btn btn-ghost">
              Back
            </button>
            <button disabled={!relationship} onClick={next} className="btn btn-primary">
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="mb-2 text-xl">Which course or program?</h2>
          <p className="mb-5 text-[13.5px] text-sub">Optional, but helps other students filter reviews relevant to them.</p>
          {(institutionDetail.data?.courses ?? []).map((c) => (
            <OptionCard key={c.id} selected={courseId === c.id} onClick={() => setCourseId(c.id)}>
              {c.name}
            </OptionCard>
          ))}
          <OptionCard selected={courseId === undefined} onClick={() => setCourseId(undefined)}>
            Prefer not to specify
          </OptionCard>
          <div className="mt-6 flex justify-between">
            <button onClick={back} className="btn btn-ghost">
              Back
            </button>
            <button onClick={next} className="btn btn-primary">
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 className="mb-2 text-xl">What year or batch?</h2>
          <p className="mb-5 text-[13.5px] text-sub">Your admission or graduation year.</p>
          <input
            type="number"
            value={batchYear}
            onChange={(e) => setBatchYear(Number(e.target.value))}
            min={1950}
            max={new Date().getFullYear() + 10}
            className="w-full rounded-md border border-line px-3 py-2.5 text-sm outline-none focus:border-brand"
          />
          <div className="mt-6 flex justify-between">
            <button onClick={back} className="btn btn-ghost">
              Back
            </button>
            <button onClick={next} className="btn btn-primary">
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h2 className="mb-2 text-xl">Rate your experience</h2>
          <p className="mb-5 text-[13.5px] text-sub">Tap to rate each category out of 5. Overall rating is required.</p>
          {RATING_CATEGORIES.map((c) => (
            <div key={c} className="mb-3.5 flex items-center justify-between">
              <span className="text-sm font-semibold">{categoryLabel(c)}</span>
              <StarPicker value={ratings[c]} onChange={(v) => setRatings((r) => ({ ...r, [c]: v }))} />
            </div>
          ))}
          <div className="mt-4 flex justify-between">
            <button onClick={back} className="btn btn-ghost">
              Back
            </button>
            <button disabled={ratings.OVERALL === 0} onClick={next} className="btn btn-primary">
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 6 && (
        <div>
          <h2 className="mb-2 text-xl">Would you recommend this college?</h2>
          <OptionCard selected={recommend === true} onClick={() => setRecommend(true)}>
            Yes
          </OptionCard>
          <OptionCard selected={recommend === false} onClick={() => setRecommend(false)}>
            No
          </OptionCard>
          <div className="mt-6 flex justify-between">
            <button onClick={back} className="btn btn-ghost">
              Back
            </button>
            <button disabled={recommend === null} onClick={next} className="btn btn-primary">
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 7 && (
        <div>
          <h2 className="mb-2 text-xl">Write your experience</h2>
          <p className="mb-5 text-[13.5px] text-sub">
            Share your genuine experience. Avoid personal information, threats, or unsupported accusations. Minimum 120 characters.
          </p>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[160px] w-full rounded-md border border-line p-3 text-sm outline-none focus:border-brand"
            placeholder="What was your experience like academically, socially, and with placements?"
          />
          <div className="mt-1 text-right text-xs text-sub">{body.length}/120 minimum</div>
          <div className="mt-4 flex justify-between">
            <button onClick={back} className="btn btn-ghost">
              Back
            </button>
            <button disabled={body.trim().length < 120} onClick={next} className="btn btn-primary">
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 8 && (
        <div>
          <h2 className="mb-2 text-xl">Confirm community guidelines</h2>
          <div className="mb-4 rounded-md bg-surface p-3 text-[13px] text-sub">
            <p>✓ Reviews should reflect your genuine, first-hand experience.</p>
            <p>✓ Avoid sharing anyone's personal information, including your own.</p>
            <p>✓ Legitimate criticism is always allowed — no review is removed just for being negative.</p>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={guidelinesAccepted} onChange={(e) => setGuidelinesAccepted(e.target.checked)} className="mt-0.5" />
            I confirm this review follows the Community Guidelines.
          </label>
          <div className="mt-6 flex justify-between">
            <button onClick={back} className="btn btn-ghost">
              Back
            </button>
            <button disabled={!guidelinesAccepted} onClick={next} className="btn btn-primary">
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 9 && (
        <div>
          <h2 className="mb-2 text-xl">Preview your review</h2>
          <p className="mb-5 text-[13.5px] text-sub">This is exactly how it will appear publicly.</p>
          <div className="card">
            <Badge kind="pending">Pending moderation</Badge>
            <div className="my-2 text-[12.5px] text-sub">
              {institutionName} · {relationship ? { CURRENT_STUDENT: 'Current Student', ALUMNI: 'Alumni', FORMER_STUDENT: 'Former Student' }[relationship] : ''} · {batchYear}
            </div>
            <div className="text-brand">{'★★★★★'.slice(0, ratings.OVERALL)}</div>
            <p className="mt-2 text-sm leading-relaxed">"{body}"</p>
          </div>
          {submitMutation.isError && <p className="mt-3 text-xs text-danger">{apiErrorMessage(submitMutation.error)}</p>}
          <div className="mt-6 flex justify-between">
            <button onClick={back} className="btn btn-ghost">
              Back
            </button>
            <button disabled={submitMutation.isPending} onClick={() => submitMutation.mutate()} className="btn btn-primary">
              {submitMutation.isPending ? 'Submitting…' : 'Submit review'}
            </button>
          </div>
        </div>
      )}
    </WizardShell>
  );
}
