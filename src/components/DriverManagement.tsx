import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, UserPlus } from "lucide-react";

const DriverManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password) {
      toast({
        title: "Error",
        description: "Username and password are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create auth user with a fake email (since we're not using real emails)
      const email = `${username.toLowerCase()}@driver.local`;
      
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          }
        }
      });

      if (signUpError) throw signUpError;

      if (authData.user) {
        // Insert profile
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: authData.user.id,
            username: username,
          });

        if (profileError) throw profileError;

        // Assign driver role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: authData.user.id,
            role: "driver",
          });

        if (roleError) throw roleError;

        toast({
          title: "Success",
          description: `Driver account created for ${username}`,
        });

        setUsername("");
        setPassword("");
        setShowForm(false);
      }
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

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Driver Management</h2>
          <p className="text-muted-foreground">Create driver accounts</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} variant="outline">
            <UserPlus className="mr-2 h-4 w-4" />
            Create Driver
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleCreateDriver} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter driver username"
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Simple passwords are acceptable for driver accounts
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                <Plus className="mr-2 h-4 w-4" />
                {isLoading ? "Creating..." : "Create Driver"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setUsername("");
                  setPassword("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default DriverManagement;