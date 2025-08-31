import React from 'react';
import { Lead, Customer } from '../services/crmService';

interface CustomerCardProps {
  customer: Lead | Customer;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onClick,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className="p-4 bg-white rounded shadow cursor-pointer hover:shadow-lg transition"
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold text-gray-800">
        {customer.name}
      </h3>
      {'email' in customer && customer.email && (
        <p className="text-sm text-gray-500">{customer.email}</p>
      )}
      {(onEdit || onDelete) && (
        <div className="mt-2 flex gap-2">
          {onEdit && (
            <button
              className="text-blue-600 text-sm"
              onClick={e => {
                e.stopPropagation();
                onEdit();
              }}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              className="text-red-600 text-sm"
              onClick={e => {
                e.stopPropagation();
                onDelete();
              }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerCard;
