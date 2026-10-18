import React, { useState, useEffect } from 'react';
import { AccessibleIcon } from '../common/AccessibleIcons.jsx';
import { BigButton } from '../common/BigButton.jsx';
import { useFocusTrap } from '../common/useFocusTrap.js';
import { MemoryUploadModal } from './MemoryUploadModal.jsx';
import { storageService } from '../../services/storageService.js';
import { vaultApiClient } from '../../services/vaultApiClient.js';

export function CaregiverDashboard({ onExit, onManageReminders, onViewHistory }) {
  const [activeTab, setActiveTab] = useState('memories'); // 'memories' | 'reminders' | 'activity'
  const [memories, setMemories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingMemory, setEditingMemory] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const deleteModalRef = useFocusTrap(Boolean(deleteConfirmId), () => setDeleteConfirmId(null));

  const loadMemories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await vaultApiClient.getCaregiverMemories();
      setMemories(data.memories || []);
    } catch (err) {
      setError('Could not connect to the backend server. Please verify the server is running on port 4000.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const handleToggleApproval = async memory => {
    const newStatus = memory.approvalStatus === 'approved' ? 'pending_review' : 'approved';
    try {
      await vaultApiClient.updateMemory(memory.id, { approvalStatus: newStatus });
      loadMemories();
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleToggleDistressing = async memory => {
    try {
      await vaultApiClient.updateMemory(memory.id, { isDistressing: !memory.isDistressing });
      loadMemories();
    } catch (err) {
      alert('Failed to update distress flag: ' + err.message);
    }
  };

  const handleDelete = async id => {
    try {
      await vaultApiClient.deleteMemory(id);
      setDeleteConfirmId(null);
      loadMemories();
    } catch (err) {
      alert('Failed to delete memory: ' + err.message);
    }
  };

  const handleLogout = async () => {
    await vaultApiClient.logout();
    onExit();
  };

  const reminders = storageService.getReminders();
  const gameHistory = storageService.getGameHistory();

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '8px 0 24px 0' }}>
      {/* Top Banner & Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-surface)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          marginBottom: '16px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
                backgroundColor: '#DCFCE7',
                color: '#15803D',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'calc(var(--font-base) * 0.75)',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <AccessibleIcon name="lock" size={12} />
              Caregiver Portal
            </span>
            <span style={{ fontSize: 'calc(var(--font-base) * 0.8)', color: 'var(--text-secondary)' }}>
              caregiver@gentlemind.local
            </span>
          </div>
          <h1 style={{ fontSize: 'var(--font-h2)', margin: 0, color: 'var(--text-primary)', fontWeight: '700' }}>
            Caregiver Management Console
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <BigButton variant="secondary" size="sm" onClick={handleLogout}>
            Exit Console
          </BigButton>
        </div>
      </div>

      {/* Non-Clinical Notice */}
      <div
        style={{
          padding: '10px 14px',
          backgroundColor: 'var(--bg-surface-elevated)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          marginBottom: '16px',
          fontSize: 'calc(var(--font-base) * 0.85)',
          color: 'var(--text-secondary)',
          lineHeight: '1.4'
        }}
      >
        <strong>Notice:</strong> This console enables authorized family caregivers to manage personal reminiscence photographs, daily routine reminders, and view gentle participation logs. It does not provide medical assessments or clinical diagnoses.
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '20px',
          paddingBottom: '4px'
        }}
      >
        <button
          onClick={() => setActiveTab('memories')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: activeTab === 'memories' ? 'var(--accent-color)' : 'transparent',
            color: activeTab === 'memories' ? '#FFFFFF' : 'var(--text-primary)',
            fontSize: 'calc(var(--font-base) * 0.9)',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <AccessibleIcon name="camera" size={16} />
          Memory Vault ({memories.length})
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: activeTab === 'reminders' ? 'var(--accent-color)' : 'transparent',
            color: activeTab === 'reminders' ? '#FFFFFF' : 'var(--text-primary)',
            fontSize: 'calc(var(--font-base) * 0.9)',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <AccessibleIcon name="bell" size={16} />
          Daily Reminders ({reminders.length})
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: activeTab === 'activity' ? 'var(--accent-color)' : 'transparent',
            color: activeTab === 'activity' ? '#FFFFFF' : 'var(--text-primary)',
            fontSize: 'calc(var(--font-base) * 0.9)',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <AccessibleIcon name="clock" size={16} />
          Activity Journal ({gameHistory.length})
        </button>
      </div>

      {/* TAB 1: MEMORY VAULT */}
      {activeTab === 'memories' && (
        <section>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}
          >
            <div>
              <h2 style={{ fontSize: 'var(--font-h3)', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                Personal Photographs & Stories
              </h2>
              <p style={{ margin: 0, fontSize: 'calc(var(--font-base) * 0.85)', color: 'var(--text-secondary)' }}>
                Photographs must be approved and not flagged as distressing to be displayed to the patient.
              </p>
            </div>
            <BigButton variant="primary" size="sm" onClick={() => setShowUploadModal(true)}>
              <AccessibleIcon name="plus" size={16} /> Add Photograph
            </BigButton>
          </div>

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>Loading memories...</div>
          ) : error ? (
            <div
              role="alert"
              style={{
                padding: '16px',
                backgroundColor: '#FEE2E2',
                color: '#991B1B',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
                fontWeight: '600'
              }}
            >
              {error}
            </div>
          ) : memories.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '36px 20px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-color)'
              }}
            >
              <p style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                No photographs in the Memory Vault yet.
              </p>
              <BigButton variant="primary" size="md" onClick={() => setShowUploadModal(true)}>
                Upload First Photograph
              </BigButton>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {memories.map(mem => {
                const imgStreamUrl = vaultApiClient.getPatientMemoryImageUrl(mem.id);
                const isApproved = mem.approvalStatus === 'approved';
                const isDistressing = mem.isDistressing;

                return (
                  <div
                    key={mem.id}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ height: '160px', backgroundColor: '#0F172A', overflow: 'hidden' }}>
                      <img
                        src={imgStreamUrl}
                        alt={mem.title || 'Memory thumbnail'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>

                    <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: 'calc(var(--font-base) * 0.75)',
                            fontWeight: '700',
                            backgroundColor: isApproved ? '#DCFCE7' : '#FEF3C7',
                            color: isApproved ? '#15803D' : '#92400E'
                          }}
                        >
                          {isApproved ? 'Approved' : 'Pending Review'}
                        </span>

                        {isDistressing && (
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: 'calc(var(--font-base) * 0.75)',
                              fontWeight: '700',
                              backgroundColor: '#FEE2E2',
                              color: '#991B1B'
                            }}
                          >
                            Flagged Distressing
                          </span>
                        )}
                      </div>

                      <h3 style={{ fontSize: 'var(--font-base)', margin: '0 0 6px 0', color: 'var(--text-primary)', fontWeight: '700' }}>
                        {mem.title || 'Untitled Memory'}
                      </h3>

                      {mem.story && (
                        <p
                          style={{
                            fontSize: 'calc(var(--font-base) * 0.85)',
                            color: 'var(--text-secondary)',
                            margin: '0 0 10px 0',
                            flex: 1,
                            lineHeight: '1.4'
                          }}
                        >
                          {mem.story}
                        </p>
                      )}

                      {mem.people && mem.people.length > 0 && (
                        <div style={{ fontSize: 'calc(var(--font-base) * 0.8)', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                          <strong>People:</strong> {mem.people.map(p => `${p.name}${p.relationship ? ` (${p.relationship})` : ''}`).join(', ')}
                        </div>
                      )}

                      {(mem.approximatePeriod || mem.location) && (
                        <div style={{ fontSize: 'calc(var(--font-base) * 0.8)', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                          {mem.approximatePeriod} {mem.location ? `• ${mem.location}` : ''}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div
                        style={{
                          display: 'flex',
                          gap: '6px',
                          marginTop: 'auto',
                          paddingTop: '10px',
                          borderTop: '1px solid var(--border-color)',
                          flexWrap: 'wrap'
                        }}
                      >
                        <button
                          onClick={() => handleToggleApproval(mem)}
                          style={{
                            flex: 1,
                            padding: '6px 8px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            fontSize: 'calc(var(--font-base) * 0.8)',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          {isApproved ? 'Unapprove' : 'Approve'}
                        </button>

                        <button
                          onClick={() => handleToggleDistressing(mem)}
                          style={{
                            flex: 1,
                            padding: '6px 8px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--bg-surface-elevated)',
                            color: isDistressing ? '#059669' : '#DC2626',
                            fontSize: 'calc(var(--font-base) * 0.8)',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          {isDistressing ? 'Restore' : 'Flag Sad'}
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(mem.id)}
                          aria-label={`Delete memory ${mem.title || ''}`}
                          style={{
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid #FCA5A5',
                            backgroundColor: '#FEF2F2',
                            color: '#DC2626',
                            cursor: 'pointer'
                          }}
                        >
                          <AccessibleIcon name="trash" size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* TAB 2: REMINDERS REVIEW */}
      {activeTab === 'reminders' && (
        <section>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}
          >
            <div>
              <h2 style={{ fontSize: 'var(--font-h3)', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                Active Routine Reminders
              </h2>
              <p style={{ margin: 0, fontSize: 'calc(var(--font-base) * 0.85)', color: 'var(--text-secondary)' }}>
                Non-clinical schedule reminders (hydration, family calls, rest periods).
              </p>
            </div>
            <BigButton variant="primary" size="sm" onClick={onManageReminders}>
              Manage Reminders
            </BigButton>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {reminders.map(rem => (
              <div
                key={rem.id}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: 'var(--font-base)', fontWeight: '700', color: 'var(--accent-color)' }}>
                      {rem.time}
                    </span>
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: 'var(--accent-soft)',
                        fontSize: 'calc(var(--font-base) * 0.75)',
                        fontWeight: '600'
                      }}
                    >
                      {rem.recurrence}
                    </span>
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: rem.active ? '#DCFCE7' : '#F3F4F6',
                        color: rem.active ? '#15803D' : '#6B7280',
                        fontSize: 'calc(var(--font-base) * 0.75)',
                        fontWeight: '600'
                      }}
                    >
                      {rem.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 2px 0', fontSize: 'var(--font-base)', fontWeight: '600' }}>
                    {rem.title}
                  </h3>
                  {rem.description && (
                    <p style={{ margin: 0, fontSize: 'calc(var(--font-base) * 0.85)', color: 'var(--text-secondary)' }}>
                      {rem.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 3: ACTIVITY JOURNAL */}
      {activeTab === 'activity' && (
        <section>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}
          >
            <div>
              <h2 style={{ fontSize: 'var(--font-h3)', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                Activity Participation History
              </h2>
              <p style={{ margin: 0, fontSize: 'calc(var(--font-base) * 0.85)', color: 'var(--text-secondary)' }}>
                Gentle engagement history records participation and duration. They are never clinical scores.
              </p>
            </div>
            <BigButton variant="secondary" size="sm" onClick={onViewHistory}>
              Open Full Journal
            </BigButton>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {gameHistory.slice(0, 10).map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{ margin: '0 0 2px 0', fontSize: 'var(--font-base)', fontWeight: '600' }}>
                    {item.gameId}
                  </h3>
                  <p style={{ margin: 0, fontSize: 'calc(var(--font-base) * 0.8)', color: 'var(--text-secondary)' }}>
                    Played on {new Date(item.completedAt).toLocaleDateString()} at{' '}
                    {new Date(item.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: '700', fontSize: 'calc(var(--font-base) * 0.9)' }}>
                    {Math.round(item.durationSeconds / 60)} min
                  </span>
                  <p style={{ margin: 0, fontSize: 'calc(var(--font-base) * 0.8)', color: 'var(--text-secondary)' }}>
                    {item.hintsUsed || 0} hints used
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upload Modal */}
      <MemoryUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploaded={loadMemories}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
          className="modal-overlay"
        >
          <div
            ref={deleteModalRef}
            className="modal-content"
            style={{ maxWidth: '440px' }}
          >
            <h2 id="delete-confirm-title" style={{ fontSize: 'var(--font-h2)', color: 'var(--text-primary)', marginBottom: '12px' }}>
              Delete Memory?
            </h2>
            <p style={{ fontSize: 'var(--font-base)', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.4' }}>
              This will permanently delete this photograph and story from the private server storage. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <BigButton variant="secondary" size="md" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </BigButton>
              <BigButton variant="primary" size="md" onClick={() => handleDelete(deleteConfirmId)}>
                Yes, Delete
              </BigButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
