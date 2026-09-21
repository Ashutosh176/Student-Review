import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi, type CreateInstitutionInput } from '@/api/admin.api';
import { apiErrorMessage } from '@/api/client';
import { INSTITUTION_TYPES, INSTITUTION_TYPE_LABELS } from '@/utils/institutionTypes';
import { INDIA_STATES, citiesForState } from '@/utils/indiaLocations';

const EMPTY: CreateInstitutionInput = {
  name: '',
  type: 'OTHER',
  city: '',
  state: '',
  establishedYear: undefined,
  website: '',
  description: '',
};

export function AddInstitutionModal({
  open,
  onClose,
  onSubmit,
  submitting,
  error,
  heading = 'Add institution',
  helperText = 'Creates an unclaimed, unverified profile. Organizations can claim it later.',
  submitLabel = 'Create institution',
  submittingLabel = 'Creating…',
  initialName = '',
  initialValues,
  showAdmissionProcess = false,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateInstitutionInput) => void;
  submitting?: boolean;
  error?: unknown;
  heading?: string;
  helperText?: string;
  submitLabel?: string;
  submittingLabel?: string;
  initialName?: string;
  // Edit mode: start from an existing institution's values instead of a blank form.
  initialValues?: Partial<CreateInstitutionInput>;
  showAdmissionProcess?: boolean;
}) {
  const [form, setForm] = useState<CreateInstitutionInput>(EMPTY);
  const categoriesQuery = useQuery({ queryKey: ['admin', 'categories'], queryFn: adminApi.categories, enabled: open });

  useEffect(() => {
    if (open) setForm({ ...EMPTY, name: initialName, ...initialValues });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  function update<K extends keyof CreateInstitutionInput>(key: K, value: CreateInstitutionInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-[480px] rounded-2xl border border-line bg-white p-8 shadow-xl">
        <h2 className="mb-1 text-lg font-bold">{heading}</h2>
        <p className="mb-4 text-xs text-sub">{helperText}</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
        >
          <div className="field">
            <label>Name</label>
            <input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. IIT Guwahati" />
          </div>
          <div className="field">
            <label>Type</label>
            <select value={form.type} onChange={(e) => update('type', e.target.value as CreateInstitutionInput['type'])}>
              {INSTITUTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {INSTITUTION_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-1 grid grid-cols-2 gap-3">
            <div className="field">
              <label>State / UT</label>
              <select
                required
                value={form.state}
                onChange={(e) => setForm((f) => ({ ...f, state: e.target.value, city: '' }))}
              >
                <option value="">Select state</option>
                {INDIA_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>City</label>
              <input
                required
                list="institution-city-options"
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                placeholder={form.state ? 'Select or type a city' : 'Select a state first'}
                disabled={!form.state}
                autoComplete="off"
              />
              <datalist id="institution-city-options">
                {citiesForState(form.state).map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>
          <div className="field">
            <label>Category</label>
            <select value={form.categoryId ?? ''} onChange={(e) => update('categoryId', e.target.value || undefined)}>
              <option value="">None</option>
              {categoriesQuery.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Established year</label>
            <input
              type="number"
              min={1800}
              max={new Date().getFullYear()}
              value={form.establishedYear ?? ''}
              onChange={(e) => update('establishedYear', e.target.value ? Number(e.target.value) : undefined)}
            />
          </div>
          <div className="field">
            <label>Website</label>
            <input value={form.website} onChange={(e) => update('website', e.target.value)} placeholder="https://" />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => update('description', e.target.value)} />
          </div>
          {showAdmissionProcess && (
            <div className="field">
              <label>Admission process</label>
              <textarea rows={4} value={form.admissionProcess ?? ''} onChange={(e) => update('admissionProcess', e.target.value)} />
            </div>
          )}
          {Boolean(error) && <p className="mb-3 text-xs text-danger">{apiErrorMessage(error)}</p>}
          <div className="mt-1.5 flex gap-2">
            <button type="button" className="btn btn-ghost flex-1 justify-center" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary flex-1 justify-center">
              {submitting ? submittingLabel : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
