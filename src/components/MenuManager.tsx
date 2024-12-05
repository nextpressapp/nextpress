"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

interface MenuItem {
  id: string;
  label: string;
  url: string;
  order: number;
  parentId: string | null;
  children: MenuItem[];
}

interface Menu {
  id: string;
  name: string;
  items: MenuItem[];
}

interface MenuManagerProps {
  isAdmin: boolean;
}

export default function MenuManager({ isAdmin }: MenuManagerProps) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [newItemLabel, setNewItemLabel] = useState("");
  const [newItemUrl, setNewItemUrl] = useState("");
  const [newMenuName, setNewMenuName] = useState("");

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    const response = await fetch("/api/menus");
    if (response.ok) {
      const data = await response.json();
      setMenus(data);
      if (data.length > 0) {
        setSelectedMenu(data[0]);
      }
    }
  };

  const handleMenuSelect = (menuId: string) => {
    const menu = menus.find((m) => m.id === menuId);
    if (menu) {
      setSelectedMenu(menu);
    }
  };

  const handleAddItem = async () => {
    if (!selectedMenu || !newItemLabel || !newItemUrl) return;

    const response = await fetch(`/api/menus/${selectedMenu.id}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newItemLabel, url: newItemUrl }),
    });

    if (response.ok) {
      const newItem = await response.json();
      setSelectedMenu({
        ...selectedMenu,
        items: [...selectedMenu.items, newItem],
      });
      setNewItemLabel("");
      setNewItemUrl("");
      toast({ title: "Menu item added successfully" });
    } else {
      toast({ title: "Error adding menu item", variant: "destructive" });
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination || !selectedMenu) return;

    const items = Array.from(selectedMenu.items);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index,
    }));

    setSelectedMenu({ ...selectedMenu, items: updatedItems });

    const response = await fetch(`/api/menus/${selectedMenu.id}/reorder`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: updatedItems }),
    });

    if (!response.ok) {
      toast({ title: "Error reordering menu items", variant: "destructive" });
    }
  };

  const handleAddMenu = async () => {
    if (!newMenuName) return;

    const response = await fetch("/api/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newMenuName }),
    });

    if (response.ok) {
      const newMenu = await response.json();
      setMenus([...menus, newMenu]);
      setNewMenuName("");
      toast({ title: "Menu created successfully" });
    } else {
      toast({ title: "Error creating menu", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="menu-select">Select Menu</Label>
        <select
          id="menu-select"
          value={selectedMenu?.id || ""}
          onChange={(e) => handleMenuSelect(e.target.value)}
          className="w-full mt-1 p-2 border rounded"
        >
          {menus.map((menu) => (
            <option key={menu.id} value={menu.id}>
              {menu.name}
            </option>
          ))}
        </select>
      </div>

      {selectedMenu && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Menu Items</h3>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="menu-items">
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-2"
                >
                  {selectedMenu.items.map((item, index) => (
                    <Draggable
                      key={item.id}
                      draggableId={item.id}
                      index={index}
                    >
                      {(provided) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="p-2 bg-gray-100 rounded"
                        >
                          {item.label} - {item.url}
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="new-item-label">New Item Label</Label>
        <Input
          id="new-item-label"
          value={newItemLabel}
          onChange={(e) => setNewItemLabel(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-item-url">New Item URL</Label>
        <Input
          id="new-item-url"
          value={newItemUrl}
          onChange={(e) => setNewItemUrl(e.target.value)}
        />
      </div>
      <Button onClick={handleAddItem}>Add Menu Item</Button>

      {isAdmin && (
        <div className="mt-8 space-y-2">
          <Label htmlFor="new-menu-name">New Menu Name</Label>
          <Input
            id="new-menu-name"
            value={newMenuName}
            onChange={(e) => setNewMenuName(e.target.value)}
          />
          <Button onClick={handleAddMenu}>Create New Menu</Button>
        </div>
      )}
    </div>
  );
}
