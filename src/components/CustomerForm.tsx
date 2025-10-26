import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import AutocompleteInput from "./AutocompleteInput";
import { X } from "lucide-react";
import { z } from "zod";

const customerSchema = z.object({
  customer_name: z.string().trim().min(1, "Customer name is required").max(200),
  address: z.string().trim().max(500).optional(),
  phone_number: z.string().trim().max(50).optional(),
  truck: z.string().optional(),
  dock_location: z.string().trim().max(200).optional(),
  route: z.string().optional(),
  notes: z.string().trim().max(1000).optional(),
});

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

interface CustomerFormProps {
  customer: Customer | null;
  onClose: () => void;
}

const CustomerForm = ({ customer, onClose }: CustomerFormProps) => {
  const [formData, setFormData] = useState({
    customer_name: "",
    address: "",
    phone_number: "",
    truck: "",
    dock_location: "",
    route: "",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (customer) {
      setFormData({
        customer_name: customer.customer_name,
        address: customer.address || "",
        phone_number: customer.phone_number || "",
        truck: customer.truck || "",
        dock_location: customer.dock_location || "",
        route: customer.route || "",
        notes: customer.notes || "",
      });
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validatedData = customerSchema.parse(formData);

      const dataToSubmit = {
        customer_name: validatedData.customer_name,
        address: validatedData.address || null,
        phone_number: validatedData.phone_number || null,
        truck: validatedData.truck || null,
        dock_location: validatedData.dock_location || null,
        route: validatedData.route || null,
        notes: validatedData.notes || null,
      };

      if (customer) {
        const { error } = await supabase
          .from("customers")
          .update(dataToSubmit)
          .eq("id", customer.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Customer updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("customers")
          .insert([dataToSubmit]);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Customer added successfully",
        });
      }

      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else if (error instanceof Error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">
          {customer ? "Edit Customer" : "Add New Customer"}
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Customer Name *</Label>
            <Input
              id="customer_name"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="truck">Truck Type</Label>
            <AutocompleteInput
              id="truck"
              value={formData.truck}
              onChange={(value) => setFormData({ ...formData, truck: value })}
              table="customers"
              column="truck"
              placeholder="Enter truck type"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="route">Route</Label>
            <AutocompleteInput
              id="route"
              value={formData.route}
              onChange={(value) => setFormData({ ...formData, route: value })}
              table="customers"
              column="route"
              placeholder="Enter route"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="dock_location">Dock Location</Label>
            <AutocompleteInput
              id="dock_location"
              value={formData.dock_location}
              onChange={(value) => setFormData({ ...formData, dock_location: value })}
              table="customers"
              column="dock_location"
              placeholder="Enter dock location"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : customer ? "Update Customer" : "Add Customer"}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CustomerForm;
