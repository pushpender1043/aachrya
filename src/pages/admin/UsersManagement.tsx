import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  Users, 
  Search, 
  Shield, 
  Mail, 
  Phone, 
  UserCheck 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

// --- INTERFACE ---
interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  created_at: string;
  user_roles?: Array<{ role: string }>;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // --- FETCH LOGIC (UNCHANGED) ---
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    // 1. Fetch Profiles
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // 2. Fetch Roles manually (Safe way)
    const usersWithRoles = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", profile.id);
        
        return {
          ...profile,
          user_roles: roles || []
        };
      })
    );

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const getUserRole = (user: User) => {
    return user.user_roles && user.user_roles.length > 0
      ? user.user_roles[0].role
      : "user";
  };

  // --- STATS LOGIC ---
  const totalUsers = users.length;
  const adminCount = users.filter(u => getUserRole(u) === 'admin').length;
  const newUsersToday = users.filter(u => new Date(u.created_at).toDateString() === new Date().toDateString()).length;

  // --- FILTER LOGIC ---
  const filteredUsers = users.filter(u => 
    (u.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (u.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (u.phone || "").includes(searchTerm)
  );

  // --- UI RENDER (SHYNEX THEME) ---
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <main className="flex-1 p-6 w-full overflow-hidden">
          <SidebarTrigger className="md:hidden mb-4" />

          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
                  <Users className="w-8 h-8 text-primary" /> User Directory
                </h1>
                <p className="text-muted-foreground">Monitor and manage registered accounts.</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-primary uppercase tracking-wider">Total Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary flex items-center gap-2">
                    {totalUsers}
                    <UserCheck className="w-6 h-6 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-500/5 border-purple-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-600 uppercase tracking-wider">Admins</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-700 flex items-center gap-2">
                    {adminCount}
                    <Shield className="w-6 h-6 opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-500/5 border-blue-500/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-600 uppercase tracking-wider">Joined Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-700 flex items-center gap-2">
                    +{newUsersToday}
                    <Users className="w-6 h-6 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search Bar */}
            <div className="flex gap-4 items-center bg-card/50 p-4 rounded-xl border border-border backdrop-blur-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by Name, Email or Phone..." 
                  className="pl-10 bg-background/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Users Table */}
            <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>User Profile</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-10"><Loader2 className="animate-spin w-8 h-8 mx-auto text-primary" /></TableCell></TableRow>
                  ) : filteredUsers.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No users found.</TableCell></TableRow>
                  ) : (
                    filteredUsers.map((user) => {
                      const role = getUserRole(user);
                      return (
                        <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 border border-border">
                                <AvatarImage src="" /> {/* Add avatar_url if available later */}
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold">{user.full_name || "Unknown"}</p>
                                <p className="text-xs text-muted-foreground">ID: {user.id.slice(0, 8)}...</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 text-sm">
                               <div className="flex items-center gap-2">
                                  <Mail className="w-3 h-3 text-muted-foreground" />
                                  {user.email}
                               </div>
                               <div className="flex items-center gap-2">
                                  <Phone className="w-3 h-3 text-muted-foreground" />
                                  {user.phone || "N/A"}
                               </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={role === "admin" ? "default" : "secondary"} className={
                                role === "admin" 
                                ? "bg-purple-500/10 text-purple-600 border-purple-200 hover:bg-purple-500/20" 
                                : "bg-blue-500/10 text-blue-600 border-blue-200 hover:bg-blue-500/20"
                            }>
                              {role.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                               {new Date(user.created_at).toLocaleDateString("en-IN", {
                                  year: 'numeric', month: 'short', day: 'numeric'
                               })}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}