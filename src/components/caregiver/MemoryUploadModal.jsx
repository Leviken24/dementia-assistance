import React, { useState } from 'react';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { BigButton } from '../common/BigButton.jsx';
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
  const [error, setError] = useState(null);

  if (!isOpen) return null;

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
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        zIndex: 2100,
        overflowY: 'auto'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '3px solid var(--border-color)',
          borderRadius: '20px',
          padding: '32px',
          maxWidth: '620px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2
            id="upload-modal-title"
            style={{ fontSize: 'var(--font-h2)', color: 'var(--text-primary)', margin: 0, fontWeight: 'bold' }}
          >
            Add New Family Memory
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            <AccessibleIcon name="close" size={24} />
          </button>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              padding: '12px 16px',
              borderRadius: '10px',
              marginBottom: '20px',
              fontSize: 'calc(var(--font-base) * 0.95)',
              fontWeight: 'bold'
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* File input / preview */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="memory-photo-input"
              style={{
                display: 'block',
                fontSize: 'var(--font-base)',
                fontWeight: 'bold',
                marginBottom: '8px',
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
              required
              style={{
                display: 'block',
                width: '100%',
                padding: '10px',
                border: '2px dashed var(--border-color)',
                borderRadius: '12px',
                backgroundColor: 'var(--bg-surface-elevated)'
              }}
            />

            {previewUrl && (
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <img
                  src={previewUrl}
                  alt="Preview of upload"
                  style={{
                    maxHeight: '180px',
                    maxWidth: '100%',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    objectFit: 'cover'
                  }}
                />
              </div>
            )}
          </div>

          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="memory-title"
              style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-primary)' }}
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
                padding: '12px',
                borderRadius: '10px',
                border: '2px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Story / Gentle Prompt */}
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="memory-story"
              style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-primary)' }}
            >
              Gentle Story / Orientation Prompt (Max 300 chars)
            </label>
            <textarea
              id="memory-story"
              value={story}
              onChange={e => setStory(e.target.value)}
              placeholder="e.g. You and your sister Rita walking in the tea gardens on a bright morning."
              maxLength={300}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                border: '2px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* People & Relationship */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label
                htmlFor="memory-person"
                style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-primary)' }}
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
                  padding: '10px',
                  borderRadius: '10px',
                  border: '2px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <div>
              <label
                htmlFor="memory-relationship"
                style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-primary)' }}
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
                  padding: '10px',
                  borderRadius: '10px',
                  border: '2px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          {/* Approximate Period & Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label
                htmlFor="memory-period"
                style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-primary)' }}
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
                  padding: '10px',
                  borderRadius: '10px',
                  border: '2px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <div>
              <label
                htmlFor="memory-location"
                style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-primary)' }}
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
                  padding: '10px',
                  borderRadius: '10px',
                  border: '2px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
          </div>

          {/* Category & Approval Status */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div>
              <label
                htmlFor="memory-category"
                style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-primary)' }}
              >
                Category
              </label>
              <select
                id="memory-category"
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  border: '2px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)'
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
                style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-primary)' }}
              >
                Approval Status
              </label>
              <select
                id="memory-status"
                value={approvalStatus}
                onChange={e => setApprovalStatus(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  border: '2px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  color: 'var(--text-primary)'
                }}
              >
                <option value="approved">Approved for Patient View</option>
                <option value="pending_review">Pending Family Review</option>
                <option value="hidden">Hidden Draft</option>
              </select>
            </div>
          </div>

          {/* Caregiver Private Notes */}
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="memory-notes"
              style={{ display: 'block', fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-primary)' }}
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
                padding: '10px',
                borderRadius: '10px',
                border: '2px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)'
              }}
            />
          </div>

          {/* Consent Checkbox */}
          <div
            style={{
              padding: '14px',
              backgroundColor: 'var(--accent-soft)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              marginBottom: '24px'
            }}
          >
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={consentAcknowledged}
                onChange={e => setConsentAcknowledged(e.target.checked)}
                style={{ width: '20px', height: '20px', marginTop: '2px' }}
                required
              />
              <span style={{ fontSize: 'calc(var(--font-base) * 0.9)', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                I confirm that I have permission from my family and loved one to store and display this photograph for their personal comfort.
              </span>
            </label>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <BigButton variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </BigButton>
            <BigButton variant="primary" type="submit" disabled={isLoading || !file || !consentAcknowledged}>
              {isLoading ? 'Saving Memory...' : 'Upload & Save Memory'}
            </BigButton>
          </div>
        </form>
      </div>
    </div>
  );
}
