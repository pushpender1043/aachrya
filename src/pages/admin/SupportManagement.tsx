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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  MessageSquare, 
  Search, 
  Trash2, 
  Mail, 
  Reply, 
  CheckCircle2,
  Clock
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  created_at: string;
}

export default function SupportManagement() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null); // For viewing details
  const { toast } = useToast();

  // --- FETCH MESSAGES ---
  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({ title: "Error", description: "Failed to load messages", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // --- ACTIONS ---
  const markAsRead = async (id: string, currentStatus: string) => {
    if (currentStatus !== 'unread') return;
    
    // Optimistic UI update
    setMessages(prev => prev.map(m => m.id === id ? { ...m, status: 'read' } : m));

    await supabase.from("contact_messages").update({ status: 'read' }).eq("id", id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    const { error } = await supabase.from("contact_messages").delete().eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Message removed successfully" });
      setMessages(prev => prev.filter(m => m.id !== id));
    }
  };

  const handleReply = (email: string) => {
    window.location.href = `mailto:${email}`;
    // Optional: Update status to 'replied'
  };

  // --- STATS ---
  const unreadCount = messages.filter(m => m.status === 'unread').length;
  const totalMessages = messages.length;

  // --- FILTER ---
  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  <MessageSquare className="w-8 h-8 text-primary" /> Support Inbox
                </h1>
                <p className="text-muted-foreground">Hear what your users are saying.</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-primary uppercase tracking-wider">Unread Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary flex items-center gap-2">
                    {unreadCount}
                    <Mail className="w-6 h-6 opacity-50 animate-pulse" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-secondary/20 border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Received</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground flex items-center gap-2">
                    {totalMessages}
                    <Clock className="w-6 h-6 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search Bar */}
            <div className="flex gap-4 items-center bg-card/50 p-4 rounded-xl border border-border backdrop-blur-sm">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by Sender Name or Email..." 
                  className="pl-10 bg-background/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Messages Table */}
            <div className="rounded-xl border border-border bg-card shadow-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Sender</TableHead>
                    <TableHead>Message Preview</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10"><Loader2 className="animate-spin w-8 h-8 mx-auto text-primary" /></TableCell></TableRow>
                  ) : filteredMessages.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No messages found.</TableCell></TableRow>
                  ) : (
                    filteredMessages.map((msg) => (
                      <TableRow 
                        key={msg.id} 
                        className={`hover:bg-muted/30 transition-colors cursor-pointer ${msg.status === 'unread' ? 'bg-primary/5 font-medium' : ''}`}
                        onClick={() => {
                          setSelectedMessage(msg);
                          markAsRead(msg.id, msg.status);
                        }}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border border-border">
                               <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                 {msg.name.charAt(0).toUpperCase()}
                               </AvatarFallback>
                            </Avatar>
                            <div>
                               <p className="font-semibold">{msg.name}</p>
                               <p className="text-xs text-muted-foreground">{msg.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                           <p className="truncate max-w-[300px] text-muted-foreground">
                             {msg.message}
                           </p>
                        </TableCell>
                        <TableCell>
                           {msg.status === 'unread' ? (
                             <Badge className="bg-blue-500/10 text-blue-600 border-blue-200 animate-pulse">New</Badge>
                           ) : (
                             <Badge variant="outline" className="text-muted-foreground">Read</Badge>
                           )}
                        </TableCell>
                        <TableCell>
                           <span className="text-sm text-muted-foreground">
                             {new Date(msg.created_at).toLocaleDateString()}
                           </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" onClick={() => handleReply(msg.email)} title="Reply via Email">
                                <Reply className="w-4 h-4 text-green-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(msg.id)} title="Delete Message">
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Message Detail Modal (View Full Message) */}
            <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
               <DialogContent>
                  <DialogHeader>
                     <DialogTitle className="flex items-center gap-2">
                        Message from {selectedMessage?.name}
                     </DialogTitle>
                     <DialogDescription>{selectedMessage?.email}</DialogDescription>
                  </DialogHeader>
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border max-h-[60vh] overflow-y-auto">
                     <p className="text-sm leading-relaxed whitespace-pre-wrap">{selectedMessage?.message}</p>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                     <Button variant="outline" onClick={() => setSelectedMessage(null)}>Close</Button>
                     <Button onClick={() => selectedMessage && handleReply(selectedMessage.email)} className="gap-2">
                        <Reply className="w-4 h-4" /> Reply
                     </Button>
                  </div>
               </DialogContent>
            </Dialog>

          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}