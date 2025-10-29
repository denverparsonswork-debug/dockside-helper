import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Plus, Eye, ShieldAlert } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
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
import CustomerForm from "@/components/CustomerForm";
import CustomerList from "@/components/CustomerList";
import DriverList from "@/components/DriverList";

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

const AdminDashboard = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/admin");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleData?.role === "admin") {
      setIsAdmin(true);
      fetchCustomers();
    } else {
      toast({
        title: "Access Denied",
        description: "You need admin privileges to access this page.",
        variant: "destructive",
      });
      navigate("/admin");
    }
  };

  const fetchCustomers = async () => {
    setIsLoading(true);
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
        description: "Failed to load customers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("customers")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Customer deleted successfully",
      });
      fetchCustomers();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCustomer(null);
    fetchCustomers();
  };

  const handleForceRelogin = async () => {
    try {
      // Get all users and sign them out
      const { data } = await supabase.auth.admin.listUsers();
      
      if (data?.users) {
        for (const user of data.users) {
          await supabase.auth.admin.signOut(user.id, 'global');
        }
      }

      toast({
        title: "Success",
        description: "All users have been signed out. You will now be redirected to login.",
      });

      // Sign out current admin and redirect
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate("/auth");
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to sign out all users",
        variant: "destructive",
      });
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage customer delivery information
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/driver")} variant="outline">
              <Eye className="mr-2 h-4 w-4" />
              View as Driver
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-6">
            <div className="mb-6">
              <Button onClick={() => setShowForm(true)} size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </div>

            {showForm && (
              <CustomerForm
                customer={editingCustomer}
                onClose={handleFormClose}
              />
            )}

            <CustomerList
              customers={customers}
              isLoading={isLoading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </TabsContent>

          <TabsContent value="drivers">
            <DriverList />
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Security Settings</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage system-wide security settings
                  </p>
                </div>

                <div className="border border-destructive/50 rounded-lg p-4 bg-destructive/5">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">
                        Force All Users to Re-login
                      </h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        This will immediately sign out all users (including yourself) and require everyone to log in again. Use this in case of security concerns.
                      </p>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            Force All Users to Re-login
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will sign out ALL users including yourself. Everyone will need to log in again with their credentials and complete 2FA verification.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleForceRelogin} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Yes, Sign Out Everyone
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
