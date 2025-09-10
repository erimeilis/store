import React from 'react';
import { ModelList, IColumnDefinition } from '../../../components/model/model-list';
import { IPaginatedResponse } from '../../../types/models';
import { formatApiDate } from '../../../lib/date-utils';

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
    render: (user) => formatApiDate(user.created_at)
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
  filters,
  currentUser
}: { 
  users?: IPaginatedResponse<User> | null, 
  filters?: { sort?: string, direction?: 'asc' | 'desc' },
  currentUser?: { id: string; name: string; email: string; role: string; image?: string }
}) {
  const isAdmin = currentUser?.role === 'admin';
  
  // Debug logging
  console.log('🔍 UsersPage Debug:', {
    currentUser,
    isAdmin,
    hasCurrentUser: !!currentUser,
    userRole: currentUser?.role,
    userEmail: currentUser?.email,
    massActionRoute: isAdmin ? "/api/users/mass-action" : "",
    hasMassActions: isAdmin && userMassActions ? userMassActions.length : 0,
    massActions: isAdmin ? userMassActions : null
  });
  
  // Filter columns based on user role
  const visibleColumns = userColumns.map(column => {
    // Only admins can edit roles inline
    if (column.key === 'role' && !isAdmin) {
      return {
        ...column,
        editableInline: false
      };
    }
    return column;
  });

  // Build props conditionally based on admin status
  const modelListProps = {
    title: "Users Management",
    items: users || null,
    filters: filters || {},
    columns: visibleColumns,
    createRoute: isAdmin ? "/dashboard/users/create" : "",
    editRoute: isAdmin ? (id: string | number) => `/dashboard/users/edit/${id}` : () => "",
    deleteRoute: isAdmin ? (id: string | number) => `/api/users/${id}` : () => "",
    inlineEditRoute: isAdmin ? (id: string | number) => `/api/users/${id}` : () => "",
    massActionRoute: isAdmin ? "/api/users/mass-action" : "",
    ...(isAdmin && { massActions: userMassActions })
  };

  return <ModelList<User> {...modelListProps} />;
}