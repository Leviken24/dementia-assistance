import React, { useState } from 'react';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { BigButton } from '../common/BigButton.jsx';
import { useFocusTrap } from '../common/useFocusTrap.js';
import { vaultApiClient } from '../../services/vaultApiClient.js';

export function MemoryUploadModal({ isOpen, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [personName, setPersonName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [approximatePeriod, setApproximatePeriod] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('family');
  const [approvalStatus, setApprovalStatus] = useState('approved');
  const [caregiverNotes, setCaregiverNotes] = useState('');
  const [consentAcknowledged, setConsentAcknowledged] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isDraftingAi, setIsDraftingAi] = useState(false);
  const [error, setError] = useState(null);

  const modalRef = useFocusTrap(isOpen, onClose);

  if (!isOpen) return null;

  const handleDraftWithAi = async () => {
    setIsDraftingAi(true);
    try {
      const res = await vaultApiClient.draftCaregiverStory({
        notes: caregiverNotes,
        people: personName ? `${personName} ${relationship ? `(${relationship})` : ''}` : '',
        location,
        period: approximatePeriod
      });
      if (res && res.text) {
        setStory(res.text);
      }
    } catch (e) {
      console.warn('AI drafting unavailable:', e);
    } finally {
      setIsDraftingAi(false);
    }
  };

  const handleFileChange = e => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (selected.size > 5 * 1024 * 1024) {
      setError('Photo exceeds 5MB size limit. Please choose a smaller photo.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)) {
      setError('Only JPEG, PNG, or WebP images are supported.');
      return;
    }

    setError(null);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) {
      setError('Please select a photograph to upload.');
      return;
    }

    if (!consentAcknowledged) {
      setError('Please confirm that you have permission from your family to upload this photo.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('title', title);
      formData.append('story', story);
      formData.append('approximatePeriod', approximatePeriod);
      formData.append('location', location);
      formData.append('category', category);
      formData.append('approvalStatus', approvalStatus);
      formData.append('caregiverNotes', caregiverNotes);

      const people = [];
      if (personName.trim()) {
        people.push({
          name: personName.trim(),
          relationship: relationship.trim() || undefined,
          isVerified: true
        });
      }
      formData.append('people', JSON.stringify(people));

      await vaultApiClient.uploadMemory(formData);
      onUploaded();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to upload photo. Please check the server connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      className="modal-overlay"
    >
      <div
        ref={modalRef}
        className="modal-content"
        style={{ maxWidth: '580px', maxHeight: '90vh' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
          <h2
            id="upload-modal-title"
            style={{ fontSize: 'var(--font-h2)', color: 'var(--text-primary)', margin: 0, fontWeight: '700' }}
          >
            Add Family Memory
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '4px'
            }}
          >
            <AccessibleIcon name="close" size={20} />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              backgroundColor: '#FEF2F2',
              color: '#991B1B',
              border: '1px solid #FCA5A5',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              fontSize: 'calc(var(--font-base) * 0.9)',
              fontWeight: '600'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* File input / preview */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="memory-photo-input"
              style={{
                display: 'block',
                fontSize: 'calc(var(--font-base) * 0.9)',
                fontWeight: '600',
                marginBottom: '6px',
                color: 'var(--text-primary)'
              }}
            >
              Select Photograph (JPEG, PNG, WebP — Max 5MB) *
            </label>
            <input
              id="memory-photo-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              required={!file}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px',
                border: '1px dashed var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
                fontSize: 'calc(var(--font-base) * 0.85)',
                color: 'var(--text-primary)'
              }}
            />

            {previewUrl && (
              <div
                style={{
                  marginTop: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '10px 14px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)'
                }}
              >
                <img
                  src={previewUrl}
                  alt="Preview of upload"
                  style={{
                    height: '76px',
                    width: '76px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 'calc(var(--font-base) * 0.85)',
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {file?.name}
                  </div>
                  <div style={{ fontSize: 'calc(var(--font-base) * 0.75)', color: 'var(--text-secondary)' }}>
                    {file ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setPreviewUrl(null);
                    const input = document.getElementById('memory-photo-input');
                    if (input) input.value = '';
                  }}
                  style={{
                    padding: '6px 12px',
                    minHeight: '36px',
                    minWidth: 'auto',
                    backgroundColor: 'var(--danger-soft)',
                    color: 'var(--danger-color)',
                    border: '1px solid var(--danger-border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'calc(var(--font-base) * 0.8)',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Title */}
          <div style={{ marginBottom: '14px' }}>
            <label
              htmlFor="memory-title"
              style={{ display: 'block', fontWeight: '600', fontSize: 'calc(var(--font-base) * 0.9)', marginBottom: '4px', color: 'var(--text-primary)' }}
            >
              Memory Title / Headline
            </label>
            <input
              id="memory-title"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Afternoon Tea in Tezpur"
              maxLength={80}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                fontSize: 'var(--font-base)'
              }}
            />
          </div>

          {/* Story / Gentle Prompt */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label
                htmlFor="memory-story"
                style={{ fontWeight: '600', fontSize: 'calc(var(--font-base) * 0.9)', color: 'var(--text-primary)' }}
              >
                Gentle Story / Orientation Prompt (Max 300 chars)
              </label>
              <button
                type="button"
                onClick={handleDraftWithAi}
                disabled={isDraftingAi}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--accent-soft)',
                  color: 'var(--accent-color)',
                  fontSize: 'calc(var(--font-base) * 0.75)',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <AccessibleIcon name="sparkles" size={12} />
                <span>{isDraftingAi ? 'Drafting...' : 'Draft with AI'}</span>
              </button>
            </div>
            <textarea
              id="memory-story"
              value={story}
              onChange={e => setStory(e.target.value)}
              placeholder="e.g. You and your sister Rita walking in the tea gardens on a bright morning."
              maxLength={300}
              rows={2}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: 'var(--font-base)',
                resize: 'vertical'
              }}
            />
          </div>

          {/* People & Relationship */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label
                htmlFor="memory-person"
                style={{ display: 'block', fontWeight: '600', fontSize: 'calc(var(--font-base) * 0.85)', marginBottom: '4px', color: 'var(--text-primary)' }}
              >
                Person in Photo
              </label>
              <input
                id="memory-person"
                type="text"
                value={personName}
                onChange={e => setPersonName(e.target.value)}
                placeholder="e.g. Rita"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-base)'
                }}
              />
            </div>
            <div>
              <label
                htmlFor="memory-relationship"
                style={{ display: 'block', fontWeight: '600', fontSize: 'calc(var(--font-base) * 0.85)', marginBottom: '4px', color: 'var(--text-primary)' }}
              >
                Relationship to Loved One
              </label>
              <input
                id="memory-relationship"
                type="text"
                value={relationship}
                onChange={e => setRelationship(e.target.value)}
                placeholder="e.g. Sister"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-base)'
                }}
              />
            </div>
          </div>

          {/* Approximate Period & Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label
                htmlFor="memory-period"
                style={{ display: 'block', fontWeight: '600', fontSize: 'calc(var(--font-base) * 0.85)', marginBottom: '4px', color: 'var(--text-primary)' }}
              >
                Approximate Period
              </label>
              <input
                id="memory-period"
                type="text"
                value={approximatePeriod}
                onChange={e => setApproximatePeriod(e.target.value)}
                placeholder="e.g. Summer 1985"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-base)'
                }}
              />
            </div>
            <div>
              <label
                htmlFor="memory-location"
                style={{ display: 'block', fontWeight: '600', fontSize: 'calc(var(--font-base) * 0.85)', marginBottom: '4px', color: 'var(--text-primary)' }}
              >
                Location
              </label>
              <input
                id="memory-location"
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Tezpur, Assam"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-base)'
                }}
              />
            </div>
          </div>

          {/* Category & Approval Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label
                htmlFor="memory-category"
                style={{ display: 'block', fontWeight: '600', fontSize: 'calc(var(--font-base) * 0.85)', marginBottom: '4px', color: 'var(--text-primary)' }}
              >
                Category
              </label>
              <select
                id="memory-category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-base)'
                }}
              >
                <option value="family">Family & Loved Ones</option>
                <option value="places">Familiar Places</option>
                <option value="celebrations">Celebrations & Feasts</option>
                <option value="nature">Gardens & Nature</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="memory-status"
                style={{ display: 'block', fontWeight: '600', fontSize: 'calc(var(--font-base) * 0.85)', marginBottom: '4px', color: 'var(--text-primary)' }}
              >
                Approval Status
              </label>
              <select
                id="memory-status"
                value={approvalStatus}
                onChange={e => setApprovalStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-base)'
                }}
              >
                <option value="approved">Approved for Patient View</option>
                <option value="pending_review">Pending Family Review</option>
                <option value="hidden">Hidden Draft</option>
              </select>
            </div>
          </div>

          {/* Caregiver Private Notes */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="memory-notes"
              style={{ display: 'block', fontWeight: '600', fontSize: 'calc(var(--font-base) * 0.85)', marginBottom: '4px', color: 'var(--text-primary)' }}
            >
              Private Caregiver Notes (Not shown to patient)
            </label>
            <input
              id="memory-notes"
              type="text"
              value={caregiverNotes}
              onChange={e => setCaregiverNotes(e.target.value)}
              placeholder="e.g. Brings gentle smiles; loved talking about the garden."
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                fontSize: 'calc(var(--font-base) * 0.95)'
              }}
            />
          </div>

          {/* Consent Checkbox */}
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--accent-soft)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              marginBottom: '20px'
            }}
          >
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={consentAcknowledged}
                onChange={e => setConsentAcknowledged(e.target.checked)}
                style={{ width: '18px', height: '18px', marginTop: '2px' }}
                required
              />
              <span style={{ fontSize: 'calc(var(--font-base) * 0.85)', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                I confirm that I have permission from my family and loved one to store and display this photograph for their personal comfort.
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <BigButton variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
              Cancel
            </BigButton>
            <BigButton variant="primary" size="md" type="submit" disabled={isLoading || !file || !consentAcknowledged}>
              {isLoading ? 'Saving...' : 'Upload & Save'}
            </BigButton>
          </div>
        </form>
      </div>
    </div>
  );
}
