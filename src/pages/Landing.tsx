import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Truck, UserCog } from "lucide-react";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Delivery Hub
          </h1>
          <p className="text-xl text-muted-foreground">
            Quick access to customer delivery information
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card 
            className="p-8 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
            onClick={() => navigate("/driver")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Driver</h2>
              <p className="text-muted-foreground">
                Search and view customer delivery information
              </p>
              <Button className="w-full" size="lg">
                Enter as Driver
              </Button>
            </div>
          </Card>

          <Card 
            className="p-8 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-accent"
            onClick={() => navigate("/admin")}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
                <UserCog className="w-10 h-10 text-accent" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground">Admin</h2>
              <p className="text-muted-foreground">
                Manage customer database and settings
              </p>
              <Button variant="secondary" className="w-full" size="lg">
                Admin Login
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Landing;
