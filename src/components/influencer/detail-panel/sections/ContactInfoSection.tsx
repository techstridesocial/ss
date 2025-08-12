'use client'

import { Mail, Phone, Globe, MessageCircle } from 'lucide-react'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { MetricRow } from '../components/MetricRow'

interface ContactInfoSectionProps {
  contacts: Array<{
    type: string
    value: string
  }>
}

export const ContactInfoSection = ({ contacts }: ContactInfoSectionProps) => {
  // Always show the section, but indicate when no contact data is available
  const hasContacts = contacts && contacts.length > 0

  const getContactIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'email':
        return Mail
      case 'phone':
        return Phone
      case 'website':
        return Globe
      default:
        return MessageCircle
    }
  }

  const formatContactValue = (contact: { type: string; value: string }) => {
    switch (contact.type.toLowerCase()) {
      case 'email':
        return (
          <a 
            href={`mailto:${contact.value}`} 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {contact.value}
          </a>
        )
      case 'phone':
        return (
          <a 
            href={`tel:${contact.value}`} 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {contact.value}
          </a>
        )
      case 'website':
        return (
          <a 
            href={contact.value.startsWith('http') ? contact.value : `https://${contact.value}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {contact.value}
          </a>
        )
      default:
        return contact.value
    }
  }

  return (
    <CollapsibleSection title="Contact Information">
      <div className="space-y-3">
        {hasContacts ? (
          contacts.map((contact, index) => (
            <MetricRow
              key={index}
              icon={getContactIcon(contact.type)}
              label={contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
              value={formatContactValue(contact)}
            />
          ))
        ) : (
          <div className="text-sm text-gray-500 italic">
            Contact information not available through public profile data
          </div>
        )}
      </div>
    </CollapsibleSection>
  )
}