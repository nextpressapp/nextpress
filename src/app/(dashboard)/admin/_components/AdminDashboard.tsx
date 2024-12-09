"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, StickyNote, Users } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import UserForm from "@/app/(dashboard)/admin/_components/UserForm";
import { useSession } from "next-auth/react";

interface UserListItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

export function AdminDashboard({ stats, initialUsers }: { stats: number[]; initialUsers: UserListItem[] }) {
  const { data: session } = useSession();

  const cards = [
    { title: "Users", value: stats[0], icon: Users },
    { title: "Posts", value: stats[1], icon: StickyNote },
    { title: "Pages", value: stats[2], icon: FileText },
    { title: "Events", value: stats[3], icon: Calendar },
  ];
  const [users, setUsers] = useState<UserListItem[]>(initialUsers);
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleEdit = (user: UserListItem) => {
    setEditingUser(user);
  };

  const handleDelete = async (userId: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setUsers(users.filter(user => user.id !== userId));
          toast({ title: "User deleted successfully" });
        } else {
          toast({ title: "Error deleting user", variant: "destructive" });
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        toast({ title: "Error deleting user", variant: "destructive" });
      }
    }
  };

  const handleImpersonate = async (userId: string) => {
    try {
      const response = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        toast({ title: "Impersonation successful" });
        router.push("/dashboard");
      } else {
        toast({ title: "Error impersonating user", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error impersonating user:", error);
      toast({ title: "Error impersonating user", variant: "destructive" });
    }
  };

  const handleUserUpdated = (updatedUser: UserListItem) => {
    setUsers(users.map(user => (user.id === updatedUser.id ? updatedUser : user)));
    setEditingUser(null);
    toast({ title: "User updated successfully" });
  };

  const handleUserCreated = (newUser: UserListItem) => {
    setUsers([...users, newUser]);
    toast({ title: "User created successfully" });
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Button onClick={() => setEditingUser({ id: "", name: "", email: "", role: "USER" })} className="mb-4">
        Create New User
      </Button>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(user)} variant="outline" className="mr-2">
                  Edit
                </Button>
                {session?.user.email !== user.email && (
                  <>
                    <Button onClick={() => handleDelete(user.id)} variant="destructive" className="mr-2">
                      Delete
                    </Button>
                    <Button onClick={() => handleImpersonate(user.id)} variant="secondary">
                      Impersonate
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editingUser && (
        <UserForm
          user={editingUser}
          onSubmit={editingUser.id ? handleUserUpdated : handleUserCreated}
          onCancel={() => setEditingUser(null)}
        />
      )}
    </div>
  );
}
