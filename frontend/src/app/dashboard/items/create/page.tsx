import React from 'react';
import { ModelEdit } from '@/components/model/model-edit';

// Item interface matching our dashboard page structure
interface Item {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  category: string;
  createdAt?: string;
  updatedAt?: string;
}

// Form rendering function for item creation/editing
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
        {errors?.name && (
          <label className="label">
            <span className="label-text-alt text-error">{errors.name}</span>
          </label>
        )}
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
        {errors?.description && (
          <label className="label">
            <span className="label-text-alt text-error">{errors?.description}</span>
          </label>
        )}
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
          {errors?.price && (
            <label className="label">
              <span className="label-text-alt text-error">{errors?.price}</span>
            </label>
          )}
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
          {errors?.quantity && (
            <label className="label">
              <span className="label-text-alt text-error">{errors?.quantity}</span>
            </label>
          )}
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
        {errors?.category && (
          <label className="label">
            <span className="label-text-alt text-error">{errors?.category}</span>
          </label>
        )}
        <label className="label">
          <span className="label-text-alt">Categories help organize your inventory.</span>
        </label>
      </div>

      {readonly && data.createdAt && (
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
      )}
    </div>
  );
};

export default function CreateItemPage() {
  const newItem: Item = {
    id: '', // Will be generated by the server
    name: '',
    description: null,
    price: 0,
    quantity: 0,
    category: ''
  };

  return (
    <ModelEdit<Item>
      title="Item"
      item={newItem}
      backRoute="/dashboard"
      submitRoute="/api/items"
      method="post"
      renderForm={renderItemForm}
    />
  );
}