import React from 'react';
import { ModelEdit } from '../../../../../components/model/model-edit';
import { clientApiRequest } from '../../../../../lib/client-api';

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
  userData,
  userId,
  ...props
}: { 
  userData?: User | null,
  userId?: string
}) {
  console.log('EditUserPage props:', { userData, userId, props });
  
  const [user, setUser] = React.useState<User | null>(userData || null);
  const [loading, setLoading] = React.useState(!userData);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // If userData is already provided from the server, no need to fetch
    if (userData) {
      setUser(userData);
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        const response = await clientApiRequest(`/api/users/${userId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('User not found');
          } else {
            setError('Failed to load user data');
          }
          setLoading(false);
          return;
        }

        const fetchedUserData = await response.json() as User;
        setUser(fetchedUserData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Failed to load user data');
        setLoading(false);
      }
    };

    fetchUser();
  }, [userData, userId]);

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="alert alert-info">
          <span>Loading user data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6">
        <div className="alert alert-error">
          <span>{error}</span>
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