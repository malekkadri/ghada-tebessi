import React from 'react';
import { Lead, Customer } from '../services/crmService';

interface CustomerCardProps {
  customer: Lead | Customer;
  onClick?: () => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onClick }) => {
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
    </div>
  );
};

export default CustomerCard;
