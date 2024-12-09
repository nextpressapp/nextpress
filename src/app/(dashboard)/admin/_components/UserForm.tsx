"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface UserListItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
}

interface UserFormProps {
  user: UserListItem;
  onSubmit: (user: UserListItem) => void;
  onCancel: () => void;
}

export default function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email);
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user.role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userData = { ...user, name, email, password, role };
    if (user.id) {
      // Update existing user
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        const updatedUser = await response.json();
        onSubmit(updatedUser);
      }
    } else {
      // Create new user
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        const newUser = await response.json();
        onSubmit(newUser);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.id ? "Edit User" : "Create User"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="password">{user.id ? "New Password (leave blank to keep current)" : "Password"}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              {...(user.id ? {} : { required: true })}
            />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value: string) => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="EDITOR">Editor</SelectItem>
                <SelectItem value="MANAGER">Manager</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button onClick={onCancel} variant="outline">
          Cancel
        </Button>
        <Button onClick={handleSubmit}>{user.id ? "Update" : "Create"}</Button>
      </CardFooter>
    </Card>
  );
}
