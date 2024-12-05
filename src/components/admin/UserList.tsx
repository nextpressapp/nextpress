"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import UserForm from "./UserForm";
import { useRouter } from "next/navigation";

// Define a new interface for the user data we're actually using
interface UserListItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface UserListProps {
  initialUsers: UserListItem[];
}

export default function UserList({ initialUsers }: UserListProps) {
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
          setUsers(users.filter((user) => user.id !== userId));
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
    setUsers(
      users.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
    );
    setEditingUser(null);
    toast({ title: "User updated successfully" });
  };

  const handleUserCreated = (newUser: UserListItem) => {
    setUsers([...users, newUser]);
    toast({ title: "User created successfully" });
  };

  return (
    <div>
      <Button
        onClick={() =>
          setEditingUser({ id: "", name: "", email: "", role: "USER" })
        }
        className="mb-4"
      >
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
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Button
                  onClick={() => handleEdit(user)}
                  variant="outline"
                  className="mr-2"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(user.id)}
                  variant="destructive"
                  className="mr-2"
                >
                  Delete
                </Button>
                <Button
                  onClick={() => handleImpersonate(user.id)}
                  variant="secondary"
                >
                  Impersonate
                </Button>
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
