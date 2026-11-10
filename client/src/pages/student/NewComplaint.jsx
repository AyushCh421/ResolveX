import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { issueApi } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { PageHeader } from '../../components/common/Feedback';
import { CATEGORIES, PLACES, PRIORITIES } from '../../utils/constants';
import { errorMessage } from '../../utils/format';

const MAX_IMAGE = 5 * 1024 * 1024;

const PRIORITY_HINT = {
  Low: 'Can wait a few days',
  Medium: 'Needs attention soon',
  High: 'Affects safety or many people',
};

export default function NewComplaint() {
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    category: '',
    place: '',
    detail: '',
    priority: 'Medium',
    description: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Free the temporary preview URL when the image changes or the page closes.
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const pickImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrors((er) => ({ ...er, image: 'Choose a JPG, PNG or WebP image.' }));
      e.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGE) {
      setErrors((er) => ({ ...er, image: 'Image must be 5 MB or smaller.' }));
      e.target.value = '';
      return;
    }
    setErrors((er) => ({ ...er, image: undefined }));
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImage(null);
    setPreview('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const validate = () => {
    const e = {};
    if (form.title.trim().length < 5) e.title = 'Give the problem a short title (at least 5 characters).';
    if (!form.category) e.category = 'Choose a category.';
    if (!form.place) e.place = 'Choose where the problem is.';
    if (form.description.trim().length < 10) e.description = 'Describe what is wrong (at least 10 characters).';
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }

    const body = new FormData();
    body.append('title', form.title.trim());
    body.append('category', form.category);
    body.append('location', form.detail.trim() ? `${form.place}, ${form.detail.trim()}` : form.place);
    body.append('priority', form.priority);
    body.append('description', form.description.trim());
    if (image) body.append('image', image);

    setSubmitting(true);
    try {
      const { issue } = await issueApi.create(body);
      toast.success(`Reported. Your ticket is ${issue.ticketId}.`);
      navigate(`/student/complaints/${issue._id}`, { replace: true });
    } catch (err) {
      toast.error(errorMessage(err));
      setSubmitting(false);
    }
  };

  const invalid = (name) => (errors[name] ? 'border-bad' : '');

  return (
    <>
      <PageHeader title="Report an issue" subtitle="The more specific you are, the faster it gets fixed." />

      <form onSubmit={submit} noValidate className="panel mx-auto max-w-2xl space-y-5 p-5 sm:p-7">
        <div>
          <label htmlFor="title" className="field-label">What is the problem?</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={update}
            maxLength={120}
            placeholder="e.g. Ceiling fan not working in Room 204"
            className={`field ${invalid('title')}`}
          />
          {errors.title && <p className="field-error">{errors.title}</p>}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="field-label">Category</label>
            <select id="category" name="category" value={form.category} onChange={update} className={`field ${invalid('category')}`}>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            {errors.category && <p className="field-error">{errors.category}</p>}
          </div>

          <div>
            <label htmlFor="place" className="field-label">Where on campus?</label>
            <select id="place" name="place" value={form.place} onChange={update} className={`field ${invalid('place')}`}>
              <option value="">Select a place</option>
              {PLACES.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
            {errors.place && <p className="field-error">{errors.place}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="detail" className="field-label">
            Exact spot <span className="font-normal text-faint">(optional)</span>
          </label>
          <input
            id="detail"
            name="detail"
            value={form.detail}
            onChange={update}
            maxLength={80}
            placeholder="Floor, room number or landmark"
            className="field"
          />
        </div>

        <fieldset>
          <legend className="field-label">How urgent is it?</legend>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {PRIORITIES.map((p) => (
              <label
                key={p}
                className={`cursor-pointer rounded-lg border px-3.5 py-3 transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brand ${
                  form.priority === p ? 'border-brand bg-brand-tint' : 'border-line bg-white hover:border-faint'
                }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value={p}
                  checked={form.priority === p}
                  onChange={update}
                  className="sr-only"
                />
                <span className="block text-sm font-semibold">{p}</span>
                <span className="mt-0.5 block text-xs text-muted">{PRIORITY_HINT[p]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="description" className="field-label">Details</label>
          <textarea
            id="description"
            name="description"
            rows={5}
            maxLength={2000}
            value={form.description}
            onChange={update}
            placeholder="What happened, since when, and anything that would help the team find and fix it."
            className={`field resize-y ${invalid('description')}`}
          />
          <div className="mt-1.5 flex justify-between">
            {errors.description ? <p className="field-error !mt-0">{errors.description}</p> : <span />}
            <span className="text-xs text-faint">{form.description.length}/2000</span>
          </div>
        </div>

        <div>
          <span className="field-label">
            Photo <span className="font-normal text-faint">(optional)</span>
          </span>
          {preview ? (
            <div className="relative w-fit">
              <img src={preview} alt="Selected upload preview" className="max-h-52 rounded-lg border border-line" />
              <button
                type="button"
                onClick={clearImage}
                aria-label="Remove photo"
                className="absolute -right-2 -top-2 rounded-full bg-ink p-1.5 text-white shadow hover:bg-bad"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center gap-1.5 rounded-lg border border-dashed border-faint bg-paper/60 px-4 py-7 text-sm text-muted transition-colors hover:border-brand hover:bg-brand-tint/50 hover:text-brand-dark"
            >
              <ImagePlus size={22} />
              <span className="font-medium">Add a photo</span>
              <span className="text-xs">JPG, PNG or WebP, up to 5 MB</span>
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={pickImage} className="sr-only" tabIndex={-1} />
          {errors.image && <p className="field-error">{errors.image}</p>}
        </div>

        <div className="flex justify-end gap-3 border-t border-line pt-5">
          <button type="button" onClick={() => navigate(-1)} className="btn btn-outline">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn btn-primary min-w-36">
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting ? 'Submitting' : 'Submit complaint'}
          </button>
        </div>
      </form>
    </>
  );
}
