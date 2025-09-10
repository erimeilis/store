import React from 'react';
import { ModelList, IColumnDefinition } from '../../../components/model/model-list';
import { IPaginatedResponse } from '../../../types/models';
import { formatApiDate } from '../../../lib/date-utils';

// AllowedEmail interface based on the Prisma schema
interface AllowedEmail {
  id: string;
  email: string | null;
  domain: string | null;
  type: string;
  createdAt: string;
}

// Column definitions for Allowed Emails management
const allowedEmailColumns: IColumnDefinition<AllowedEmail>[] = [
  { 
    key: 'type', 
    label: 'Type', 
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { value: 'email', label: 'Specific Email' },
      { value: 'domain', label: 'Domain Pattern' }
    ],
    editableInline: true,
    editType: 'select',
    editOptions: [
      { value: 'email', label: 'Specific Email' },
      { value: 'domain', label: 'Domain Pattern' }
    ],
    render: (allowedEmail) => (
      <span className={`badge ${allowedEmail.type === 'email' ? 'badge-primary' : 'badge-secondary'}`}>
        {allowedEmail.type === 'email' ? 'Email' : 'Domain'}
      </span>
    )
  },
  { 
    key: 'email', 
    label: 'Email Address', 
    sortable: true, 
    filterable: true,
    filterType: 'text',
    editableInline: true,
    editType: 'email',
    editValidation: { 
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    render: (allowedEmail) => {
      if (allowedEmail.type === 'email' && allowedEmail.email) {
        return (
          <span className="font-mono text-sm">
            {allowedEmail.email}
          </span>
        );
      }
      return <span className="text-gray-400">-</span>;
    }
  },
  { 
    key: 'domain', 
    label: 'Domain Pattern', 
    sortable: true, 
    filterable: true,
    filterType: 'text',
    editableInline: true,
    editType: 'text',
    editValidation: { 
      pattern: /^@?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    },
    render: (allowedEmail) => {
      if (allowedEmail.type === 'domain' && allowedEmail.domain) {
        return (
          <span className="font-mono text-sm">
            {allowedEmail.domain.startsWith('@') ? allowedEmail.domain : `@${allowedEmail.domain}`}
          </span>
        );
      }
      return <span className="text-gray-400">-</span>;
    }
  },
  { 
    key: 'createdAt', 
    label: 'Added', 
    sortable: true,
    filterable: true,
    filterType: 'date',
    render: (allowedEmail) => (
      <span className="text-sm text-gray-600">
        {formatApiDate(allowedEmail.createdAt)}
      </span>
    )
  }
];

// Mass actions for allowed emails
const allowedEmailMassActions = [
  {
    name: 'convert_to_domain',
    label: 'Convert to Domain Rules',
    confirmMessage: 'Are you sure you want to convert the selected email addresses to domain patterns?'
  },
  {
    name: 'export_list',
    label: 'Export List',
    confirmMessage: 'Export the selected email rules to CSV?'
  },
  {
    name: 'delete',
    label: 'Remove from Whitelist',
    confirmMessage: 'Are you sure you want to remove the selected entries from the allowed list? This may prevent some users from accessing the system.'
  }
];

export default function AllowedEmailsPage({ 
  allowedEmails, 
  filters 
}: { 
  allowedEmails?: IPaginatedResponse<AllowedEmail> | null, 
  filters?: { sort?: string, direction?: 'asc' | 'desc' } 
}) {
  return (
    <ModelList<AllowedEmail>
      title="Allowed Emails"
      items={allowedEmails || null}
      filters={filters || {}}
      columns={allowedEmailColumns}
      createRoute="/dashboard/allowed-emails/create"
      editRoute={(id) => `/dashboard/allowed-emails/edit/${id}`}
      inlineEditRoute={(id) => `/api/allowed-emails/${id}`}
      deleteRoute={(id) => `/api/allowed-emails/${id}`}
      massActionRoute="/api/allowed-emails/mass-action"
      massActions={allowedEmailMassActions}
    />
  );
}