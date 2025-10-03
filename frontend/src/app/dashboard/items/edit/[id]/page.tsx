import React from 'react';
import { ModelEdit } from '@/components/model/model-edit';
import { clientApiRequest } from '@/lib/client-api';
import InputError from '@/components/ui/input-error';

// Item interface matching our dashboard page structure
interface Item {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  category: string;
  createdAt: string;
  updatedAt: string;
}

// Form rendering function for item creation/editing (same as create page)
const renderItemForm = (
  data: Item,
  setData: (key: string, value: any) => void,
  errors: Partial<Record<string, string>>,
  processing: boolean,
  readonly?: boolean
) => {
  return (
    <div className="space-y-4">
      {/* Name Field */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Name *</span>
        </label>
        <input
          type="text"
          className={`input input-bordered w-full ${errors?.name ? 'input-error' : ''}`}
          value={data.name || ''}
          onChange={(e) => setData('name', e.target.value)}
          disabled={processing || readonly}
          placeholder="Enter item name"
          required
        />
        <InputError message={errors?.name} />
      </div>

      {/* Description Field */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Description</span>
        </label>
        <textarea
          className={`textarea textarea-bordered w-full ${errors?.description ? 'textarea-error' : ''}`}
          value={data.description || ''}
          onChange={(e) => setData('description', e.target.value)}
          disabled={processing || readonly}
          placeholder="Enter item description (optional)"
          rows={3}
        />
        <InputError message={errors?.description} />
      </div>

      {/* Price and Quantity Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Price Field */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Price *</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              className={`input input-bordered w-full pl-8 ${errors?.price ? 'input-error' : ''}`}
              value={data.price || ''}
              onChange={(e) => setData('price', parseFloat(e.target.value) || 0)}
              disabled={processing || readonly}
              placeholder="0.00"
              required
            />
          </div>
          <InputError message={errors?.price} />
        </div>

        {/* Quantity Field */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text">Quantity *</span>
          </label>
          <input
            type="number"
            min="0"
            className={`input input-bordered w-full ${errors?.quantity ? 'input-error' : ''}`}
            value={data.quantity || ''}
            onChange={(e) => setData('quantity', parseInt(e.target.value) || 0)}
            disabled={processing || readonly}
            placeholder="0"
            required
          />
          <InputError message={errors?.quantity} />
        </div>
      </div>

      {/* Category Field */}
      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Category</span>
        </label>
        <input
          type="text"
          className={`input input-bordered w-full ${errors?.category ? 'input-error' : ''}`}
          value={data.category || ''}
          onChange={(e) => setData('category', e.target.value)}
          disabled={processing || readonly}
          placeholder="Enter item category (optional)"
        />
        <InputError message={errors?.category} />
        <label className="label">
          <span className="label-text-alt">Categories help organize your inventory.</span>
        </label>
      </div>

      {/* System Information */}
      <div className="divider">System Information</div>

      <div className="form-control w-full">
        <label className="label">
          <span className="label-text">Item ID</span>
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
            value={new Date(data.createdAt).toLocaleString()}
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
            value={new Date(data.updatedAt).toLocaleString()}
            disabled
          />
        </div>
      </div>
    </div>
  );
};

export default function EditItemPage({
  item,
  itemId,
  ...props
}: {
  item?: Item | null,
  itemId?: string
}) {
  console.log('EditItemPage props:', { item, itemId, props });

  const [itemData, setItemData] = React.useState<Item | null>(item || null);
  const [loading, setLoading] = React.useState(!item);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // If item is already provided from the server, no need to fetch
    if (item) {
      setItemData(item);
      setLoading(false);
      return;
    }

    const fetchItem = async () => {
      if (!itemId) {
        setError('Item ID is required');
        setLoading(false);
        return;
      }

      try {
        const response = await clientApiRequest(`/api/items/${itemId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Item not found');
          } else {
            setError('Failed to load item data');
          }
          setLoading(false);
          return;
        }

        const data = await response.json() as any;
        // Handle both direct item response and nested item response
        const fetchedItem = data.item || data;
        setItemData(fetchedItem);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching item:', err);
        setError('Failed to load item data');
        setLoading(false);
      }
    };

    fetchItem();
  }, [item, itemId]);

  if (loading) {
    return (
      <div className="px-4 py-6">
        <div className="alert alert-info">
          <span>Loading item data...</span>
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

  if (!itemData) {
    return (
      <div className="px-4 py-6">
        <div className="alert alert-error">
          <span>Item not found</span>
        </div>
      </div>
    );
  }

  return (
    <ModelEdit<Item>
      title="Item"
      item={itemData}
      backRoute="/dashboard"
      submitRoute={`/api/items/${itemData.id}`}
      method="put"
      renderForm={renderItemForm}
    />
  );
}