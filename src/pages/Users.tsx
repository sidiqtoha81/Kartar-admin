import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, User, Crown, Building } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
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

interface DetailData {
  id: number;
  masa_jabatan: string;
  alamat: string;
  no_telp?: string;
  email?: string;
  yt_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  tiktok_url?: string;
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

  // Detail Data states
  const [detailData, setDetailData] = useState<DetailData | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailFormData, setDetailFormData] = useState({
    masa_jabatan: "",
    alamat: "",
    no_telp: "",
    email: "",
    yt_url: "",
    instagram_url: "",
    facebook_url: "",
    tiktok_url: ""
  });

  const loadUsers = async () => {
    try {
      // Fetch users and jabatan separately since tables not in types
      const usersQuery = supabase.from('users' as any).select('*');
      const jabatansQuery = supabase.from('jabatan' as any).select('*');
      
      const [usersResult, jabatansResult] = await Promise.all([usersQuery, jabatansQuery]);

      if (usersResult.error || jabatansResult.error) {
        console.error('Database query failed:', usersResult.error || jabatansResult.error);
        toast.error('Gagal memuat data dari database');
        return;
      }

      const usersData = usersResult.data as any[];
      const jabatansData = jabatansResult.data as any[];

      const formattedUsers: User[] = (usersData || []).map((user: any) => {
        const jabatan = (jabatansData || []).find((j: any) => j.id === user.jabatan_id);
        return {
          id: user.id,
          nama: user.nama, 
          image_url: user.image_url,
          jabatan_id: user.jabatan_id,
          jabatan: jabatan?.nama,
          level: jabatan?.level
        };
      }).sort((a, b) => (a.level || 999) - (b.level || 999));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Gagal memuat data users');
    }
  };

  const loadJabatans = async () => {
    try {
      const { data, error } = await supabase
        .from('jabatan' as any)
        .select('*')
        .order('level', { ascending: true });

      if (error) {
        console.error('Error loading jabatans:', error);
        toast.error('Gagal memuat data jabatan');
        return;
      }
      
      setJabatans((data as any[])?.map((j: any) => ({
        id: j.id,
        nama: j.nama,
        level: j.level
      })) || []);
    } catch (error) {
      console.error('Error loading jabatans:', error);
      toast.error('Gagal memuat data jabatan');
    }
  };

  const loadDetailData = async () => {
    try {
      setIsDetailLoading(true);
      const { data, error } = await supabase
        .from('detail_data' as any)
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error loading detail data:', error);
        toast.error('Gagal memuat data organisasi');
        return;
      }

      if (data) {
        const detailDataRecord = data as any;
        setDetailData(detailDataRecord);
        setDetailFormData({
          masa_jabatan: detailDataRecord.masa_jabatan || "",
          alamat: detailDataRecord.alamat || "",
          no_telp: detailDataRecord.no_telp || "",
          email: detailDataRecord.email || "",
          yt_url: detailDataRecord.yt_url || "",
          instagram_url: detailDataRecord.instagram_url || "",
          facebook_url: detailDataRecord.facebook_url || "",
          tiktok_url: detailDataRecord.tiktok_url || ""
        });
      }
    } catch (error) {
      console.error('Error loading detail data:', error);
      toast.error('Gagal memuat data organisasi');
    } finally {
      setIsDetailLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadJabatans();
    loadDetailData();
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
        // Update user in database
        const { error } = await supabase
          .from('users' as any)
          .update(userData)
          .eq('id', editingUser.id);

        if (error) {
          console.error('Error updating user:', error);
          toast.error('Gagal memperbarui user');
          return;
        }

        toast.success('User berhasil diperbarui');
        setIsEditDialogOpen(false);
      } else {
        // Insert new user to database
        const { error } = await supabase
          .from('users' as any)
          .insert([userData]);

        if (error) {
          console.error('Error creating user:', error);
          toast.error('Gagal menambahkan user');
          return;
        }

        toast.success('User berhasil ditambahkan');
        setIsAddDialogOpen(false);
      }

      setFormData({ nama: "", image_url: "", jabatan_id: "" });
      setEditingUser(null);
      await loadUsers(); // Reload data from database
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
      // Delete user from database
      const { error } = await supabase
        .from('users' as any)
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting user:', error);
        toast.error('Gagal menghapus user');
        return;
      }

      toast.success('User berhasil dihapus');
      await loadUsers(); // Reload data from database
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

  const handleDetailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsDetailLoading(true);
      
      const updateData = {
        masa_jabatan: detailFormData.masa_jabatan,
        alamat: detailFormData.alamat,
        no_telp: detailFormData.no_telp || null,
        email: detailFormData.email || null,
        yt_url: detailFormData.yt_url || null,
        instagram_url: detailFormData.instagram_url || null,
        facebook_url: detailFormData.facebook_url || null,
        tiktok_url: detailFormData.tiktok_url || null
      };

      if (detailData?.id) {
        // Update existing record
        const { error } = await supabase
          .from('detail_data' as any)
          .update(updateData)
          .eq('id', detailData.id);

        if (error) {
          console.error('Error updating detail data:', error);
          toast.error('Gagal memperbarui data organisasi');
          return;
        }
      } else {
        // Insert new record (upsert)
        const { error } = await supabase
          .from('detail_data' as any)
          .insert([updateData]);

        if (error) {
          console.error('Error inserting detail data:', error);
          toast.error('Gagal menyimpan data organisasi');
          return;
        }
      }

      toast.success('Data organisasi berhasil disimpan');
      await loadDetailData();
    } catch (error) {
      console.error('Error saving detail data:', error);
      toast.error('Gagal menyimpan data organisasi');
    } finally {
      setIsDetailLoading(false);
    }
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

      {/* Detail Data Organisasi Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Detail Data Organisasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDetailSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="masa_jabatan">Masa Jabatan *</Label>
                <Input
                  id="masa_jabatan"
                  value={detailFormData.masa_jabatan}
                  onChange={(e) => setDetailFormData({ ...detailFormData, masa_jabatan: e.target.value })}
                  placeholder="2024-2029"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={detailFormData.email}
                  onChange={(e) => setDetailFormData({ ...detailFormData, email: e.target.value })}
                  placeholder="organisasi@email.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="alamat">Alamat *</Label>
              <Textarea
                id="alamat"
                value={detailFormData.alamat}
                onChange={(e) => setDetailFormData({ ...detailFormData, alamat: e.target.value })}
                placeholder="Alamat lengkap organisasi"
                required
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="no_telp">Nomor Telepon</Label>
              <Input
                id="no_telp"
                value={detailFormData.no_telp}
                onChange={(e) => setDetailFormData({ ...detailFormData, no_telp: e.target.value })}
                placeholder="+62 xxx-xxxx-xxxx"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Media Sosial</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="youtube_url">YouTube URL</Label>
                  <Input
                    id="youtube_url"
                    type="url"
                    value={detailFormData.yt_url}
                    onChange={(e) => setDetailFormData({ ...detailFormData, yt_url: e.target.value })}
                    placeholder="https://youtube.com/@channel"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram_url">Instagram URL</Label>
                  <Input
                    id="instagram_url"
                    type="url"
                    value={detailFormData.instagram_url}
                    onChange={(e) => setDetailFormData({ ...detailFormData, instagram_url: e.target.value })}
                    placeholder="https://instagram.com/username"
                  />
                </div>
                <div>
                  <Label htmlFor="facebook_url">Facebook URL</Label>
                  <Input
                    id="facebook_url"
                    type="url"
                    value={detailFormData.facebook_url}
                    onChange={(e) => setDetailFormData({ ...detailFormData, facebook_url: e.target.value })}
                    placeholder="https://facebook.com/page"
                  />
                </div>
                <div>
                  <Label htmlFor="tiktok_url">TikTok URL</Label>
                  <Input
                    id="tiktok_url"
                    type="url"
                    value={detailFormData.tiktok_url}
                    onChange={(e) => setDetailFormData({ ...detailFormData, tiktok_url: e.target.value })}
                    placeholder="https://tiktok.com/@username"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isDetailLoading}>
                {isDetailLoading ? 'Menyimpan...' : 'Simpan Data Organisasi'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}