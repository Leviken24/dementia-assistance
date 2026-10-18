import React, { useState, useEffect } from 'react';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { BigButton } from '../common/BigButton.jsx';
import {
  REMINDER_CATEGORIES,
  validateReminder,
  getCategoryMeta
} from '../../services/reminderService.js';

export function ReminderFormModal({ reminder, onSave, onCancel }) {
  const isEditing = Boolean(reminder && reminder.id);

  const [title, setTitle] = useState(reminder?.title || '');
  const [category, setCategory] = useState(reminder?.category || 'water');
  const [time, setTime] = useState(reminder?.time || '10:00');
  const [recurrence, setRecurrence] = useState(reminder?.recurrence || 'daily');
  const [errorMessage, setErrorMessage] = useState('');

  // If user switches category and title is empty or was a default title from another category, suggest new default title
  const handleCategorySelect = newCatId => {
    setCategory(newCatId);
    const prevCatMeta = getCategoryMeta(category);
    const newCatMeta = getCategoryMeta(newCatId);

    if (!title || (prevCatMeta && title === prevCatMeta.defaultTitle)) {
      setTitle(newCatMeta.defaultTitle);
    }
  };

  useEffect(() => {
    if (!title && !isEditing) {
      setTitle(getCategoryMeta('water').defaultTitle);
    }
  }, [isEditing, title]);

  const handleSubmit = e => {
    e.preventDefault();
    setErrorMessage('');

    const payload = {
      id: reminder?.id,
      title,
      time,
      category,
      recurrence,
      days: reminder?.days || ['daily'],
      enabled: reminder?.enabled !== undefined ? reminder.enabled : true,
      createdAt: reminder?.createdAt
    };

    const validation = validateReminder(payload);
    if (!validation.isValid) {
      setErrorMessage(validation.errors[0]);
      return;
    }

    onSave(validation.sanitized);
  };

  const selectedCategoryMeta = getCategoryMeta(category);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-form-title"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '16px'
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderRadius: '20px',
          border: '3px solid var(--border-color)',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px 24px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}
        >
          <h2
            id="reminder-form-title"
            style={{
              fontSize: 'var(--font-h1)',
              color: 'var(--text-primary)',
              margin: 0,
              fontWeight: 'bold'
            }}
          >
            {isEditing ? 'Edit Daily Reminder' : 'Add a Daily Reminder'}
          </h2>

          <button
            onClick={onCancel}
            aria-label="Close reminder dialog"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AccessibleIcon name="close" size={24} />
          </button>
        </div>

        {errorMessage && (
          <div
            role="alert"
            style={{
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              padding: '12px 16px',
              borderRadius: '10px',
              border: '2px solid #EF4444',
              marginBottom: '20px',
              fontSize: 'var(--font-base)',
              fontWeight: 'bold'
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: Category Picker */}
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-h3)',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                marginBottom: '10px'
              }}
            >
              Choose a Category
            </label>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '10px'
              }}
            >
              {REMINDER_CATEGORIES.map(cat => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    aria-pressed={isSelected}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 8px',
                      borderRadius: '12px',
                      border: isSelected
                        ? '3px solid var(--accent-color)'
                        : '2px solid var(--border-color)',
                      backgroundColor: isSelected
                        ? 'var(--accent-soft)'
                        : 'var(--bg-surface-elevated, #fff)',
                      color: isSelected ? 'var(--accent-color)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      fontWeight: isSelected ? 'bold' : 'normal',
                      fontSize: 'calc(var(--font-base) * 0.9)',
                      textAlign: 'center'
                    }}
                  >
                    <AccessibleIcon name={cat.icon} size={28} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {category === 'medication' && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '10px 14px',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #93C5FD',
                  borderRadius: '10px',
                  fontSize: 'calc(var(--font-base) * 0.85)',
                  color: '#1E40AF',
                  lineHeight: '1.4'
                }}
              >
                <strong>Caregiver / Personal Schedule Notice:</strong>{' '}
                {selectedCategoryMeta.disclaimer}
              </div>
            )}
          </div>

          {/* Step 2: Reminder Title / Description */}
          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="reminder-title-input"
              style={{
                display: 'block',
                fontSize: 'var(--font-h3)',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}
            >
              Reminder Note
            </label>
            <input
              id="reminder-title-input"
              type="text"
              value={title}
              maxLength={80}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Drink a glass of fresh water"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 'var(--font-base)',
                borderRadius: '10px',
                border: '2px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface-elevated, #fff)',
                color: 'var(--text-primary)',
                boxSizing: 'border-box'
              }}
            />
            <div
              style={{
                fontSize: 'calc(var(--font-base) * 0.8)',
                color: 'var(--text-secondary)',
                marginTop: '4px'
              }}
            >
              Keep the note brief, clear, and reassuring. (Up to 80 letters)
            </div>
          </div>

          {/* Step 3: Time Picker */}
          <div style={{ marginBottom: '32px' }}>
            <label
              htmlFor="reminder-time-input"
              style={{
                display: 'block',
                fontSize: 'var(--font-h3)',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                marginBottom: '8px'
              }}
            >
              Time of Day
            </label>
            <input
              id="reminder-time-input"
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              required
              style={{
                padding: '12px 18px',
                fontSize: 'var(--font-h3)',
                fontWeight: 'bold',
                borderRadius: '10px',
                border: '2px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface-elevated, #fff)',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            />
          </div>

          {/* Step 4: Recurrence Option */}
          <div style={{ marginBottom: '32px' }}>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-h3)',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                marginBottom: '10px'
              }}
            >
              How Often?
            </label>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setRecurrence('daily')}
                aria-pressed={recurrence === 'daily'}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: recurrence === 'daily'
                    ? '3px solid var(--accent-color)'
                    : '2px solid var(--border-color)',
                  backgroundColor: recurrence === 'daily'
                    ? 'var(--accent-soft)'
                    : 'var(--bg-surface-elevated, #fff)',
                  color: recurrence === 'daily' ? 'var(--accent-color)' : 'var(--text-primary)',
                  fontWeight: 'bold',
                  fontSize: 'var(--font-base)',
                  cursor: 'pointer'
                }}
              >
                Every Day (Daily)
              </button>

              <button
                type="button"
                onClick={() => setRecurrence('once')}
                aria-pressed={recurrence === 'once'}
                style={{
                  padding: '10px 18px',
                  borderRadius: '10px',
                  border: recurrence === 'once'
                    ? '3px solid var(--accent-color)'
                    : '2px solid var(--border-color)',
                  backgroundColor: recurrence === 'once'
                    ? 'var(--accent-soft)'
                    : 'var(--bg-surface-elevated, #fff)',
                  color: recurrence === 'once' ? 'var(--accent-color)' : 'var(--text-primary)',
                  fontWeight: 'bold',
                  fontSize: 'var(--font-base)',
                  cursor: 'pointer'
                }}
              >
                Today Only (One Time)
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <BigButton variant="secondary" onClick={onCancel} type="button">
              Cancel
            </BigButton>
            <BigButton variant="primary" type="submit">
              {isEditing ? 'Save Changes' : 'Create Reminder'}
            </BigButton>
          </div>
        </form>
      </div>
    </div>
  );
}
