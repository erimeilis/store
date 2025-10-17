import React from 'react';
import { ModelEdit } from '@/components/model/model-edit';
import { clientApiRequest } from '@/lib/client-api';
import InputError from '@/components/ui/input-error';
import {Input} from '@/components/ui/input';
import {Select} from '@/components/ui/select';

// User interface matching our Prisma schema
interface User {
  id: string;
  email: string;
  name: string | null;
  picture: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
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
        <Input
          type="email"
          color={errors?.email ? 'error' : 'default'}
          className="w-full"
          value={data.email || ''}
          onChange={(e) => setData('email', e.target.value)}
          disabled={processing || readonly}
          placeholder="Enter email address"
          required
        />
        <InputError message={errors?.email} />
      </div>

      {/* Name Field */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Full Name</span>
        </label>
        <Input
          type="text"
          color={errors?.name ? 'error' : 'default'}
          className="w-full"
          value={data.name || ''}
          onChange={(e) => setData('name', e.target.value)}
          disabled={processing || readonly}
          placeholder="Enter full name (optional)"
        />
        <InputError message={errors?.name} />
      </div>

      {/* Role Field */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Role *</span>
        </label>
        <Select
          color={errors?.role ? 'error' : 'default'}
          className="w-full"
          value={data.role || 'user'}
          onChange={(e) => setData('role', e.target.value)}
          disabled={processing || readonly}
          required
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </Select>
        <InputError message={errors?.role} />
        <label className="label">
          <span className="label-text-alt">Users can manage their own data, admins can manage all system data.</span>
        </label>
      </div>

      {/* Profile Picture URL */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Profile Picture URL</span>
        </label>
        <Input
          type="url"
          color={errors?.picture ? 'error' : 'default'}
          className="w-full"
          value={data.picture || ''}
          onChange={(e) => setData('picture', e.target.value)}
          disabled={processing || readonly}
          placeholder="https://example.com/avatar.jpg (optional)"
        />
        <InputError message={errors?.picture} />
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
        <Input
          type="text"
          className="w-full"
          value={data.id}
          disabled
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Created At</span>
          </label>
          <Input
            type="text"
            className="w-full"
            value={new Date(data.createdAt).toLocaleString()}
            disabled
          />
        </div>

        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Updated At</span>
          </label>
          <Input
            type="text"
            className="w-full"
            value={new Date(data.updatedAt).toLocaleString()}
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