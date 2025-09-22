import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Plus, Users, Activity, CheckCircle, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentService, type Appointment } from '@/services/appointmentService';
import AppointmentBooking from './AppointmentBooking';
import AppointmentCard from './AppointmentCard';

const AppointmentManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [appointmentHistory, setAppointmentHistory] = useState<Appointment[]>([]);
  const [dashboardStats, setDashboardStats] = useState({
    upcoming: 0,
    completed: 0,
    pending: 0,
    recentActivities: []
  });
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadAppointmentData();
    }
  }, [user?.id]);

  const loadAppointmentData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const [allAppointments, upcoming, history, stats] = await Promise.all([
        appointmentService.getPatientAppointments(user.id),
        appointmentService.getUpcomingAppointments(user.id),
        appointmentService.getAppointmentHistory(user.id),
        appointmentService.getPatientDashboardStats(user.id)
      ]);

      setAppointments(allAppointments);
      setUpcomingAppointments(upcoming);
      setAppointmentHistory(history);
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading appointment data:', error);
      toast({
        title: "Error",
        description: "Failed to load appointment data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async (appointmentId: string) => {
    // This would open a reschedule modal - for now just show a toast
    toast({
      title: "Reschedule",
      description: "Reschedule functionality will be implemented",
    });
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      await appointmentService.cancelAppointment(appointmentId);
      toast({
        title: "Appointment Cancelled",
        description: "Your appointment has been cancelled successfully",
      });
      loadAppointmentData(); // Refresh data
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel appointment",
        variant: "destructive"
      });
    }
  };

  const handleJoinCall = (appointmentId: string) => {
    // This would open the video call interface
    toast({
      title: "Joining Call",
      description: "Video call functionality will be implemented",
    });
  };

  const handleBookingComplete = () => {
    setShowBooking(false);
    loadAppointmentData(); // Refresh data after booking
  };

  const handleInstantAppointment = async () => {
    if (!user?.id) return;
    
    const symptoms = prompt('Please describe your symptoms briefly:');
    if (!symptoms) return;
    
    setLoading(true);
    try {
      const result = await appointmentService.bookInstantAppointment(parseInt(user.id), symptoms);
      if (result.success) {
        toast({
          title: "Instant Appointment Booked!",
          description: "Your appointment has been scheduled for the next available slot",
        });
        loadAppointmentData();
      }
    } catch (error) {
      toast({
        title: "No Available Slots",
        description: "No doctors are available for instant appointments today. Please book a regular appointment.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{dashboardStats.upcoming}</p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{dashboardStats.completed}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{dashboardStats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{appointments.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">My Appointments</CardTitle>
              <CardDescription>
                Manage your medical appointments and consultations
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={handleInstantAppointment}
                className="bg-gradient-to-r from-warning to-warning/80 hover:from-warning/90 hover:to-warning/70"
                disabled={loading}
              >
                <Zap className="h-4 w-4 mr-2" />
                Instant Appointment
              </Button>
              <Button 
                onClick={() => setShowBooking(true)}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="all">All Appointments</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onReschedule={handleReschedule}
                    onCancel={handleCancel}
                    onJoinCall={handleJoinCall}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No upcoming appointments</p>
                  <p className="text-sm text-muted-foreground">Book your first appointment to get started</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {appointmentHistory.length > 0 ? (
                appointmentHistory.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    showActions={false}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No appointment history</p>
                  <p className="text-sm text-muted-foreground">Your completed appointments will appear here</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {appointments.length > 0 ? (
                appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onReschedule={handleReschedule}
                    onCancel={handleCancel}
                    onJoinCall={handleJoinCall}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-muted-foreground">No appointments found</p>
                  <p className="text-sm text-muted-foreground">Start by booking your first appointment</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Booking Modal */}
      {showBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <AppointmentBooking 
              onClose={handleBookingComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentManager;