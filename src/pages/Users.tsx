import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, User, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface User {
  id: number;
  nama: string;
  image_url?: string;
  jabatan_id?: number;
  jabatan?: string;
  level?: number;
}

interface Jabatan {
  id: number;
  nama: string;
  level: number;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [jabatans, setJabatans] = useState<Jabatan[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    image_url: "",
    jabatan_id: ""
  });

  const loadUsers = async () => {
    try {
      // Using mock data for demo since users table not in types
      const mockUsers: User[] = [
        { id: 6, nama: "Anjani", image_url: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400", jabatan_id: 1, jabatan: "Ketua", level: 1 },
        { id: 8, nama: "Amad", image_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", jabatan_id: 2, jabatan: "Wakil Ketua", level: 2 },
        { id: 7, nama: "Toha", image_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", jabatan_id: 3, jabatan: "Sekretaris", level: 3 },
        { id: 9, nama: "Sari", image_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400", jabatan_id: 4, jabatan: "Bendahara", level: 4 },
        { id: 10, nama: "Doni", image_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", jabatan_id: 5, jabatan: "Anggota", level: 5 }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Gagal memuat data users');
    }
  };

  const loadJabatans = async () => {
    try {
      // Using mock data for demo
      const mockJabatans: Jabatan[] = [
        { id: 1, nama: "Ketua", level: 1 },
        { id: 2, nama: "Wakil Ketua", level: 2 },
        { id: 3, nama: "Sekretaris", level: 3 },
        { id: 4, nama: "Bendahara", level: 4 },
        { id: 5, nama: "Anggota", level: 5 }
      ];
      setJabatans(mockJabatans);
    } catch (error) {
      console.error('Error loading jabatans:', error);
      toast.error('Gagal memuat data jabatan');
    }
  };

  useEffect(() => {
    loadUsers();
    loadJabatans();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const userData = {
        nama: formData.nama,
        image_url: formData.image_url || null,
        jabatan_id: formData.jabatan_id ? parseInt(formData.jabatan_id) : null
      };

      if (editingUser) {
        // Mock update - in real app would update database
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === editingUser.id 
              ? { 
                  ...user, 
                  nama: userData.nama, 
                  image_url: userData.image_url || null,
                  jabatan_id: userData.jabatan_id,
                  jabatan: jabatans.find(j => j.id === userData.jabatan_id)?.nama,
                  level: jabatans.find(j => j.id === userData.jabatan_id)?.level
                }
              : user
          )
        );
        toast.success('User berhasil diperbarui');
        setIsEditDialogOpen(false);
      } else {
        // Mock insert - in real app would insert to database
        const newId = Math.max(...users.map(u => u.id)) + 1;
        const selectedJabatan = jabatans.find(j => j.id === userData.jabatan_id);
        const newUser: User = {
          id: newId,
          nama: userData.nama,
          image_url: userData.image_url || null,
          jabatan_id: userData.jabatan_id,
          jabatan: selectedJabatan?.nama,
          level: selectedJabatan?.level
        };
        setUsers(prevUsers => [...prevUsers, newUser].sort((a, b) => (a.level || 999) - (b.level || 999)));
        toast.success('User berhasil ditambahkan');
        setIsAddDialogOpen(false);
      }

      setFormData({ nama: "", image_url: "", jabatan_id: "" });
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Gagal menyimpan user');
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      nama: user.nama,
      image_url: user.image_url || "",
      jabatan_id: user.jabatan_id?.toString() || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      // Mock delete - in real app would delete from database
      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
      toast.success('User berhasil dihapus');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Gagal menghapus user');
    }
  };

  const getLevelBadge = (level?: number) => {
    if (!level) return null;
    
    const variants = {
      1: "default",
      2: "secondary", 
      3: "outline"
    } as const;

    return (
      <Badge variant={variants[level as keyof typeof variants] || "outline"}>
        Level {level}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manajemen Users</h1>
          <p className="text-muted-foreground">Kelola anggota berdasarkan hierarki jabatan</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah User Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nama">Nama</Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="image_url">URL Gambar</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <div>
                <Label htmlFor="jabatan">Jabatan</Label>
                <Select value={formData.jabatan_id} onValueChange={(value) => setFormData({ ...formData, jabatan_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jabatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {jabatans.map((jabatan) => (
                      <SelectItem key={jabatan.id} value={jabatan.id.toString()}>
                        {jabatan.nama} (Level {jabatan.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Simpan</Button>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Batal
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Daftar Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Avatar</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Jabatan</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.image_url} alt={user.nama} />
                      <AvatarFallback>
                        {user.nama.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {user.level === 1 && <Crown className="h-4 w-4 text-accent" />}
                      {user.nama}
                    </div>
                  </TableCell>
                  <TableCell>{user.jabatan || 'Tidak ada jabatan'}</TableCell>
                  <TableCell>{getLevelBadge(user.level)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit User</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                              <Label htmlFor="edit-nama">Nama</Label>
                              <Input
                                id="edit-nama"
                                value={formData.nama}
                                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                required
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-image_url">URL Gambar</Label>
                              <Input
                                id="edit-image_url"
                                type="url"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="https://example.com/avatar.jpg"
                              />
                            </div>
                            <div>
                              <Label htmlFor="edit-jabatan">Jabatan</Label>
                              <Select value={formData.jabatan_id} onValueChange={(value) => setFormData({ ...formData, jabatan_id: value })}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih jabatan" />
                                </SelectTrigger>
                                <SelectContent>
                                  {jabatans.map((jabatan) => (
                                    <SelectItem key={jabatan.id} value={jabatan.id.toString()}>
                                      {jabatan.nama} (Level {jabatan.level})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex gap-2">
                              <Button type="submit" className="flex-1">Update</Button>
                              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                Batal
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Apakah Anda yakin ingin menghapus user "{user.nama}"? 
                              Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Batal</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Hapus
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}