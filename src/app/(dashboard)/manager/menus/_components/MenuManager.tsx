'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'
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
} from "@/components/ui/alert-dialog"
import { GripVertical } from 'lucide-react'

interface MenuItem {
    id: string
    label: string
    url: string
    order: number
    parentId: string | null
    children: MenuItem[]
}

interface Menu {
    id: string
    name: string
    items: MenuItem[]
}

interface MenuManagerProps {
    isAdmin: boolean
}

export default function MenuManager({ isAdmin }: MenuManagerProps) {
    const { data: session } = useSession()
    const [menus, setMenus] = useState<Menu[]>([])
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null)
    const [newItemLabel, setNewItemLabel] = useState('')
    const [newItemUrl, setNewItemUrl] = useState('')
    const [newItemParent, setNewItemParent] = useState<string>('none')
    const [newMenuName, setNewMenuName] = useState('')
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null)

    const canManageMenus = session?.user.role === 'ADMIN' || session?.user.role === 'EDITOR'

    useEffect(() => {
        fetchMenus()
    }, [])

    const fetchMenus = async () => {
        try {
            const response = await fetch('/api/menus')
            if (response.ok) {
                const data = await response.json()
                setMenus(data)
                if (data.length > 0) {
                    setSelectedMenu(data[0])
                }
            } else {
                toast({ title: 'Error fetching menus', variant: 'destructive' })
            }
        } catch (error) {
            console.error('Error fetching menus:', error)
            toast({ title: 'Error fetching menus', variant: 'destructive' })
        }
    }

    const handleMenuSelect = (menuId: string) => {
        const menu = menus.find(m => m.id === menuId)
        if (menu) {
            setSelectedMenu(menu)
        }
    }

    const handleAddItem = async () => {
        if (!selectedMenu || !newItemLabel || !newItemUrl || !canManageMenus) return

        try {
            const response = await fetch(`/api/menus/${selectedMenu.id}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    label: newItemLabel,
                    url: newItemUrl,
                    parentId: newItemParent === "none" ? null : newItemParent
                }),
            })

            if (response.ok) {
                const newItem = await response.json()
                setSelectedMenu(prevMenu => {
                    if (!prevMenu) return null
                    return {
                        ...prevMenu,
                        items: Array.isArray(prevMenu.items) ? [...prevMenu.items, newItem] : [newItem]
                    }
                })
                setNewItemLabel('')
                setNewItemUrl('')
                setNewItemParent('none')
                toast({ title: 'Menu item added successfully' })
            } else {
                toast({ title: 'Error adding menu item', variant: 'destructive' })
            }
        } catch (error) {
            console.error('Error adding menu item:', error)
            toast({ title: 'Error adding menu item', variant: 'destructive' })
        }
    }

    const handleEditItem = async (item: MenuItem) => {
        if (!canManageMenus) return
        setEditingItem(item)
    }

    const handleUpdateItem = async () => {
        if (!editingItem || !canManageMenus) return

        try {
            const response = await fetch(`/api/menu-items`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingItem),
            })

            if (response.ok) {
                const updatedItem = await response.json()
                setSelectedMenu(prevMenu => {
                    if (!prevMenu) return null
                    return {
                        ...prevMenu,
                        items: Array.isArray(prevMenu.items)
                            ? prevMenu.items.map(item => item.id === updatedItem.id ? updatedItem : item)
                            : [updatedItem]
                    }
                })
                setEditingItem(null)
                toast({ title: 'Menu item updated successfully' })
            } else {
                toast({ title: 'Error updating menu item', variant: 'destructive' })
            }
        } catch (error) {
            console.error('Error updating menu item:', error)
            toast({ title: 'Error updating menu item', variant: 'destructive' })
        }
    }

    const handleDeleteItem = async (itemId: string) => {
        if (!canManageMenus) return

        try {
            const response = await fetch(`/api/menu-items?id=${itemId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                setSelectedMenu(prevMenu => {
                    if (!prevMenu) return null
                    return {
                        ...prevMenu,
                        items: Array.isArray(prevMenu.items)
                            ? prevMenu.items.filter(item => item.id !== itemId)
                            : []
                    }
                })
                toast({ title: 'Menu item deleted successfully' })
            } else {
                toast({ title: 'Error deleting menu item', variant: 'destructive' })
            }
        } catch (error) {
            console.error('Error deleting menu item:', error)
            toast({ title: 'Error deleting menu item', variant: 'destructive' })
        }
    }

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination || !selectedMenu || !Array.isArray(selectedMenu.items)) return;

        const items = Array.from(selectedMenu.items);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedItems = items.map((item, index) => ({ ...item, order: index }));

        setSelectedMenu({ ...selectedMenu, items: updatedItems });

        try {
            const response = await fetch(`/api/menus/${selectedMenu.id}/reorder`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: updatedItems }),
            });

            if (!response.ok) {
                toast({ title: 'Error reordering menu items', variant: 'destructive' });
            }
        } catch (error) {
            console.error('Error reordering menu items:', error);
            toast({ title: 'Error reordering menu items', variant: 'destructive' });
        }
    };

    const handleAddMenu = async () => {
        if (!newMenuName || !isAdmin) return

        try {
            const response = await fetch('/api/menus', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newMenuName }),
            })

            if (response.ok) {
                const newMenu = await response.json()
                setMenus([...menus, newMenu])
                setNewMenuName('')
                toast({ title: 'Menu created successfully' })
            } else {
                const errorData = await response.json()
                toast({ title: 'Error creating menu', description: errorData.error, variant: 'destructive' })
            }
        } catch (error) {
            console.error('Error creating menu:', error)
            toast({ title: 'Error creating menu', variant: 'destructive' })
        }
    }

    const handleDeleteMenu = async (menuId: string) => {
        if (!isAdmin) return

        try {
            const response = await fetch(`/api/menus?id=${menuId}`, {
                method: 'DELETE',
            })

            if (response.ok) {
                setMenus(menus.filter(menu => menu.id !== menuId))
                if (selectedMenu?.id === menuId) {
                    setSelectedMenu(null)
                }
                toast({ title: 'Menu deleted successfully' })
            } else {
                toast({ title: 'Error deleting menu', variant: 'destructive' })
            }
        } catch (error) {
            console.error('Error deleting menu:', error)
            toast({ title: 'Error deleting menu', variant: 'destructive' })
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <Label htmlFor="menu-select">Select Menu</Label>
                <div className="flex items-center space-x-2">
                    <Select value={selectedMenu?.id || ''} onValueChange={handleMenuSelect}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select a menu" />
                        </SelectTrigger>
                        <SelectContent>
                            {menus.map((menu) => (
                                <SelectItem key={menu.id} value={menu.id}>
                                    {menu.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {isAdmin && selectedMenu && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive">Delete Menu</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the menu and all its items.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteMenu(selectedMenu.id)}>
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            {selectedMenu && (
                <div>
                    <h3 className="text-lg font-semibold mb-2">Menu Items</h3>
                    <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId={selectedMenu.id}>
                            {(provided) => (
                                <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                                    {selectedMenu.items && selectedMenu.items.length > 0 ? (
                                        selectedMenu.items.map((item, index) => (
                                            <Draggable key={item.id} draggableId={item.id} index={index}>
                                                {(provided) => (
                                                    <li
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="p-2 border-2 rounded flex items-center justify-between"
                                                    >
                                                        <GripVertical/>
                                                        <span>{item.label} - {item.url}</span>
                                                        <div>
                                                            <Button onClick={() => handleEditItem(item)} variant="outline" size="sm" className="mr-2">
                                                                Edit
                                                            </Button>
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button variant="destructive" size="sm">Delete</Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This action cannot be undone. This will permanently delete the menu item.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleDeleteItem(item.id)}>
                                                                            Delete
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    </li>
                                                )}
                                            </Draggable>
                                        ))
                                    ) : (
                                        <li>No menu items available</li>
                                    )}
                                    {provided.placeholder}
                                </ul>
                            )}
                        </Droppable>
                    </DragDropContext>
                </div>
            )}

            {canManageMenus && (
                <>
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
                    <div className="space-y-2">
                        <Label htmlFor="new-item-parent">Parent Item (optional)</Label>
                        <Select value={newItemParent} onValueChange={setNewItemParent}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a parent item" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                {selectedMenu && selectedMenu.items && selectedMenu.items.map((item) => (
                                    <SelectItem key={item.id} value={item.id}>
                                        {item.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleAddItem}>Add Menu Item</Button>
                </>
            )}

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

            {editingItem && (
                <AlertDialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Edit Menu Item</AlertDialogTitle>
                        </AlertDialogHeader>
                        <div className="space-y-2">
                            <Label htmlFor="edit-item-label">Label</Label>
                            <Input
                                id="edit-item-label"
                                value={editingItem.label}
                                onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-item-url">URL</Label>
                            <Input
                                id="edit-item-url"
                                value={editingItem.url}
                                onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                            />
                        </div>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleUpdateItem}>Update</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    )
}

