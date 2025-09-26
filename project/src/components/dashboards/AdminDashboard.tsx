import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Search,
  Trash2,
  Ban,
  CheckCircle,
  Settings,
  BarChart3,
  Calendar,
  Clock,
  Stethoscope,
  Building2,
  Heart,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import io from 'socket.io-client';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
  specialization: string;
  pharmacyName: string;
  suspended: boolean;
  createdAt: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    doctors: 0,
    patients: 0,
    pharmacies: 0
  });
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [reports, setReports] = useState<any[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [loadingReports, setLoadingReports] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const loadAllReports = async () => {
    setLoadingReports(true);
    try {
      const response = await fetch('http://localhost:8080/api/reports/all');
      if (response.ok) {
        const allReports = await response.json();
        setReports(allReports);
        console.log('Loaded reports from API:', allReports);
      }
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadAllReports();
    
    // Initialize socket for receiving real-time reports
    const socketConnection = io('http://localhost:5002', {
      transports: ['websocket', 'polling']
    });
    setSocket(socketConnection);
    
    socketConnection.on('connect', () => {
      console.log('✅ Admin connected to receive reports');
      socketConnection.emit('admin_subscribe', { adminId: 'admin' });
    });
    
    // Listen for report events and refresh from API
    socketConnection.on('new_report_submitted', (data) => {
      loadAllReports();
      toast({ title: 'New Report', description: `Report #${data.reportId} submitted` });
    });
    
    socketConnection.on('report_status_updated', (data) => {
      loadAllReports();
    });
    
    socketConnection.on('user_report', (data) => {
      loadAllReports();
    });
    
    // Auto-refresh every 3 seconds for reports
    const interval = setInterval(() => {
      loadAllReports();
    }, 3000);
    
    return () => {
      clearInterval(interval);
      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/auth/users');
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData);
        calculateStats(userData);
        setLastUpdated(new Date());
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load users',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect to server',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = async () => {
    setDashboardLoading(true);
    await loadUsers();
    setTimeout(() => {
      setDashboardLoading(false);
      toast({
        title: 'Dashboard Refreshed',
        description: 'All data has been updated successfully',
      });
    }, 1000);
  };

  const calculateStats = (userData: User[]) => {
    const stats = {
      totalUsers: userData.length,
      activeUsers: userData.filter(u => !u.suspended).length,
      suspendedUsers: userData.filter(u => u.suspended).length,
      doctors: userData.filter(u => u.role === 'DOCTOR').length,
      patients: userData.filter(u => u.role === 'PATIENT').length,
      pharmacies: userData.filter(u => u.role === 'PHARMACY').length
    };
    setStats(stats);
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter.toUpperCase());
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => 
        statusFilter === 'active' ? !user.suspended : user.suspended
      );
    }

    setFilteredUsers(filtered);
  };

  const suspendUser = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/admin/suspend/${userId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: 'User Suspended',
          description: 'User has been suspended successfully'
        });
        loadUsers();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to suspend user',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to suspend user',
        variant: 'destructive'
      });
    }
  };

  const unsuspendUser = async (userId: number) => {
    try {
      const response = await fetch(`http://localhost:8080/api/auth/admin/unsuspend/${userId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: 'User Unsuspended',
          description: 'User has been unsuspended successfully'
        });
        loadUsers();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to unsuspend user',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unsuspend user',
        variant: 'destructive'
      });
    }
  };

  const deleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/auth/admin/delete/${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        toast({
          title: 'User Deleted',
          description: 'User has been deleted successfully'
        });
        loadUsers();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to delete user',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive'
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'DOCTOR':
        return <Stethoscope className="h-4 w-4" />;
      case 'PHARMACY':
        return <Building2 className="h-4 w-4" />;
      case 'PATIENT':
        return <Heart className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'DOCTOR':
        return 'default';
      case 'PHARMACY':
        return 'secondary';
      case 'PATIENT':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage users and system settings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-primary">
            <Shield className="h-3 w-3 mr-1" />
            Administrator
          </Badge>
          <Badge variant="outline" className="text-success">
            <UserCheck className="h-3 w-3 mr-1" />
            {user?.name}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-6 gap-4">
        <Card className="shadow-card hover:shadow-medical transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-medical transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Not suspended</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-medical transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.suspendedUsers}</div>
            <p className="text-xs text-muted-foreground">Suspended accounts</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-medical transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doctors</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.doctors}</div>
            <p className="text-xs text-muted-foreground">Medical professionals</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-medical transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patients</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-600">{stats.patients}</div>
            <p className="text-xs text-muted-foreground">Registered patients</p>
          </CardContent>
        </Card>

        <Card className="shadow-card hover:shadow-medical transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pharmacies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.pharmacies}</div>
            <p className="text-xs text-muted-foreground">Partner pharmacies</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage all system users</CardDescription>
              
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
                
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="all">All Roles</option>
                  <option value="patient">Patients</option>
                  <option value="doctor">Doctors</option>
                  <option value="pharmacy">Pharmacies</option>
                </select>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
                
                <Button onClick={loadUsers} variant="outline" size="sm">
                  <Activity className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading users...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No users found</p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <div key={user.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              {getRoleIcon(user.role)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium">{user.name}</h4>
                                <Badge variant={getRoleBadgeVariant(user.role)}>
                                  {user.role.toLowerCase()}
                                </Badge>
                                {user.suspended && (
                                  <Badge variant="destructive">
                                    <Ban className="h-3 w-3 mr-1" />
                                    Suspended
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              {user.phone && (
                                <p className="text-xs text-muted-foreground">Phone: {user.phone}</p>
                              )}
                              {user.specialization && (
                                <p className="text-xs text-muted-foreground">Specialization: {user.specialization}</p>
                              )}
                              {user.pharmacyName && (
                                <p className="text-xs text-muted-foreground">Pharmacy: {user.pharmacyName}</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs">
                              ID: {user.id}
                            </Badge>
                            {user.role !== 'ADMIN' && (
                              <>
                                {user.suspended ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => unsuspendUser(user.id)}
                                    className="hover:bg-success/10"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Unsuspend
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => suspendUser(user.id)}
                                    className="hover:bg-warning/10"
                                  >
                                    <Ban className="h-3 w-3 mr-1" />
                                    Suspend
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteUser(user.id)}
                                  className="hover:scale-105 transition-transform"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          {/* Real-time User Activity */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary animate-pulse" />
                <span>Live User Activity</span>
              </CardTitle>
              <CardDescription>
                Real-time user engagement and system activity
                <br />
                <span className="text-xs text-muted-foreground">
                  Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refresh: 30s
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    Recent Registrations
                  </h4>
                  <div className="space-y-3">
                    {users.slice(-3).map((user, index) => (
                      <div key={user.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          {getRoleIcon(user.role)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.role.toLowerCase()}</p>
                        </div>
                        <Badge variant="outline" className="text-xs animate-pulse">
                          New
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                    System Health
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 animate-pulse" />
                        <span className="text-sm">Database</span>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 animate-pulse" />
                        <span className="text-sm">API Server</span>
                      </div>
                      <Badge variant="default" className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
                        <span className="text-sm">Response Time</span>
                      </div>
                      <Badge variant="outline" className="text-blue-800">~45ms</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
                    Quick Actions
                  </h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start hover:scale-105 transition-transform"
                      onClick={() => setActiveTab('users')}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      View All Users
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start hover:scale-105 transition-transform"
                      onClick={() => setActiveTab('reports')}
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      View Reports
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start hover:scale-105 transition-transform"
                      onClick={() => setActiveTab('settings')}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      System Settings
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start hover:scale-105 transition-transform" 
                      onClick={refreshDashboard}
                      disabled={dashboardLoading}
                    >
                      <Activity className={`h-4 w-4 mr-2 ${dashboardLoading ? 'animate-spin' : ''}`} />
                      {dashboardLoading ? 'Refreshing...' : 'Refresh Data'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Statistics with Animations */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>User Growth Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Growth</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-600 animate-bounce" />
                      <span className="text-sm font-bold text-green-600">+12.5%</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full animate-pulse" style={{ width: '75%' }}></div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-lg font-bold text-blue-700 animate-bounce">{stats.doctors}</div>
                      <div className="text-xs text-blue-600">Doctors</div>
                    </div>
                    <div className="text-center p-3 bg-pink-50 rounded-lg border border-pink-200">
                      <div className="text-lg font-bold text-pink-700 animate-bounce">{stats.patients}</div>
                      <div className="text-xs text-pink-600">Patients</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-lg font-bold text-green-700 animate-bounce">{stats.pharmacies}</div>
                      <div className="text-xs text-green-600">Pharmacies</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New doctor registered</p>
                      <p className="text-xs text-muted-foreground">Dr. Smith joined - 2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in" style={{ animationDelay: '100ms' }}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Patient appointment booked</p>
                      <p className="text-xs text-muted-foreground">John Doe - 5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 border border-purple-200 rounded-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Pharmacy updated inventory</p>
                      <p className="text-xs text-muted-foreground">MedPlus Pharmacy - 8 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg animate-fade-in" style={{ animationDelay: '300ms' }}>
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">System backup completed</p>
                      <p className="text-xs text-muted-foreground">Automated backup - 15 minutes ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <span>User Reports & Feedback ({reports.length})</span>
              </CardTitle>
              <CardDescription>
                All reports from patients and doctors - fake users, inappropriate behavior, and feedback
                <br />
                <span className="text-xs text-muted-foreground">
                  Socket Status: {socket?.connected ? '✅ Connected' : '❌ Disconnected'}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{reports.length}</div>
                  <div className="text-sm text-green-600">Total Reports</div>
                </div>
                <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{reports.filter(r => r.reportType?.includes('fake')).length}</div>
                  <div className="text-sm text-red-600">Fake User Reports</div>
                </div>
                <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{reports.filter(r => r.issueType === 'inappropriate-behavior' || r.issueType === 'harassment').length}</div>
                  <div className="text-sm text-orange-600">Inappropriate Behavior</div>
                </div>
                <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{reports.filter(r => r.reportType === 'doctor-feedback').length}</div>
                  <div className="text-sm text-blue-600">User Feedback</div>
                </div>
              </div>
              
              <div className="flex space-x-2 mb-4">
                <Button 
                  onClick={() => {
                    loadAllReports();
                    toast({
                      title: 'Reports Refreshed',
                      description: 'Loaded latest reports from database',
                    });
                  }}
                  variant="outline"
                  size="sm"
                  disabled={loadingReports}
                >
                  {loadingReports ? 'Loading...' : '🔄 Refresh Reports'}
                </Button>
                <Button 
                  onClick={() => {
                    // Add test report
                    const testReport = {
                      reporterId: 'test-123',
                      reporterName: 'Test User',
                      reporterType: 'PATIENT',
                      reportType: 'fake-doctor',
                      reportedUserIdOrName: 'Dr. Fake',
                      issueType: 'fake-profile',
                      description: 'This is a test report',
                      timestamp: new Date().toISOString()
                    };
                    setReports(prev => [testReport, ...prev]);
                    toast({
                      title: '🧪 Test Report Added',
                      description: 'Added a test report to verify display',
                    });
                  }}
                  variant="secondary"
                  size="sm"
                >
                  🧪 Add Test Report
                </Button>
                <Button 
                  onClick={() => {
                    if (socket && socket.connected) {
                      socket.emit('test_admin_connection', { message: 'Admin testing connection' });
                      console.log('📡 Sent test message to server');
                      toast({
                        title: '📡 Test Sent',
                        description: 'Sent test message to server',
                      });
                    } else {
                      toast({
                        title: 'Not Connected',
                        description: 'Socket is not connected',
                        variant: 'destructive'
                      });
                    }
                  }}
                  variant="ghost"
                  size="sm"
                >
                  📡 Test Connection
                </Button>
              </div>
              
              {reports.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No reports available</p>
                  <p className="text-sm text-muted-foreground">Reports from patients about fake doctors/pharmacies and doctor reports about unwanted users will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-medium">Recent Reports ({reports.length})</h4>
                  {reports.map((report, index) => (
                    <div key={index} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-warning" />
                          <span className="font-medium">{report.reportType?.replace('-', ' ').toUpperCase()}</span>
                          <Badge variant={report.reporterType === 'PATIENT' ? 'default' : 'secondary'}>
                            From {report.reporterType}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(report.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><strong>Reporter:</strong> {report.reporterName} (ID: {report.reporterId})</p>
                        <p><strong>Reported User:</strong> {report.reportedUserIdOrName}</p>
                        <p><strong>Issue:</strong> {report.issueType?.replace('-', ' ')}</p>
                        {report.rating && <p><strong>Rating:</strong> {report.rating}/5 stars</p>}
                        <p><strong>Description:</strong> {report.description}</p>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <Button 
                          size="sm" 
                          variant={report.status === 'REVIEWED' ? 'default' : 'outline'}
                          disabled={report.status === 'REVIEWED' || report.status === 'RESOLVED'}
                          onClick={async () => {
                            fetch(`http://localhost:8080/api/reports/${report.id}/status`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'REVIEWED' })
                            }).then(response => {
                              if (response.ok) {
                                loadAllReports();
                                toast({ title: 'Status Updated', description: 'Report reviewed' });
                              }
                            });
                          }}
                        >
                          {report.status === 'REVIEWED' ? 'Reviewed ✓' : 'Mark Reviewed'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant={report.status === 'RESOLVED' ? 'default' : 'success'}
                          disabled={report.status === 'RESOLVED'}
                          onClick={async () => {
                            fetch(`http://localhost:8080/api/reports/${report.id}/status`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ status: 'RESOLVED' })
                            }).then(response => {
                              if (response.ok) {
                                loadAllReports();
                                toast({ title: 'Report Resolved', description: 'Issue resolved' });
                              }
                            });
                          }}
                        >
                          {report.status === 'RESOLVED' ? 'Resolved ✓' : 'Resolve'}
                        </Button>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>System Settings</span>
              </CardTitle>
              <CardDescription>Configure system-wide settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">System Information</h4>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Users:</span>
                      <span className="ml-2 font-medium">{stats.totalUsers}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">System Status:</span>
                      <span className="ml-2 font-medium text-success">Online</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Database:</span>
                      <span className="ml-2 font-medium text-success">Connected</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span className="ml-2 font-medium">{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-warning/10 border border-warning/20 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-warning" />
                    <span className="font-medium text-warning">Admin Notice</span>
                  </div>
                  <p className="text-sm text-warning/80">
                    You have administrative privileges. Use these powers responsibly to maintain system integrity and user privacy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;