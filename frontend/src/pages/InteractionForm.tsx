import React from 'react';
import { useParams } from 'react-router-dom';
import InteractionForm from '../components/InteractionForm';

const InteractionFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <div>No customer selected</div>;
  }

  return (
    <div className="space-y-4 py-6">
      <h1 className="text-2xl font-semibold">Log Interaction</h1>
      <InteractionForm customerId={id} />
    </div>
  );
};

export default InteractionFormPage;
