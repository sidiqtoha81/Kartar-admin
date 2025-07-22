import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, Calendar, FolderOpen } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary-glow/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Kartar Content Manager
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Platform manajemen konten untuk Karang Taruna. Kelola kategori dan kegiatan komunitas dengan mudah.
          </p>
          
          <Link to="/login">
            <Button variant="admin" size="lg" className="text-lg px-8 py-6">
              <Shield className="h-5 w-5 mr-2" />
              Admin Login
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Manage Categories</CardTitle>
              <CardDescription>
                Organize content into meaningful categories for better structure
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <Calendar className="h-6 w-6 text-success" />
              </div>
              <CardTitle>Plan Activities</CardTitle>
              <CardDescription>
                Create and manage community activities and events
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warning/10">
                <Users className="h-6 w-6 text-warning" />
              </div>
              <CardTitle>Community Focused</CardTitle>
              <CardDescription>
                Built specifically for youth organizations and community groups
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground">
            Powered by Supabase & React
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
