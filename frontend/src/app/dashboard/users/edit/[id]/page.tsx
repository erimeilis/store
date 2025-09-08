import React from 'react';
import { ModelEdit } from '../../../../../components/model/model-edit';

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

// Form rendering function for user creation/editing (same as create page)
const renderUserForm = (
  data: User,
  setData: (key: string, value: any) => void,
  errors: Partial<Record<string, string>>,
  processing: boolean,
  readonly?: boolean
) => {
  return (
    <div className="space-y-4">
      {/* Email Field */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Email *</span>
        </label>
        <input
          type="email"
          className={`input input-bordered w-full ${errors?.email ? 'input-error' : ''}`}
          value={data.email || ''}
          onChange={(e) => setData('email', e.target.value)}
          disabled={processing || readonly}
          placeholder="Enter email address"
          required
        />
        {errors?.email && (
          <label className="label">
            <span className="label-text-alt text-error">{errors?.email}</span>
          </label>
        )}
      </div>

      {/* Name Field */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Full Name</span>
        </label>
        <input
          type="text"
          className={`input input-bordered w-full ${errors?.name ? 'input-error' : ''}`}
          value={data.name || ''}
          onChange={(e) => setData('name', e.target.value)}
          disabled={processing || readonly}
          placeholder="Enter full name (optional)"
        />
        {errors?.name && (
          <label className="label">
            <span className="label-text-alt text-error">{errors?.name}</span>
          </label>
        )}
      </div>

      {/* Role Field */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Role *</span>
        </label>
        <select
          className={`select select-bordered w-full ${errors?.role ? 'select-error' : ''}`}
          value={data.role || 'user'}
          onChange={(e) => setData('role', e.target.value)}
          disabled={processing || readonly}
          required
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        {errors?.role && (
          <label className="label">
            <span className="label-text-alt text-error">{errors?.role}</span>
          </label>
        )}
        <label className="label">
          <span className="label-text-alt">Users can manage their own data, admins can manage all system data.</span>
        </label>
      </div>

      {/* Profile Picture URL */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Profile Picture URL</span>
        </label>
        <input
          type="url"
          className={`input input-bordered w-full ${errors?.picture ? 'input-error' : ''}`}
          value={data.picture || ''}
          onChange={(e) => setData('picture', e.target.value)}
          disabled={processing || readonly}
          placeholder="https://example.com/avatar.jpg (optional)"
        />
        {errors?.picture && (
          <label className="label">
            <span className="label-text-alt text-error">{errors?.picture}</span>
          </label>
        )}
        <label className="label">
          <span className="label-text-alt">Profile pictures are typically managed through Google OAuth.</span>
        </label>
      </div>

      {/* System Information */}
      <div className="divider">System Information</div>
      
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">User ID</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={data.id}
          disabled
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Created At</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={new Date(data.created_at).toLocaleString()}
            disabled
          />
        </div>
        
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Updated At</span>
          </label>
          <input
            type="text"
            className="input input-bordered w-full"
            value={new Date(data.updated_at).toLocaleString()}
            disabled
          />
        </div>
      </div>
    </div>
  );
};

export default function EditUserPage({ 
  user,
  params 
}: { 
  user?: User,
  params?: { id: string }
}) {
  // In a real implementation, you would fetch the user data here
  // For now, this is a placeholder structure
  
  if (!user && params?.id) {
    return (
      <div className="px-4 py-6">
        <div className="alert alert-warning">
          <span>Loading user data for ID: {params.id}...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="px-4 py-6">
        <div className="alert alert-error">
          <span>User not found</span>
        </div>
      </div>
    );
  }

  return (
    <ModelEdit<User>
      title="User"
      item={user}
      backRoute="/dashboard/users"
      submitRoute={`/api/users/${user.id}`}
      method="put"
      renderForm={renderUserForm}
    />
  );
}