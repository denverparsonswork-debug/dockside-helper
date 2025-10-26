import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Truck, Navigation, StickyNote, Pencil, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Customer {
  id: string;
  customer_name: string;
  address: string | null;
  phone_number: string | null;
  truck: string | null;
  dock_location: string | null;
  route: string | null;
  notes: string | null;
}

interface CustomerListProps {
  customers: Customer[];
  isLoading: boolean;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
}

const CustomerList = ({ customers, isLoading, onEdit, onDelete }: CustomerListProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading customers...</p>
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          No customers yet. Add your first customer to get started.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {customers.map((customer) => (
        <Card key={customer.id} className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-2xl font-semibold text-foreground">
                {customer.customer_name}
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(customer)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {customer.customer_name}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(customer.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {customer.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="text-foreground">{customer.address}</p>
                  </div>
                </div>
              )}

              {customer.phone_number && (
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-foreground">{customer.phone_number}</p>
                  </div>
                </div>
              )}

              {customer.truck && (
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Truck Type</p>
                    <p className="text-foreground">{customer.truck}</p>
                  </div>
                </div>
              )}

              {customer.dock_location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Dock Location</p>
                    <p className="text-foreground font-medium">{customer.dock_location}</p>
                  </div>
                </div>
              )}

              {customer.route && (
                <div className="flex items-start gap-3">
                  <Navigation className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Route</p>
                    <p className="text-foreground">{customer.route}</p>
                  </div>
                </div>
              )}
            </div>

            {customer.notes && (
              <div className="flex items-start gap-3 pt-2 border-t">
                <StickyNote className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-foreground">{customer.notes}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CustomerList;
