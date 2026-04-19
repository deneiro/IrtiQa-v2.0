"use client"

import React from 'react'
import { Modal } from '@/shared/ui/modal'
import { JournalForm } from './JournalForm'
import { JournalEntry } from '@/entities/journal'

interface WriteJournalModalProps {
  isOpen: boolean
  onClose: () => void
  initialData?: JournalEntry
}

export function WriteJournalModal({ isOpen, onClose, initialData }: WriteJournalModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Reflection" : "Daily Reflection"}
      className="max-w-3xl"
    >
      <JournalForm onSuccess={onClose} initialData={initialData} />
    </Modal>
  )
}
