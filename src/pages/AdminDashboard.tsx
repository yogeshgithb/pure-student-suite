import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, Shield } from 'lucide-react';
import { format } from 'date-fns';

interface LoginLog {
  id: string;
  email: string;
  role: string | null;
  login_time: string;
  user_agent: string | null;
}

export const AdminDashboard: React.FC = () => {
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalLogins: 0,
    uniqueUsers: 0,
    adminLogins: 0,
  });

  useEffect(() => {
    fetchLoginLogs();
  }, []);

  const fetchLoginLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('login_logs')
        .select('*')
        .order('login_time', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (data) {
        setLoginLogs(data);
        
        // Calculate stats
        const uniqueEmails = new Set(data.map(log => log.email));
        const adminCount = data.filter(log => log.role === 'admin').length;
        
        setStats({
          totalLogins: data.length,
          uniqueUsers: uniqueEmails.size,
          adminLogins: adminCount,
        });
      }
    } catch (error) {
      console.error('Error fetching login logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">View all user login activity</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Logins</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogins}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Logins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminLogins}</div>
          </CardContent>
        </Card>
      </div>

      {/* Login Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Login Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Login Time</TableHead>
                  <TableHead className="hidden md:table-cell">User Agent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loginLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No login records found
                    </TableCell>
                  </TableRow>
                ) : (
                  loginLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.email}</TableCell>
                      <TableCell>
                        <Badge variant={log.role === 'admin' ? 'default' : 'secondary'}>
                          {log.role || 'user'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(log.login_time), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {log.user_agent ? log.user_agent.substring(0, 50) + '...' : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};