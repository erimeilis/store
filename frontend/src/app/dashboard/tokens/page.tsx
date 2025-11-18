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
  tableAccess: string[]; // Add table access field
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Check if token is a system token (admin or frontend)
const isSystemToken = (token: Token): boolean => {
  return token.id === 'admin-token' || token.id === 'frontend-token';
};

// Column definitions for Tokens management
const tokenColumns: IColumnDefinition<Token>[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
    filterable: true,
    filterType: 'text',
    editableInline: false, // System tokens are not editable inline
    editType: 'text',
    editValidation: { required: true, minLength: 1, maxLength: 255 },
    render: (token: Token) => {
      const isSystem = isSystemToken(token);
      return (
        <div className="flex items-center gap-2">
          <span className={isSystem ? 'font-semibold text-primary' : ''}>
            {token.name}
          </span>
          {isSystem && (
            <span className="badge badge-primary badge-sm">SYSTEM</span>
          )}
        </div>
      );
    }
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
      { value: 'read', label: 'Read Only (ro)' },
      { value: 'read,write', label: 'Read & Write (wr)' }
    ],
    editableInline: false, // System tokens are not editable inline
    editType: 'select',
    editOptions: [
      { value: 'read', label: 'Read Only (ro)' },
      { value: 'read,write', label: 'Read & Write (wr)' }
    ],
    render: (token: Token) => {
      const permissions = token.permissions.split(',');
      const hasWrite = permissions.includes('write');

      let badgeColor = 'badge-secondary';
      let label = 'Read Only (ro)';

      if (hasWrite) {
        badgeColor = 'badge-primary';
        label = 'Read & Write (wr)';
      }

      // Special handling for system tokens
      if (isSystemToken(token)) {
        if (token.id === 'admin-token') {
          badgeColor = 'badge-warning';
          label = 'Full Access (admin)';
        } else if (token.id === 'frontend-token') {
          badgeColor = 'badge-info';
          label = 'Read & Write (frontend)';
        }
      }

      return (
        <span className={`badge ${badgeColor}`}>
          {label}
        </span>
      );
    }
  },
  {
    key: 'allowedIps',
    label: 'Allowed IPs',
    filterable: true,
    filterType: 'text',
    editableInline: false, // System tokens are not editable inline
    editType: 'text',
    render: (token: Token) => {
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
    editableInline: false, // System tokens are not editable inline
    editType: 'date',
    render: (token: Token) => {
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
  // Separate system tokens from regular tokens
  const systemTokens = tokens?.data?.filter(isSystemToken) || [];
  const regularTokens = tokens?.data?.filter((token: Token) => !isSystemToken(token)) || [];

  return (
    <div className="space-y-6">
      <ModelList<Token>
        title="API Tokens"
        items={{
          ...tokens,
          data: regularTokens,
          currentPage: tokens?.currentPage || 1,
          lastPage: tokens?.lastPage || 1,
          perPage: tokens?.perPage || 10,
          total: tokens?.total || 0,
          from: tokens?.from || null,
          to: tokens?.to || null,
        } as IPaginatedResponse<Token>}
        filters={filters || {}}
        columns={tokenColumns}
        createRoute="/dashboard/tokens/create"
        editRoute={(id) => `/dashboard/tokens/edit/${id}`}
        deleteRoute={(id) => `/api/tokens/${id}`}
        massActionRoute="/api/tokens/mass-action"
        massActions={tokenMassActions}
        dataEndpoint="/api/tokens"
        compactPagination={true}
      />

      {/* System Tokens Section */}
      {systemTokens.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-base-content">System Tokens</h3>
          <div className="bg-base-200 rounded-lg p-4">
            <div className="grid gap-4 md:grid-cols-2">
              {systemTokens.map((token: Token) => (
                <div key={token.id} className="bg-base-100 rounded-lg p-4 border border-base-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-primary">{token.name}</span>
                      <span className="badge badge-primary badge-sm">SYSTEM</span>
                    </div>
                    <span className={`badge ${token.id === 'admin-token' ? 'badge-warning' : 'badge-info'}`}>
                      {token.id === 'admin-token' ? 'Full Access (admin)' : 'Read & Write (frontend)'}
                    </span>
                  </div>
                  <div className="text-xs text-base-content/70 font-mono">
                    {token.token.substring(0, 8)}...{token.token.substring(token.token.length - 4)}
                  </div>
                  <div className="text-xs text-base-content/60 mt-1">
                    Created: {formatApiDate(token.createdAt)}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-xs text-base-content/60">
              💡 System tokens cannot be edited or deleted as they are essential for application functionality.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
