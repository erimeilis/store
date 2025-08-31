import React from 'react';
import { ModelList, IColumnDefinition } from '../../../components/model/model-list';

// User interface matching our Prisma schema
interface User {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

// Column definitions for Users management
const userColumns: IColumnDefinition<User>[] = [
  { 
    key: 'email', 
    label: 'Email', 
    sortable: true, 
    filterable: true,
    filterType: 'text'
  },
  { 
    key: 'name', 
    label: 'Name', 
    sortable: true, 
    filterable: true,
    filterType: 'text',
    render: (user) => user.name || '-'
  },
  { 
    key: 'role', 
    label: 'Role', 
    sortable: true,
    filterable: true,
    filterType: 'select',
    filterOptions: [
      { value: 'user', label: 'User' },
      { value: 'admin', label: 'Admin' }
    ],
    editableInline: true,
    editType: 'select',
    editOptions: [
      { value: 'user', label: 'User' },
      { value: 'admin', label: 'Admin' }
    ],
    render: (user) => (
      <span className={`badge ${user.role === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
        {user.role === 'admin' ? 'Admin' : 'User'}
      </span>
    )
  },
  { 
    key: 'picture', 
    label: 'Avatar', 
    render: (user) => user.picture ? (
      <div className="avatar">
        <div className="w-8 h-8 rounded-full">
          <img src={user.picture} alt={`${user.name || user.email} avatar`} />
        </div>
      </div>
    ) : (
      <div className="avatar placeholder">
        <div className="bg-neutral text-neutral-content rounded-full w-8 h-8">
          <span className="text-xs">{(user.name || user.email)?.[0]?.toUpperCase()}</span>
        </div>
      </div>
    )
  },
  { 
    key: 'created_at', 
    label: 'Created', 
    sortable: true,
    filterable: true,
    filterType: 'date',
    render: (user) => new Date(user.created_at).toLocaleDateString()
  }
];

// Mass actions for users
const userMassActions = [
  {
    name: 'make_admin',
    label: 'Make Admin',
    confirmMessage: 'Are you sure you want to promote the selected users to admin?'
  },
  {
    name: 'make_user',
    label: 'Make User',
    confirmMessage: 'Are you sure you want to demote the selected users to regular user?'
  },
  {
    name: 'delete',
    label: 'Delete Users',
    confirmMessage: 'Are you sure you want to delete the selected users? This action cannot be undone.'
  }
];

export default function UsersPage({ 
  users, 
  filters 
}: { 
  users?: { 
    data: User[], 
    current_page: number, 
    last_page: number, 
    per_page: number, 
    total: number 
  }, 
  filters?: { sort?: string, direction?: 'asc' | 'desc' } 
}) {
  return (
    <ModelList<User>
      title="Users Management"
      items={users || null}
      filters={filters || {}}
      columns={userColumns}
      createRoute="/dashboard/users/create"
      editRoute={(id) => `/dashboard/users/edit/${id}`}
      deleteRoute={(id) => `/api/users/${id}`}
      massActionRoute="/api/users/mass-action"
      massActions={userMassActions}
    />
  );
}