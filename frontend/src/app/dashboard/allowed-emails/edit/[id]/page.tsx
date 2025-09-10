import React from 'react';
import { ModelEdit } from '../../../../../components/model/model-edit';
import { clientApiRequest } from '../../../../../lib/client-api';

// AllowedEmail interface matching our Prisma schema
interface AllowedEmail {
  id: string;
  email: string | null;
  domain: string | null;
  type: string;
  created_at: string;
}

// Form rendering function for allowed email creation/editing (same as create page)
const renderAllowedEmailForm = (
  data: AllowedEmail,
  setData: (key: string, value: any) => void,
  errors: Partial<Record<string, string>>,
  processing: boolean,
  readonly?: boolean
) => {
  return (
    <div className="space-y-4">
      {/* Type Field */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Type *</span>
        </label>
        <select
          className={`select select-bordered w-full ${errors?.type ? 'select-error' : ''}`}
          value={data.type || 'email'}
          onChange={(e) => {
            setData('type', e.target.value);
            // Clear the other field when type changes
            if (e.target.value === 'email') {
              setData('domain', null);
            } else {
              setData('email', null);
            }
          }}
          disabled={processing || readonly}
          required
        >
          <option value="email">Specific Email</option>
          <option value="domain">Domain Pattern</option>
        </select>
        {errors?.type && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.type}</span>
          </label>
        )}
        <label className="label">
          <span className="label-text-alt">
            Choose "Specific Email" to allow one email address, or "Domain Pattern" to allow all emails from a domain.
          </span>
        </label>
      </div>

      {/* Email Field - only show when type is 'email' */}
      {data.type === 'email' && (
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Email Address *</span>
          </label>
          <input
            type="email"
            className={`input input-bordered w-full ${errors?.email ? 'input-error' : ''}`}
            value={data.email || ''}
            onChange={(e) => setData('email', e.target.value)}
            disabled={processing || readonly}
            placeholder="user@example.com"
            required
          />
          {errors?.email && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.email}</span>
            </label>
          )}
          <label className="label">
            <span className="label-text-alt">Enter the specific email address to allow access.</span>
          </label>
        </div>
      )}

      {/* Domain Field - only show when type is 'domain' */}
      {data.type === 'domain' && (
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Domain Pattern *</span>
          </label>
          <input
            type="text"
            className={`input input-bordered w-full ${errors?.domain ? 'input-error' : ''}`}
            value={data.domain || ''}
            onChange={(e) => setData('domain', e.target.value)}
            disabled={processing || readonly}
            placeholder="example.com or @example.com"
            required
          />
          {errors?.domain && (
            <label className="label">
              <span className="label-text-alt text-error">{errors.domain}</span>
            </label>
          )}
          <label className="label">
            <span className="label-text-alt">
              Enter a domain like "example.com" to allow all emails from that domain (e.g., user@example.com, admin@example.com).
            </span>
          </label>
        </div>
      )}

      {/* System Information */}
      <div className="divider">System Information</div>
      
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Rule ID</span>
        </label>
        <input
          type="text"
          className="input input-bordered w-full"
          value={data.id}
          disabled
        />
      </div>

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
    </div>
  );
};

export default function EditAllowedEmailPage({ 
  allowedEmailData,
  allowedEmailId,
  ...props
}: { 
  allowedEmailData?: AllowedEmail | null,
  allowedEmailId?: string
}) {
  console.log('EditAllowedEmailPage props:', { allowedEmailData, allowedEmailId, props });
  
  const [allowedEmail, setAllowedEmail] = React.useState<AllowedEmail | null>(allowedEmailData || null);
  const [loading, setLoading] = React.useState(!allowedEmailData);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // If allowedEmailData is already provided from the server, no need to fetch
    if (allowedEmailData) {
      setAllowedEmail(allowedEmailData);
      setLoading(false);
      return;
    }

    const fetchAllowedEmail = async () => {
      if (!allowedEmailId) {
        setError('Allowed Email ID is required');
        setLoading(false);
        return;
      }

      try {
        const response = await clientApiRequest(`/api/allowed-emails/${allowedEmailId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Allowed email rule not found');
          } else {
            setError('Failed to load allowed email data');
          }
          setLoading(false);
          return;
        }

        const fetchedAllowedEmailData = await response.json() as AllowedEmail;
        setAllowedEmail(fetchedAllowedEmailData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching allowed email:', err);
        setError('Failed to load allowed email data');
        setLoading(false);
      }
    };

    fetchAllowedEmail();
  }, [allowedEmailData, allowedEmailId]);

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="alert alert-info">
          <span>Loading allowed email data...</span>
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

  if (!allowedEmail) {
    return (
      <div className="px-4 py-6">
        <div className="alert alert-error">
          <span>Allowed email rule not found</span>
        </div>
      </div>
    );
  }

  return (
    <ModelEdit<AllowedEmail>
      title="Allowed Email"
      item={allowedEmail}
      backRoute="/dashboard/allowed-emails"
      submitRoute={`/api/allowed-emails/${allowedEmail.id}`}
      method="put"
      renderForm={renderAllowedEmailForm}
    />
  );
}