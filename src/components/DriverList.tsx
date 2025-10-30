import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Driver {
  id: string;
  email: string;
  username: string | null;
}

const DriverList = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deleteDriver, setDeleteDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "driver");

      if (roleData && roleData.length > 0) {
        const userIds = roleData.map((r) => r.user_id);
        
        const { data, error: usersError } = await supabase.auth.admin.listUsers();
        
        if (usersError) throw usersError;

        const users = data?.users || [];
        const driverUsers = users.filter((u: any) => userIds.includes(u.id));

        const { data: profiles } = await supabase
          .from("profiles")
          .select("*")
          .in("id", userIds);

        const driversWithProfiles = driverUsers.map((user) => ({
          id: user.id,
          email: user.email || "",
          username: profiles?.find((p) => p.id === user.id)?.username || null,
        }));

        setDrivers(driversWithProfiles);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load drivers",
        variant: "destructive",
      });
    }
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to create drivers",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: {
          email: formData.email,
          password: formData.password,
          username: formData.username || undefined,
          role: "driver"
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || "Failed to create driver");
      }

      toast({
        title: "Success",
        description: "Driver account created successfully",
      });

      setShowForm(false);
      setFormData({ email: "", password: "", username: "" });
      fetchDrivers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create driver account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDriver) return;

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to update drivers",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("admin-update-user", {
        body: {
          userId: editingDriver.id,
          email: formData.email !== editingDriver.email ? formData.email : undefined,
          password: formData.password || undefined,
          username: formData.username
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || "Failed to update driver");
      }

      toast({
        title: "Success",
        description: "Driver account updated successfully",
      });

      cancelEdit();
      fetchDrivers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update driver account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteDriver = async () => {
    if (!deleteDriver) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "You must be logged in to delete drivers",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("admin-delete-user", {
        body: { userId: deleteDriver.id },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || "Failed to delete driver");
      }

      toast({
        title: "Success",
        description: "Driver deleted successfully",
      });

      setDeleteDriver(null);
      fetchDrivers();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete driver account",
        variant: "destructive",
      });
    }
  };

  const startEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      email: driver.email,
      password: "",
      username: driver.username || "",
    });
  };

  const cancelEdit = () => {
    setEditingDriver(null);
    setShowForm(false);
    setFormData({ email: "", password: "", username: "" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Driver Management</h2>
        {!showForm && !editingDriver && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Driver
          </Button>
        )}
      </div>

      {(showForm || editingDriver) && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              {editingDriver ? "Edit Driver" : "Create New Driver"}
            </h3>
            <Button variant="ghost" size="icon" onClick={cancelEdit}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={editingDriver ? handleUpdateDriver : handleCreateDriver} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password {editingDriver && "(leave blank to keep current)"}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingDriver}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : editingDriver ? "Update Driver" : "Create Driver"}
              </Button>
              <Button type="button" variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {drivers.map((driver) => (
          <Card key={driver.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{driver.username || "No username"}</p>
                <p className="text-sm text-muted-foreground">{driver.email}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => startEdit(driver)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDeleteDriver(driver)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteDriver} onOpenChange={() => setDeleteDriver(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the driver account for {deleteDriver?.email}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDriver}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DriverList;
