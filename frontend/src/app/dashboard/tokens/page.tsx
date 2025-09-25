import React from 'react';
import { ModelList, IColumnDefinition } from '@/components/model/model-list';
import { IPaginatedResponse } from '@/types/models';
import { formatApiDate } from '@/lib/date-utils';

// Token interface based on the Prisma schema
interface Token {
  id: string;
  token: string;
  name: string;
  permissions: string;
  allowedIps: string | null;
  allowedDomains: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Column definitions for Tokens management
const tokenColumns: IColumnDefinition<Token>[] = [
  { 
    key: 'name', 
    label: 'Name', 
    sortable: true, 
    filterable: true,
    filterType: 'text',
    editableInline: true,
    editType: 'text',
    editValidation: { required: true, minLength: 1, maxLength: 255 }
  },
  { 
    key: 'token', 
    label: 'Token', 
    render: (token) => (
      <span className="font-mono text-xs">
        {token.token.substring(0, 8)}...{token.token.substring(token.token.length - 4)}
      </span>
    )
  },
  { 
    key: 'permissions', 
    label: 'Permissions', 
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { value: 'read', label: 'Read Only' },
      { value: 'read,write', label: 'Read & Write' },
      { value: 'read,write,delete', label: 'Full Access' },
      { value: 'read,write,delete,admin', label: 'Admin' }
    ],
    editableInline: true,
    editType: 'select',
    editOptions: [
      { value: 'read', label: 'Read Only' },
      { value: 'read,write', label: 'Read & Write' },
      { value: 'read,write,delete', label: 'Full Access' },
      { value: 'read,write,delete,admin', label: 'Admin' }
    ],
    render: (token) => {
      const permissions = token.permissions.split(',');
      const isAdmin = permissions.includes('admin');
      const hasWrite = permissions.includes('write');
      const hasDelete = permissions.includes('delete');
      
      let badgeColor = 'badge-secondary';
      let label = 'Read Only';
      
      if (isAdmin) {
        badgeColor = 'badge-error';
        label = 'Admin';
      } else if (hasDelete) {
        badgeColor = 'badge-warning';
        label = 'Full Access';
      } else if (hasWrite) {
        badgeColor = 'badge-primary';
        label = 'Read & Write';
      }
      
      return (
        <span className={`badge ${badgeColor}`}>
          {label}
        </span>
      );
    }
  },
  { 
    key: 'allowedDomains', 
    label: 'Allowed Domains', 
    filterable: true,
    filterType: 'text',
    editableInline: true,
    editType: 'text',
    render: (token) => {
      if (!token.allowedDomains) return '-';
      try {
        const domains = JSON.parse(token.allowedDomains);
        return (
          <div className="text-xs">
            {domains.slice(0, 2).map((domain: string, idx: number) => (
              <div key={idx} className="truncate max-w-32">{domain}</div>
            ))}
            {domains.length > 2 && <div className="text-gray-500">+{domains.length - 2} more</div>}
          </div>
        );
      } catch {
        return <span className="text-xs text-gray-500">Invalid JSON</span>;
      }
    }
  },
  { 
    key: 'allowedIps', 
    label: 'Allowed IPs', 
    filterable: true,
    filterType: 'text',
    editableInline: true,
    editType: 'text',
    render: (token) => {
      if (!token.allowedIps) return '-';
      try {
        const ips = JSON.parse(token.allowedIps);
        return (
          <div className="text-xs">
            {ips.slice(0, 2).map((ip: string, idx: number) => (
              <div key={idx} className="font-mono">{ip}</div>
            ))}
            {ips.length > 2 && <div className="text-gray-500">+{ips.length - 2} more</div>}
          </div>
        );
      } catch {
        return <span className="text-xs text-gray-500">Invalid JSON</span>;
      }
    }
  },
  { 
    key: 'expiresAt', 
    label: 'Expires', 
    sortable: true,
    filterable: true,
    filterType: 'date',
    editableInline: true,
    editType: 'date',
    render: (token) => {
      if (!token.expiresAt) {
        return <span className="text-green-600 text-xs">Never</span>;
      }
      const expiresDate = new Date(token.expiresAt);
      const isExpired = expiresDate < new Date();
      return (
        <span className={`text-xs ${isExpired ? 'text-red-600' : 'text-gray-600'}`}>
          {formatApiDate(token.expiresAt)}
        </span>
      );
    }
  },
  { 
    key: 'createdAt', 
    label: 'Created', 
    sortable: true,
    filterable: true,
    filterType: 'date',
    render: (token) => (
      <span className="text-xs text-gray-500">
        {formatApiDate(token.createdAt)}
      </span>
    )
  }
];

// Mass actions for tokens
const tokenMassActions = [
  {
    name: 'revoke',
    label: 'Revoke Tokens',
    confirmMessage: 'Are you sure you want to revoke the selected tokens? This action cannot be undone.'
  },
  {
    name: 'updatePermissions',
    label: 'Update Permissions',
    confirmMessage: 'Are you sure you want to update permissions for the selected tokens?'
  },
  {
    name: 'extendExpiry',
    label: 'Extend Expiry',
    confirmMessage: 'Are you sure you want to extend the expiry date for the selected tokens?'
  },
  {
    name: 'delete',
    label: 'Delete Tokens',
    confirmMessage: 'Are you sure you want to delete the selected tokens? This action cannot be undone.'
  }
];

export default function TokensPage({ 
  tokens, 
  filters 
}: { 
  tokens?: IPaginatedResponse<Token> | null, 
  filters?: { sort?: string, direction?: 'asc' | 'desc' } 
}) {
  return (
    <ModelList<Token>
      title="API Tokens"
      items={tokens || null}
      filters={filters || {}}
      columns={tokenColumns}
      createRoute="/dashboard/tokens/create"
      editRoute={(id) => `/dashboard/tokens/edit/${id}`}
      deleteRoute={(id) => `/api/tokens/${id}`}
      massActionRoute="/api/tokens/mass-action"
      massActions={tokenMassActions}
    />
  );
}