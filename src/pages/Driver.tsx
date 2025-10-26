import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, ArrowLeft, MapPin, Phone, Truck, Navigation, StickyNote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

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

const Driver = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredCustomers([]);
    } else {
      const filtered = customers.filter((customer) =>
        customer.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery, customers]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("customer_name");

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load customer data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Customer Search
          </h1>
          <p className="text-muted-foreground">
            Search for delivery information by customer name
          </p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Type customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-14 text-lg"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading customers...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {searchQuery && filteredCustomers.length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  No customers found matching "{searchQuery}"
                </p>
              </Card>
            )}

            {filteredCustomers.map((customer) => (
              <Card key={customer.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-2xl font-semibold text-foreground">
                      {customer.customer_name}
                    </h3>
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
        )}
      </div>
    </div>
  );
};

export default Driver;
