import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, User, FileText, Video, AudioLines, CheckCircle, XCircle, Users, Stethoscope, Award, TrendingUp, MessageSquare, Power, PowerOff, AlertCircle, Edit, Save, X, Settings, Bell, Mail, Smartphone, Moon, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockAppointments } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { VideoCall } from '@/components/VideoCall';
import { CallNotification } from '@/components/CallNotification';
import { callService } from '@/services/callService';
import { prescriptionService } from '@/services/prescriptionService';
import { realtimeService } from '@/services/realtimeService';
import io from 'socket.io-client';

const DoctorDashboard = () => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: '',
    medicines: '',
    notes: ''
  });
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [currentCallTarget, setCurrentCallTarget] = useState<string | null>(null);
  const [todayStats, setTodayStats] = useState({
    consultations: 12,
    prescriptions: 8,
    emergencies: 2,
    revenue: 15600
  });
  const [recentPatients, setRecentPatients] = useState([
    { id: 1, name: 'Ramesh Kumar', condition: 'Hypertension', lastVisit: '2 hours ago', status: 'stable' },
    { id: 2, name: 'Sunita Devi', condition: 'Diabetes', lastVisit: '4 hours ago', status: 'monitoring' },
    { id: 3, name: 'Kiran Patel', condition: 'Fever', lastVisit: '1 day ago', status: 'recovered' }
  ]);
  
  // Doctor availability state
  const [isOnline, setIsOnline] = useState(false);
  const [socket, setSocket] = useState<any>(null);
  const [consultationRequests, setConsultationRequests] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    specialization: user?.specialization || '',
    experience: user?.experience || '',
    licenseNumber: user?.licenseNumber || ''
  });
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    autoAcceptCalls: false,
    workingHours: '9:00-17:00',
    consultationFee: 500
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [callPatientInfo, setCallPatientInfo] = useState<{id: string, name: string} | null>(null);
  const [lastCheckedNotifications, setLastCheckedNotifications] = useState<string[]>([]);
  const [appointmentFilter, setAppointmentFilter] = useState('all');

  const [doctorAppointments, setDoctorAppointments] = useState<any[]>([]);
  const pendingCount = doctorAppointments.filter(apt => apt.status === 'pending').length;
  const approvedCount = doctorAppointments.filter(apt => apt.status === 'approved').length;
  
  // Load doctor appointments
  const loadDoctorAppointments = async () => {
    if (user?.id) {
      try {
        const response = await fetch(`http://localhost:8080/api/appointments/doctor/${user.id}`);
        if (response.ok) {
          const appointments = await response.json();
          setDoctorAppointments(appointments);
        }
      } catch (error) {
        console.error('Failed to load appointments:', error);
      }
    }
  };
  
  useEffect(() => {
    loadDoctorAppointments();
    
    const interval = setInterval(() => {
      loadDoctorAppointments();
    }, 3000);
    
    return () => clearInterval(interval);
  }, [user?.id]);
  
  // Initialize socket connection and doctor presence
  useEffect(() => {
    if (!user?.id) return;
    
    const socketConnection = io('http://localhost:5002', {
      transports: ['websocket', 'polling']
    });
    setSocket(socketConnection);
    
    socketConnection.on('connect', () => {
      setConnectionStatus('connected');
      console.log('✅ Doctor connected to call server');
    });
    
    socketConnection.on('disconnect', () => {
      setConnectionStatus('disconnected');
      console.log('❌ Doctor disconnected from call server');
    });
    
    socketConnection.on('connect_error', (error) => {
      setConnectionStatus('error');
      console.log('❌ Connection error:', error);
    });
    
    // Listen for consultation requests
    socketConnection.on('consultation_request', (data) => {
      console.log('📞 Doctor received consultation request:', data);
      setConsultationRequests(prev => [...prev, data]);
      toast({
        title: 'New Consultation Request',
        description: `Patient ${data.patientInfo?.name || data.patientId} is requesting a ${data.consultationType} consultation`,
      });
    });
    
    // Listen for medicine taken notifications
    socketConnection.on('medicine_taken', (data) => {
      console.log('💊 Patient took medicine:', data);
      console.log('Current doctor ID:', user?.id);
      console.log('Notification doctor ID:', data.doctorId);
      console.log('Match check:', data.doctorId === user?.id, data.doctorId == user?.id);
      
      // Always show notification for now (for debugging)
      toast({
        title: '💊 Medicine Taken',
        description: `${data.patientName} has taken their prescribed medicine`,
      });
    });
    
    return () => {
      if (socketConnection) {
        if (isOnline) {
          socketConnection.emit('doctor_offline', { doctorId: user.id });
          callService.setDoctorOffline(user.id);
        }
        socketConnection.disconnect();
      }
    };
  }, [user?.id]);
  
  const handleToggleOnlineStatus = async () => {
    if (!user?.id) return;
    
    try {
      if (isOnline) {
        // Go offline
        await callService.setDoctorOffline(user.id);
        if (socket && socket.connected) {
          socket.emit('doctor_offline', { doctorId: user.id });
        }
        setIsOnline(false);
        toast({
          title: 'Status Updated',
          description: 'You are now offline. Patients cannot request consultations.',
          variant: 'destructive'
        });
      } else {
        // Go online
        await callService.setDoctorOnline(user.id);
        if (socket && socket.connected) {
          socket.emit('doctor_online', {
            doctorId: user.id,
            doctorInfo: {
              name: user.name || 'Doctor',
              specialization: user.specialization || 'General Medicine',
              experience: user.experience || '5+ years'
            }
          });
        }
        setIsOnline(true);
        toast({
          title: 'Status Updated',
          description: 'You are now online. Patients can request consultations.',
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status. Check if call server is running.',
        variant: 'destructive'
      });
    }
  };
  
  const acceptConsultation = async (consultationId: string) => {
    const consultation = consultationRequests.find(req => req.consultationId === consultationId);
    const isAudioCall = consultation?.consultationType === 'Audio';
    const roomId = isAudioCall ? `audio_room_${consultationId}` : `room_${consultationId}`;
    
    console.log('🩺 Doctor accepting consultation:', consultationId, 'Type:', consultation?.consultationType);
    console.log('Patient info for consultation:', consultation?.patientInfo);
    
    // Store patient info for later use in prescription
    if (consultation?.patientInfo) {
      console.log('📝 Storing patient info for prescription:', consultation.patientInfo);
    }
    
    // Notify patient via socket
    if (socket?.connected) {
      socket.emit('start_call', { consultationId, roomId });
      console.log('📡 Sent start_call event to patient');
    }
    
    // Move doctor to call screen immediately
    setCurrentCallTarget(roomId);
    setShowVideoCall(true);
    console.log('🎥 Doctor moved to call screen with room:', roomId);
    
    toast({
      title: 'Call Started',
      description: `Starting ${isAudioCall ? 'audio' : 'video'} call with ${consultation?.patientInfo?.name || 'patient'}...`,
    });
  };
  
  const rejectConsultation = async (consultationId: string, reason?: string) => {
    try {
      const rejectionReason = reason || 'Doctor is currently unavailable';
      
      if (socket && socket.connected) {
        socket.emit('consultation_reject', { 
          consultationId, 
          reason: rejectionReason
        });
        console.log('Sent consultation rejection:', consultationId, rejectionReason);
      }
      
      setConsultationRequests(prev => prev.filter(req => req.consultationId !== consultationId));
      
      toast({
        title: 'Consultation Rejected',
        description: 'Patient has been notified of the rejection.',
      });
    } catch (error) {
      console.error('Error rejecting consultation:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject consultation',
        variant: 'destructive'
      });
    }
  };

  const handleApproveAppointment = (appointmentId: string) => {
    toast({
      title: t('appointmentApproved'),
      description: t('patientNotified'),
    });
  };

  const handleRejectAppointment = (appointmentId: string) => {
    toast({
      title: t('appointmentRejected'),
      description: "Patient has been notified. Please suggest alternative dates if possible.",
      variant: "destructive"
    });
  };

  const handleAddPrescription = async () => {
    if (!prescriptionForm.medicines.trim() || !prescriptionForm.patientId.trim()) {
      toast({
        title: "Error",
        description: "Please fill in patient ID and medicines.",
        variant: "destructive"
      });
      return;
    }

    const requestData = {
      patientId: parseInt(prescriptionForm.patientId),
      doctorId: parseInt(user?.id || '1'),
      medicines: prescriptionForm.medicines,
      notes: prescriptionForm.notes || ''
    };
    
    console.log('Sending prescription request:', requestData);

    try {
      const response = await fetch('http://localhost:8080/api/prescriptions/create', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData)
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);
      
      if (response.ok && result.success) {
        // Notify patient via socket
        if (socket && socket.connected) {
          const notification = {
            patientId: prescriptionForm.patientId,
            doctorName: user?.name || 'Doctor',
            medicines: prescriptionForm.medicines,
            notes: prescriptionForm.notes,
            prescriptionId: result.prescriptionId
          };
          console.log('Sending socket notification:', notification);
          socket.emit('prescription_added', notification);
        }
        
        toast({
          title: "✅ Prescription Created",
          description: `Prescription ID ${result.prescriptionId} sent to patient successfully.`,
        });
        
        setPrescriptionForm({ patientId: '', medicines: '', notes: '' });
        setTodayStats(prev => ({ ...prev, prescriptions: prev.prescriptions + 1 }));
        
        // Notify pharmacy
        realtimeService.notifyPrescriptionAdded({
          prescriptionId: result.prescriptionId,
          doctorName: user?.name || 'Doctor',
          medicines: prescriptionForm.medicines,
          patientId: prescriptionForm.patientId,
          notes: prescriptionForm.notes
        });
      } else {
        console.error('Prescription creation failed:', result);
        toast({
          title: "Creation Failed",
          description: result.message || "Unknown error occurred",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Network error:', error);
      toast({
        title: "Network Error",
        description: "Cannot connect to server. Check if backend is running on port 8080.",
        variant: "destructive"
      });
    }
  };

  const startVideoAudioCall = async (appointmentId: string) => {
    const appointment = doctorAppointments.find(apt => apt.id === appointmentId);
    if (!appointment) return;
    
    try {
      await callService.initiateCall(user?.id || '', appointment.patientName, 'VIDEO');
      setCurrentCallTarget(appointment.patientName);
      setShowVideoCall(true);
      
      toast({
        title: t('videoCallStarted'),
        description: t('connectingToPatient'),
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to start video call',
        variant: 'destructive'
      });
    }
  };
  
  const handleCallEnd = () => {
    console.log('📞 Call ended, processing patient info...');
    console.log('Current call target:', currentCallTarget);
    console.log('Available consultation requests:', consultationRequests);
    
    setShowVideoCall(false);
    
    // Show prescription modal after call ends
    if (currentCallTarget) {
      // Extract patient info from consultation requests
      const matchingRequest = consultationRequests.find(req => 
        `room_${req.consultationId}` === currentCallTarget ||
        `audio_room_${req.consultationId}` === currentCallTarget
      );
      
      console.log('Matching consultation request:', matchingRequest);
      
      const patientInfo = matchingRequest?.patientInfo || { 
        name: matchingRequest?.patientId || 'Unknown Patient', 
        id: matchingRequest?.patientId || '1' 
      };
      
      console.log('Extracted patient info:', patientInfo);
      
      setCallPatientInfo({
        id: String(patientInfo.id),
        name: patientInfo.name
      });
      setPrescriptionForm({
        patientId: String(patientInfo.id),
        medicines: '',
        notes: ''
      });
      setShowPrescriptionModal(true);
      
      // Clear the consultation request after processing
      setConsultationRequests(prev => prev.filter(req => 
        `room_${req.consultationId}` !== currentCallTarget &&
        `audio_room_${req.consultationId}` !== currentCallTarget
      ));
    }
    
    setCurrentCallTarget(null);
  };

  const handleProfileUpdate = async () => {
    if (!user?.id) return;
    
    try {
      const result = await updateProfile(user.id, profileForm);
      
      if (result.success) {
        // Update call server with new doctor info
        if (socket && socket.connected) {
          const doctorInfo = {
            name: profileForm.name,
            specialization: profileForm.specialization,
            experience: profileForm.experience
          };
          
          // Update via socket
          socket.emit('doctor_info_update', {
            doctorId: user.id,
            doctorInfo
          });
          
          // Also update via REST API as backup
          try {
            await fetch('http://localhost:5002/api/calls/doctor/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ doctorId: user.id, doctorInfo })
            });
          } catch (error) {
            console.log('Call server update failed:', error);
          }
        }
        
        setShowProfileEdit(false);
        toast({
          title: 'Profile Updated',
          description: 'Your profile information has been updated successfully.',
        });
      } else {
        toast({
          title: 'Update Failed',
          description: result.message || 'Failed to update profile',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    }
  };

  const handleSettingsUpdate = () => {
    try {
      localStorage.setItem('doctorSettings', JSON.stringify(settings));
      toast({
        title: 'Settings Updated',
        description: 'Your preferences have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive'
      });
    }
  };

  // Load settings on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('doctorSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
    
    // Check for medicine taken notifications every 10 seconds
    const checkNotifications = async () => {
      if (!user?.id) {
        console.log('⚠️ No user ID for notification check');
        return;
      }
      
      console.log(`🔍 Checking notifications for doctor ID: ${user.id}`);
      
      try {
        const response = await fetch(`http://localhost:8080/api/prescriptions/taken-notifications/${user.id}`);
        console.log('Notification check response status:', response.status);
        
        if (response.ok) {
          const notifications = await response.json();
          console.log('Received notifications:', notifications);
          console.log('Current lastChecked:', lastCheckedNotifications);
          
          notifications.forEach((notification: any) => {
            const notificationId = `${notification.prescriptionId}_${notification.takenAt}`;
            console.log(`Checking notification ID: ${notificationId}`);
            
            if (!lastCheckedNotifications.includes(notificationId)) {
              console.log('✅ Showing new notification for:', notification.patientName);
              toast({
                title: '💊 Medicine Taken',
                description: `${notification.patientName} has taken their prescribed medicine`,
              });
              setLastCheckedNotifications(prev => {
                const updated = [...prev, notificationId];
                console.log('Updated lastChecked:', updated);
                return updated;
              });
            } else {
              console.log('⏭️ Skipping duplicate notification:', notificationId);
            }
          });
        } else {
          console.error('Failed to fetch notifications, status:', response.status);
        }
      } catch (error) {
        console.error('Failed to check notifications:', error);
      }
    };
    
    const interval = setInterval(checkNotifications, 10000); // Check every 10 seconds
    checkNotifications(); // Check immediately
    
    return () => clearInterval(interval);
  }, [user?.id, lastCheckedNotifications]);

  if (showVideoCall) {
    return (
      <div className="space-y-6">
        <CallNotification userId={user?.id || ''} />
        <VideoCall 
          userId={user?.id || ''} 
          targetUserId={currentCallTarget || ''}
          roomId={currentCallTarget || ''}
          onCallEnd={handleCallEnd}
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <CallNotification userId={user?.id || ''} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('doctor')} {t('dashboard')}</h1>
          <p className="text-muted-foreground mt-1">Providing care, saving lives</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-primary">
            <Stethoscope className="h-3 w-3 mr-1" />
            Dr. {user?.name}
          </Badge>
          <Badge variant="outline" className="text-success">
            <Award className="h-3 w-3 mr-1" />
            Verified
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setProfileForm({
                name: user?.name || '',
                phone: user?.phone || '',
                address: user?.address || '',
                specialization: user?.specialization || '',
                experience: user?.experience || '',
                licenseNumber: user?.licenseNumber || ''
              });
              setShowProfileEdit(true);
            }}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit Profile
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Doctor Status Banner */}
      <Card className={`shadow-medical text-white ${isOnline ? 'bg-gradient-primary' : 'bg-gradient-to-r from-gray-600 to-gray-800'}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Status: {isOnline ? 'Available for Consultations' : 'Offline - Not Available'}
              </h3>
              <p className="text-white/80">Specialization: {user?.specialization}</p>
              <p className="text-white/60 text-sm mt-1">
                Call Server: {connectionStatus === 'connected' ? '✅ Connected' : connectionStatus === 'error' ? '❌ Server Offline' : '⏳ Connecting...'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${isOnline ? 'bg-success animate-pulse' : 'bg-gray-400'}`}></div>
                <div className="text-sm">{isOnline ? 'Online' : 'Offline'}</div>
              </div>
              <Button
                onClick={handleToggleOnlineStatus}
                variant={isOnline ? 'destructive' : 'success'}
                size="sm"
                className="hover:scale-105 transition-transform"
              >
                {isOnline ? (
                  <><PowerOff className="h-4 w-4 mr-2" />Go Offline</>
                ) : (
                  <><Power className="h-4 w-4 mr-2" />Go Online</>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Live Consultation Requests */}
      {consultationRequests.length > 0 && (
        <Card className="shadow-medical border-2 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-800">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <span>🔴 LIVE Consultation Requests ({consultationRequests.length})</span>
            </CardTitle>
            <CardDescription>Patients are waiting for your response</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {consultationRequests.map((request) => (
              <div key={request.consultationId} className="bg-white p-4 rounded-lg border border-orange-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-medium">{request.patientInfo?.name || request.patientId}</span>
                    <Badge variant="outline" className="bg-orange-100 text-orange-800">
                      {request.consultationType} Call
                    </Badge>
                  </div>
                  <Badge variant="destructive" className="animate-pulse">
                    URGENT
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Patient is requesting a {request.consultationType.toLowerCase()} consultation
                </p>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => acceptConsultation(request.consultationId)}
                    className="hover:scale-105 transition-transform"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accept & Start Call
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      const reason = prompt('Reason for rejection (optional):') || 'Doctor is currently unavailable. Please try again later.';
                      rejectConsultation(request.consultationId, reason);
                    }}
                    className="hover:scale-105 transition-transform"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="appointments">{t('appointments')}</TabsTrigger>
          <TabsTrigger value="prescriptions">{t('prescriptions')}</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="shadow-card hover:shadow-medical transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">{pendingCount}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
                <div className="mt-2">
                  <div className="flex items-center text-xs text-warning">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Avg response: 15 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-medical transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's {t('appointments')}</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{approvedCount}</div>
                <p className="text-xs text-muted-foreground">Scheduled for today</p>
                <div className="mt-2">
                  <div className="flex items-center text-xs text-primary">
                    <div className="flex items-center space-x-1 mr-1">
                      <Video className="h-2 w-2" />
                      <AudioLines className="h-2 w-2" />
                    </div>
                    <span>Next: 10:00 AM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-medical transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total {t('patient')}s</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">156</div>
                <p className="text-xs text-muted-foreground">This month</p>
                <div className="mt-2">
                  <div className="flex items-center text-xs text-success">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    <span>+12% growth</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-medical transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('consultations')}</CardTitle>
                <div className="flex items-center space-x-1">
                  <Video className="h-3 w-3 text-muted-foreground" />
                  <AudioLines className="h-3 w-3 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emergency">89</div>
                <p className="text-xs text-muted-foreground">Completed this week</p>
                <div className="mt-2">
                  <div className="flex items-center text-xs text-emergency">
                    <Award className="h-3 w-3 mr-1" />
                    <span>4.9/5 rating</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Statistics */}
          <Card className="shadow-card bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span>Today's Performance</span>
              </CardTitle>
              <CardDescription>Your daily medical practice overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-card rounded-xl border border-border hover:shadow-md transition-shadow group">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-bold text-primary">{todayStats.consultations}</div>
                  <div className="text-sm text-muted-foreground">Consultations</div>
                </div>
                <div className="text-center p-4 bg-card rounded-xl border border-border hover:shadow-md transition-shadow group">
                  <div className="flex items-center justify-center mb-2">
                    <FileText className="h-8 w-8 text-success group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-bold text-success">{todayStats.prescriptions}</div>
                  <div className="text-sm text-muted-foreground">Prescriptions</div>
                </div>
                <div className="text-center p-4 bg-card rounded-xl border border-border hover:shadow-md transition-shadow group">
                  <div className="flex items-center justify-center mb-2">
                    <AlertCircle className="h-8 w-8 text-emergency group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="text-2xl font-bold text-emergency">{todayStats.emergencies}</div>
                  <div className="text-sm text-muted-foreground">Emergencies</div>
                </div>
                <div className="text-center p-4 bg-card rounded-xl border border-border hover:shadow-md transition-shadow group">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-8 h-8 bg-warning/20 rounded-full flex items-center justify-center">
                      <span className="text-warning font-bold text-lg">₹</span>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-warning">₹{todayStats.revenue.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Revenue</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Patients */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5 text-success" />
                <span>Recent Patients</span>
              </CardTitle>
              <CardDescription>Latest patient interactions and status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentPatients.map((patient) => (
                <div key={patient.id} className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{patient.name}</h4>
                    <p className="text-sm text-muted-foreground">{patient.condition}</p>
                    <p className="text-xs text-muted-foreground">{patient.lastVisit}</p>
                  </div>
                  <Badge variant={
                    patient.status === 'stable' ? 'default' :
                    patient.status === 'monitoring' ? 'secondary' : 'outline'
                  } className="capitalize">
                    {patient.status}
                  </Badge>
                  <Button size="sm" variant="outline" className="hover:scale-105 transition-transform">
                    <Video className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>


          
          {/* Performance Metrics */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Your practice statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-success">4.9/5</div>
                  <div className="text-sm text-muted-foreground">{t('patient')} Rating</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-primary">98%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-warning">15 min</div>
                  <div className="text-sm text-muted-foreground">Avg Response</div>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="text-2xl font-bold text-emergency">245</div>
                  <div className="text-sm text-muted-foreground">Lives Helped</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>{t('appointmentRequests')}</CardTitle>
              <CardDescription>{t('manageAppointments')}</CardDescription>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-sm font-medium text-muted-foreground self-center">Filter:</span>
                {['all', 'pending', 'approved', 'cancelled'].map((filter) => (
                  <Button
                    key={filter}
                    variant={appointmentFilter === filter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAppointmentFilter(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {doctorAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No appointments found</p>
                  <p className="text-sm text-muted-foreground">Appointments from patients will appear here</p>
                </div>
              ) : (
                doctorAppointments
                  .filter(appointment => appointmentFilter === 'all' || appointment.status === appointmentFilter)
                  .map((appointment) => (
                  <div key={appointment.id} className="border border-border rounded-lg p-4 space-y-3 hover:shadow-card transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-success" />
                        <span className="font-medium">{appointment.patientName}</span>
                        <Badge variant="outline" className="text-xs">
                          ID: {appointment.patientId}
                        </Badge>
                      </div>
                      <Badge variant={
                        appointment.status === 'pending' ? 'secondary' :
                        appointment.status === 'approved' ? 'default' : 'outline'
                      } className="animate-pulse-glow">
                        {appointment.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{appointment.appointmentDate}</span>
                      </div>
                      {appointment.timeSlot && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{appointment.timeSlot}</span>
                        </div>
                      )}
                    </div>

                    {appointment.symptoms && (
                      <div className="bg-muted/50 p-3 rounded text-sm border-l-4 border-primary">
                        <strong>{t('symptoms')}:</strong> {appointment.symptoms}
                      </div>
                    )}

                    {appointment.status === 'pending' && (
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="success"
                          className="hover:scale-105 transition-transform"
                          onClick={async () => {
                            try {
                              const response = await fetch(`http://localhost:8080/api/appointments/${appointment.id}/status`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'approved' })
                              });
                              if (response.ok) {
                                loadDoctorAppointments();
                                toast({ title: 'Appointment Approved', description: 'Patient has been notified' });
                              }
                            } catch (error) {
                              toast({ title: 'Error', description: 'Failed to approve appointment', variant: 'destructive' });
                            }
                          }}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          {t('approve')}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="hover:scale-105 transition-transform"
                          onClick={async () => {
                            try {
                              const response = await fetch(`http://localhost:8080/api/appointments/${appointment.id}/status`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'cancelled' })
                              });
                              if (response.ok) {
                                loadDoctorAppointments();
                                toast({ title: 'Appointment Rejected', description: 'Patient has been notified', variant: 'destructive' });
                              }
                            } catch (error) {
                              toast({ title: 'Error', description: 'Failed to reject appointment', variant: 'destructive' });
                            }
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {t('reject')}
                        </Button>
                      </div>
                    )}

                    {appointment.status === 'approved' && (
                      <Button 
                        size="sm" 
                        variant="medical"
                        className="hover:scale-105 transition-transform"
                        onClick={() => startVideoAudioCall(appointment.id)}
                      >
                        <div className="flex items-center space-x-1 mr-1">
                          <Video className="h-3 w-3" />
                          <AudioLines className="h-3 w-3" />
                        </div>
                        {t('startConsultation')}
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>My {t('prescriptions')}</CardTitle>
              <CardDescription>View and create prescriptions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h4 className="font-medium mb-2">Recent Prescriptions</h4>
                <div className="text-sm text-muted-foreground">
                  {todayStats.prescriptions} prescriptions created today
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Add {t('prescriptions')}</CardTitle>
              <CardDescription>Create prescription for your patients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('patient')} ID</label>
                <Input
                  placeholder="Enter patient ID (e.g., 1, 2, 3)"
                  value={prescriptionForm.patientId}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, patientId: e.target.value }))}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 font-medium"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  💡 Tip: Patient ID will be auto-filled after video calls
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">{t('medicines')}</label>
                <Textarea
                  placeholder="e.g., Paracetamol 500mg - Twice daily for 5 days"
                  value={prescriptionForm.medicines}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, medicines: e.target.value }))}
                  rows={4}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Additional {t('notes')}</label>
                <Textarea
                  placeholder={`Any additional instructions for the ${t('patient')}`}
                  value={prescriptionForm.notes}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex space-x-2">
                <Button onClick={handleAddPrescription} variant="medical" className="flex-1 hover:scale-105 transition-transform">
                  <FileText className="h-4 w-4 mr-2" />
                  Add {t('prescriptions')}
                </Button>
                <Button 
                  onClick={() => {
                    setPrescriptionForm({
                      patientId: '1',
                      medicines: 'Paracetamol 500mg - Twice daily for 5 days\nRest and drink plenty of water',
                      notes: 'Take after meals. Contact if symptoms persist.'
                    });
                  }}
                  variant="outline"
                  size="sm"
                >
                  🧪 Fill Test Data
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      const response = await fetch('http://localhost:8080/api/appointments/debug/all');
                      const data = await response.json();
                      console.log('Debug info:', data);
                      toast({
                        title: 'Debug Info',
                        description: `Found ${data.totalUsers} users. Check console for details.`,
                      });
                    } catch (error) {
                      toast({
                        title: 'Debug Error',
                        description: 'Failed to connect to backend',
                        variant: 'destructive'
                      });
                    }
                  }}
                  variant="ghost"
                  size="sm"
                >
                  🔍 Check Backend
                </Button>
                <Button 
                  onClick={async () => {
                    try {
                      const response = await fetch(`http://localhost:8080/api/appointments/doctor/${user?.id}`);
                      if (response.ok) {
                        const appointments = await response.json();
                        console.log('Doctor appointments:', appointments);
                        toast({
                          title: 'Appointments Check',
                          description: `Found ${appointments.length} appointments for this doctor`,
                        });
                        loadDoctorAppointments();
                      } else {
                        toast({ title: 'Error', description: `Failed: ${response.status}`, variant: 'destructive' });
                      }
                    } catch (error) {
                      toast({ title: 'Error', description: 'Failed to check appointments', variant: 'destructive' });
                    }
                  }}
                  variant="ghost"
                  size="sm"
                >
                  📅 Refresh Appointments
                </Button>
                <Button 
                  onClick={async () => {
                    console.log('🔄 Manual notification check for doctor:', user?.id);
                    try {
                      const response = await fetch(`http://localhost:8080/api/prescriptions/taken-notifications/${user?.id}`);
                      console.log('Manual check response status:', response.status);
                      
                      if (response.ok) {
                        const notifications = await response.json();
                        console.log('Manual check notifications:', notifications);
                        toast({
                          title: 'Notifications Check',
                          description: `Found ${notifications.length} recent medicine taken notifications`,
                        });
                        
                        // Show each notification
                        notifications.forEach((notification: any) => {
                          console.log('Manual notification:', notification);
                          toast({
                            title: '💊 Medicine Taken (Manual)',
                            description: `${notification.patientName} took medicine at ${new Date(notification.takenAt).toLocaleString()}`,
                          });
                        });
                      } else {
                        const errorText = await response.text();
                        console.error('Manual check failed:', errorText);
                        toast({ title: 'Error', description: `Failed: ${response.status}`, variant: 'destructive' });
                      }
                    } catch (error) {
                      console.error('Manual check error:', error);
                      toast({ title: 'Error', description: 'Failed to check notifications', variant: 'destructive' });
                    }
                  }}
                  variant="ghost"
                  size="sm"
                >
                  💊 Check Medicine Taken
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Patient Messages</CardTitle>
              <CardDescription>Communicate with your patients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No messages yet</p>
                <p className="text-sm text-muted-foreground">Patient messages will appear here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


      </Tabs>

      {/* Profile Edit Modal */}
      {showProfileEdit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Edit Profile</span>
                <Button variant="ghost" size="sm" onClick={() => setShowProfileEdit(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  value={profileForm.name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <Input
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Address</label>
                <Textarea
                  value={profileForm.address}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter your address"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Specialization</label>
                <Input
                  value={profileForm.specialization}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, specialization: e.target.value }))}
                  placeholder="Enter your specialization"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Experience</label>
                <Input
                  value={profileForm.experience}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="e.g., 5+ years, 10 years"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">License Number</label>
                <Input
                  value={profileForm.licenseNumber}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                  placeholder="Enter license number"
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <Button onClick={handleProfileUpdate} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setShowProfileEdit(false)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Practice Settings</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </div>
                <Button
                  variant={settings.notifications ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSettings(prev => ({ ...prev, notifications: !prev.notifications }))}
                >
                  {settings.notifications ? 'On' : 'Off'}
                </Button>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Auto-Accept Calls</span>
                </div>
                <Button
                  variant={settings.autoAcceptCalls ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSettings(prev => ({ ...prev, autoAcceptCalls: !prev.autoAcceptCalls }))}
                >
                  {settings.autoAcceptCalls ? 'On' : 'Off'}
                </Button>
              </div>
              
              <div className="space-y-2 mb-4">
                <label className="text-sm font-medium">Consultation Fee (₹)</label>
                <Input
                  type="number"
                  value={settings.consultationFee}
                  onChange={(e) => setSettings(prev => ({ ...prev, consultationFee: parseInt(e.target.value) || 0 }))}
                  placeholder="500"
                />
              </div>
              
              <div className="flex space-x-2 pt-4 border-t">
                <Button onClick={() => { handleSettingsUpdate(); setShowSettings(false); }} className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
                <Button variant="outline" onClick={() => setShowSettings(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Post-Call Prescription Modal */}
      {showPrescriptionModal && callPatientInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Add Prescription</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowPrescriptionModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                Consultation completed. Add prescription for the patient.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Patient Information Display */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <h4 className="font-semibold text-primary mb-2 flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Patient Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Patient ID:</span>
                    <div className="font-medium text-lg">{callPatientInfo.id}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Patient Name:</span>
                    <div className="font-medium text-lg">{callPatientInfo.name}</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Patient ID (Editable)</label>
                <Input
                  value={callPatientInfo.id}
                  onChange={(e) => {
                    setCallPatientInfo(prev => prev ? { ...prev, id: e.target.value } : null);
                    setPrescriptionForm(prev => ({ ...prev, patientId: e.target.value }));
                  }}
                  placeholder="Patient ID"
                  className="font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Medicines & Dosage</label>
                <Textarea
                  placeholder="e.g., Paracetamol 500mg - Twice daily for 5 days&#10;Azithromycin 250mg - Once daily for 3 days"
                  value={prescriptionForm.medicines}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, medicines: e.target.value, patientId: callPatientInfo.id }))}
                  rows={4}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Additional Notes</label>
                <Textarea
                  placeholder="Any additional instructions for the patient"
                  value={prescriptionForm.notes}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  onClick={async () => {
                    await handleAddPrescription();
                    setShowPrescriptionModal(false);
                    setCallPatientInfo(null);
                    setPrescriptionForm({ patientId: '', medicines: '', notes: '' });
                    setTodayStats(prev => ({ ...prev, prescriptions: prev.prescriptions + 1 }));
                  }} 
                  className="flex-1"
                  disabled={!prescriptionForm.medicines.trim()}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Add Prescription
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowPrescriptionModal(false);
                    setCallPatientInfo(null);
                    setPrescriptionForm({ patientId: '', medicines: '', notes: '' });
                  }} 
                  className="flex-1"
                >
                  Skip
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;