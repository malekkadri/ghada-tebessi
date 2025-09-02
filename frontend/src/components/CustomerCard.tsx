import React from 'react';
import { Lead, Customer } from '../services/crmService';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <Card
      onClick={onClick}
      className="cursor-pointer transition hover:shadow-md"
    >
      <CardHeader>
        <CardTitle className="text-lg">{customer.name}</CardTitle>
      </CardHeader>

      <CardContent>
        {"email" in customer && customer.email && (
          <p className="text-sm text-muted-foreground">{customer.email}</p>
        )}
      </CardContent>

      {(onEdit || onDelete) && (
        <CardFooter className="flex gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              Delete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default CustomerCard;
