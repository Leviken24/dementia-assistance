import React, { useState, useEffect } from 'react';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { BigButton } from '../common/BigButton.jsx';
import {
  REMINDER_CATEGORIES,
  validateReminder,
  getCategoryMeta
} from '../../services/reminderService.js';
import { useFocusTrap } from '../common/useFocusTrap.js';

export function ReminderFormModal({
  isOpen = true,
  onClose,
  reminder,
  initialData,
  onSave,
  onCancel
}) {
  const activeReminder = initialData || reminder;
  const isEditing = Boolean(activeReminder && activeReminder.id);
  const handleClose = onClose || onCancel;

  const [title, setTitle] = useState(activeReminder?.title || '');
  const [category, setCategory] = useState(activeReminder?.category || 'water');
  const [time, setTime] = useState(activeReminder?.time || '10:00');
  const [recurrence, setRecurrence] = useState(activeReminder?.recurrence || 'daily');
  const [errorMessage, setErrorMessage] = useState('');

  const modalRef = useFocusTrap(isOpen, handleClose);

  useEffect(() => {
    if (activeReminder) {
      setTitle(activeReminder.title || '');
      setCategory(activeReminder.category || 'water');
      setTime(activeReminder.time || '10:00');
      setRecurrence(activeReminder.recurrence || 'daily');
    } else {
      setTitle(getCategoryMeta('water').defaultTitle);
      setCategory('water');
      setTime('10:00');
      setRecurrence('daily');
    }
  }, [activeReminder, isOpen]);

  const handleCategorySelect = newCatId => {
    setCategory(newCatId);
    const prevCatMeta = getCategoryMeta(category);
    const newCatMeta = getCategoryMeta(newCatId);

    if (!title || (prevCatMeta && title === prevCatMeta.defaultTitle)) {
      setTitle(newCatMeta.defaultTitle);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    setErrorMessage('');

    const payload = {
      id: activeReminder?.id,
      title,
      time,
      category,
      recurrence,
      days: activeReminder?.days || ['daily'],
      enabled: activeReminder?.enabled !== undefined ? activeReminder.enabled : true,
      createdAt: activeReminder?.createdAt
    };

    const validation = validateReminder(payload);
    if (!validation.isValid) {
      setErrorMessage(validation.errors[0]);
      return;
    }

    onSave(validation.sanitized);
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-form-title"
    >
      <div
        ref={modalRef}
        className="modal-content"
        style={{ maxWidth: '480px', maxHeight: '88vh', overflowY: 'auto' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}
        >
          <h2
            id="reminder-form-title"
            style={{
              fontSize: 'var(--font-h3)',
              fontWeight: '700',
              color: 'var(--text-primary)',
              margin: 0
            }}
          >
            {isEditing ? 'Edit Daily Reminder' : 'Add a Reminder'}
          </h2>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close reminder modal"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              minHeight: '36px',
              minWidth: '36px'
            }}
          >
            <AccessibleIcon name="close" size={20} />
          </button>
        </div>

        {errorMessage && (
          <div
            role="alert"
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--danger-soft)',
              color: 'var(--danger-color)',
              border: '1px solid var(--danger-border)',
              fontSize: 'var(--font-xs)',
              fontWeight: '600',
              marginBottom: '14px'
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Category Picker */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 'var(--font-xs)',
                fontWeight: '700',
                color: 'var(--text-secondary)',
                marginBottom: '6px'
              }}
            >
              Category:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {REMINDER_CATEGORIES.map(cat => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    style={{
                      padding: '8px 6px',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'var(--accent-soft)' : 'var(--bg-surface)',
                      color: isSelected ? 'var(--accent-color)' : 'var(--text-secondary)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: 'var(--font-xs)',
                      fontWeight: isSelected ? '700' : '500',
                      minHeight: '52px'
                    }}
                  >
                    <AccessibleIcon name={cat.icon} size={18} />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label
              htmlFor="reminder-title-input"
              style={{
                display: 'block',
                fontSize: 'var(--font-xs)',
                fontWeight: '700',
                color: 'var(--text-secondary)',
                marginBottom: '4px'
              }}
            >
              Reminder Note:
            </label>
            <input
              id="reminder-title-input"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={80}
              placeholder="e.g. A Refreshing Glass of Water"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: 'var(--font-sm)',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Time Picker & Recurrence Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label
                htmlFor="reminder-time-input"
                style={{
                  display: 'block',
                  fontSize: 'var(--font-xs)',
                  fontWeight: '700',
                  color: 'var(--text-secondary)',
                  marginBottom: '4px'
                }}
              >
                Time:
              </label>
              <input
                id="reminder-time-input"
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-sm)',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div>
              <label
                htmlFor="reminder-recurrence-input"
                style={{
                  display: 'block',
                  fontSize: 'var(--font-xs)',
                  fontWeight: '700',
                  color: 'var(--text-secondary)',
                  marginBottom: '4px'
                }}
              >
                Frequency:
              </label>
              <select
                id="reminder-recurrence-input"
                value={recurrence}
                onChange={e => setRecurrence(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-surface)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-sm)',
                  fontFamily: 'inherit'
                }}
              >
                <option value="daily">Repeats Daily</option>
                <option value="once">Today Only</option>
              </select>
            </div>
          </div>

          {category === 'medication' && (
            <div
              style={{
                padding: '8px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                lineHeight: '1.4'
              }}
            >
              Note: Medication reminders are simple schedule prompts. They do not calculate dosages or provide medical guidance.
            </div>
          )}

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '6px' }}>
            <BigButton variant="secondary" size="sm" onClick={handleClose}>
              Cancel
            </BigButton>
            <BigButton variant="primary" size="sm" type="submit">
              {isEditing ? 'Save Changes' : 'Create Reminder'}
            </BigButton>
          </div>
        </form>
      </div>
    </div>
  );
}
