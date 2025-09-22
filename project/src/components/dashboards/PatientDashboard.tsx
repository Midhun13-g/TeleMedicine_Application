import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Pill, Search, CheckCircle, AlertCircle, FileText, Heart, Activity, Video, AudioLines, MapPin, Star, Send, Bot, Stethoscope, ExternalLink, Settings, Edit, Save, X, Bell, Mail, Smartphone, Moon, Globe, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { symptomService, type SymptomResult } from '@/services/symptomService';
import { appointmentService, type Appointment } from '@/services/appointmentService';
import AppointmentBooking from '@/components/AppointmentBooking';
import AppointmentManager from '@/components/AppointmentManager';
import { VideoCall } from '@/components/VideoCall';
import { CallNotification } from '@/components/CallNotification';
import { callService } from '@/services/callService';
import { medicineService, type Medicine } from '@/services/medicineService';
import { pharmacyService, type Pharmacy } from '@/services/pharmacyService';
import { prescriptionService, type Prescription } from '@/services/prescriptionService';
import { realtimeService } from '@/services/realtimeService';
import MedicineSearch from '@/components/MedicineSearch';
import io from 'socket.io-client';

const PatientDashboard = () => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [medicineSearch, setMedicineSearch] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      type: 'bot',
      message: 'Hello! I\'m your AI health assistant. Please describe your symptoms and I\'ll help assess your condition.',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [symptomResults, setSymptomResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAppointmentBooking, setShowAppointmentBooking] = useState(false);
  const [isInstantBooking, setIsInstantBooking] = useState(false);
  const [userAppointments, setUserAppointments] = useState<Appointment[]>([]);
  const chatEndRef = useRef(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [currentCallTarget, setCurrentCallTarget] = useState<string | null>(null);

  const [patientPrescriptions, setPatientPrescriptions] = useState<Prescription[]>([]);
  const [medicineResults, setMedicineResults] = useState<Medicine[]>([]);
  const [nearbyPharmacies, setNearbyPharmacies] = useState<Pharmacy[]>([]);
  const [isSearchingMedicine, setIsSearchingMedicine] = useState(false);
  const [healthMetrics, setHealthMetrics] = useState({
    heartRate: 72,
    bloodPressure: '120/80',
    temperature: 98.6,
    weight: 65
  });
  const [upcomingReminders, setUpcomingReminders] = useState([
    { id: 1, type: 'medicine', title: 'Take Paracetamol', time: '2:00 PM', status: 'pending' },
    { id: 2, type: 'appointment', title: 'Dr. Sharma Consultation', time: '4:00 PM', status: 'confirmed' },
    { id: 3, type: 'checkup', title: 'Blood Pressure Check', time: '6:00 PM', status: 'pending' }
  ]);
  
  // Call functionality state (temporarily disabled)
  const [socket, setSocket] = useState<any>(null);
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [pendingConsultation, setPendingConsultation] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    email: user?.email || ''
  });
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    smsReminders: false,
    darkMode: false,
    language: 'en'
  });
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [appointmentFilter, setAppointmentFilter] = useState('all');

  useEffect(() => {
    if (user?.id) {
      loadPrescriptions();
      loadNearbyPharmacies();
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadAppointments();
      
      const interval = setInterval(() => {
        loadAppointments();
      }, 3000);
      
      return () => clearInterval(interval);
    }
  }, [user?.id]);
  
  // Initialize socket connection for real-time doctor availability
  useEffect(() => {
    if (!user?.id) return;
    
    const socketConnection = io('http://localhost:5002', {
      transports: ['websocket', 'polling']
    });
    setSocket(socketConnection);
    
    socketConnection.on('connect', () => {
      setConnectionStatus('connected');
      socketConnection.emit('patient_subscribe', { patientId: user.id });
      console.log('✅ Patient connected to call server');
    });
    
    socketConnection.on('disconnect', () => {
      setConnectionStatus('disconnected');
      console.log('❌ Patient disconnected from call server');
    });
    
    socketConnection.on('connect_error', (error) => {
      setConnectionStatus('error');
      console.log('❌ Connection error:', error);
    });
    
    // Listen for doctor status changes
    socketConnection.on('doctor_status_changed', ({ doctorId, status, doctorInfo }) => {
      console.log(`🔄 Doctor ${doctorId} is now ${status}`);
      
      if (status === 'online' && doctorInfo) {
        toast({
          title: 'Doctor Available',
          description: `Dr. ${doctorInfo.name} is now online and available for consultation`,
        });
      }
      
      // Update doctors list
      setAvailableDoctors(prev => {
        const existingIndex = prev.findIndex(doc => doc.doctorId === doctorId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = { 
            ...updated[existingIndex], 
            online: status === 'online', 
            ...doctorInfo 
          };
          return updated;
        } else if (status === 'online' && doctorInfo) {
          return [...prev, { doctorId, online: true, ...doctorInfo }];
        }
        return prev;
      });
    });
    
    // Listen for current doctors status
    socketConnection.on('doctors_status', (onlineDoctors) => {
      console.log('📋 Current online doctors:', onlineDoctors);
      if (onlineDoctors && onlineDoctors.length > 0) {
        setAvailableDoctors(onlineDoctors.map(doc => ({ ...doc, online: true })));
      }
    });
    
    // Listen for call start
    socketConnection.on('move_to_call', ({ roomId, consultationId }) => {
      console.log('🎉 Patient received move_to_call');
      console.log(`  - Room ID: ${roomId}`);
      console.log(`  - Consultation ID: ${consultationId}`);
      console.log(`  - Current pending: ${pendingConsultation}`);
      
      // Always move to call screen when doctor accepts
      setPendingConsultation(null);
      setCurrentCallTarget(roomId);
      setShowVideoCall(true);
      
      console.log('🎥 Patient moved to call screen with room:', roomId);
      
      toast({
        title: 'Call Started',
        description: 'Doctor accepted! Starting video call...',
      });
    });
    
    socketConnection.on('consultation_rejected', ({ consultationId, reason }) => {
      console.log('❌ Consultation rejected:', consultationId, reason);
      setPendingConsultation(null);
      setShowVideoCall(false);
      setCurrentCallTarget(null);
      
      toast({
        title: 'Call Request Rejected',
        description: reason || 'Doctor declined your consultation request',
        variant: 'destructive'
      });
    });
    
    socketConnection.on('consultation_reject', ({ consultationId, reason }) => {
      console.log('❌ Consultation reject event:', consultationId, reason);
      setPendingConsultation(null);
      setShowVideoCall(false);
      setCurrentCallTarget(null);
      
      toast({
        title: 'Call Request Rejected', 
        description: reason || 'Doctor declined your consultation request',
        variant: 'destructive'
      });
    });
    
    // Listen for doctor info updates
    socketConnection.on('doctor_info_updated', ({ doctorId, doctorInfo }) => {
      console.log('📋 Doctor info updated:', doctorId, doctorInfo);
      
      // Update available doctors list
      setAvailableDoctors(prev => 
        prev.map(doctor => 
          doctor.doctorId === doctorId 
            ? { ...doctor, ...doctorInfo }
            : doctor
        )
      );
      
      toast({
        title: 'Doctor Info Updated',
        description: `Dr. ${doctorInfo.name}'s information has been updated`,
      });
    });
    
    // Listen for new prescriptions
    socketConnection.on('prescription_added', (prescriptionData) => {
      console.log('📋 Received prescription notification:', prescriptionData);
      console.log('  - Patient ID from notification:', prescriptionData.patientId);
      console.log('  - Current user ID:', user?.id);
      console.log('  - Match check:', prescriptionData.patientId == user?.id, prescriptionData.patientId === user?.id);
      
      // String comparison for patient ID
      const notificationPatientId = String(prescriptionData.patientId);
      const currentUserId = String(user?.id);
      
      if (notificationPatientId === currentUserId) {
        console.log('✅ Prescription is for current user');
        
        toast({
          title: '💊 New Prescription',
          description: `Dr. ${prescriptionData.doctorName} sent you a prescription`,
        });
        
        // Immediate reload
        loadPrescriptions();
        
        // Also reload after delay
        setTimeout(loadPrescriptions, 2000);
        
        // Add reminder
        if (prescriptionData.medicines) {
          const medicine = prescriptionData.medicines.split('\n')[0] || 'New Medicine';
          setUpcomingReminders(prev => [{
            id: Date.now(),
            type: 'medicine',
            title: `New: ${medicine}`,
            time: 'Now',
            status: 'pending'
          }, ...prev]);
        }
      }
    });
    
    return () => {
      if (socketConnection) {
        socketConnection.disconnect();
      }
    };
  }, [user?.id]);

  const loadAppointments = async () => {
    if (user?.id) {
      try {
        const response = await fetch(`http://localhost:8080/api/appointments/patient/${user.id}`);
        if (response.ok) {
          const appointments = await response.json();
          console.log('Loaded patient appointments:', appointments);
          setUserAppointments(appointments);
        } else {
          console.error('Failed to load appointments:', response.status);
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
      }
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: currentMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    // Generate AI response with symptom analysis
    generateBotResponse(currentMessage).then(response => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        message: response,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    });
  };

  const analyzeSymptoms = async (userInput) => {
    const symptoms = userInput.toLowerCase().split(/[,\s]+/).filter(s => s.length > 2);
    if (symptoms.length === 0) return null;

    try {
      const results = await symptomService.checkSymptoms(symptoms);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      return null;
    }
  };

  const generateBotResponse = async (userInput) => {
    const symptoms = userInput.toLowerCase();

    // Check if input contains symptoms for analysis
    const symptomKeywords = ['fever', 'headache', 'cough', 'pain', 'nausea', 'vomiting', 'diarrhea', 'fatigue', 'dizziness'];
    const hasSymptoms = symptomKeywords.some(keyword => symptoms.includes(keyword));

    if (hasSymptoms) {
      setIsAnalyzing(true);
      const result = await analyzeSymptoms(userInput);
      setIsAnalyzing(false);

      if (result) {
        setSymptomResults([result]);
        return `Based on your symptoms, I found a ${(result.match_score * 100).toFixed(1)}% match with **${result.disease}**. The matched symptoms are: ${result.matched_symptoms.join(', ')}. I recommend consulting with a healthcare professional for proper evaluation. Would you like to book an appointment?`;
      }
    }

    // Fallback responses
    if (symptoms.includes('fever') || symptoms.includes('temperature')) {
      return 'I understand you\'re experiencing fever. This could indicate an infection. I recommend monitoring your temperature and consulting a doctor if it persists above 100.4°F (38°C). Would you like to book an appointment?';
    }
    if (symptoms.includes('headache') || symptoms.includes('head pain')) {
      return 'Headaches can have various causes. Are you experiencing any other symptoms like nausea, sensitivity to light, or neck stiffness? This information will help me provide better guidance.';
    }
    if (symptoms.includes('cough')) {
      return 'I see you have a cough. Is it dry or productive? Any associated symptoms like fever, shortness of breath, or chest pain? Please provide more details for better assessment.';
    }
    return 'Thank you for sharing your symptoms. Based on what you\'ve described, I recommend consulting with a healthcare professional for proper evaluation. Would you like me to help you schedule an appointment with one of our doctors?';
  };

  const searchMedicine = async () => {
    if (!medicineSearch.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a medicine name to search',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSearchingMedicine(true);
    try {
      const results = await medicineService.searchMedicines(medicineSearch);
      setMedicineResults(results);
      
      if (results.length === 0) {
        toast({
          title: 'No Results',
          description: 'No medicines found with that name',
        });
      } else {
        toast({
          title: 'Search Complete',
          description: `Found ${results.length} medicine(s)`,
        });
      }
    } catch (error) {
      toast({
        title: 'Search Failed',
        description: 'Unable to search medicines at the moment',
        variant: 'destructive'
      });
    } finally {
      setIsSearchingMedicine(false);
    }
  };
  
  const checkMedicineAvailability = async (medicineName: string) => {
    try {
      const availability = await medicineService.checkAvailability(medicineName);
      toast({
        title: availability.available ? 'Available' : 'Not Available',
        description: availability.available 
          ? `${medicineName} is available at ${availability.nearbyPharmacies.length} nearby pharmacies`
          : `${medicineName} is currently not available`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Unable to check availability',
        variant: 'destructive'
      });
    }
  };
  
  const findNearbyPharmacies = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const pharmacies = await pharmacyService.getNearbyPharmacies(latitude, longitude);
        setNearbyPharmacies(pharmacies);
        
        toast({
          title: 'Pharmacies Found',
          description: `Found ${pharmacies.length} nearby pharmacies`,
        });
      }, () => {
        toast({
          title: 'Location Access Denied',
          description: 'Please enable location access to find nearby pharmacies',
          variant: 'destructive'
        });
      });
    } else {
      toast({
        title: 'Location Not Supported',
        description: 'Your browser does not support location services',
        variant: 'destructive'
      });
    }
  };
  
  const loadPrescriptions = async () => {
    if (user?.id) {
      const prescriptions = await prescriptionService.getPatientPrescriptions(parseInt(user.id));
      setPatientPrescriptions(prescriptions);
    }
  };
  
  const loadNearbyPharmacies = async () => {
    const pharmacies = await pharmacyService.getNearbyPharmacies();
    setNearbyPharmacies(pharmacies);
  };
  
  const requestConsultation = async (doctorId: string, consultationType: 'Video' | 'Audio' = 'Video') => {
    if (pendingConsultation) {
      toast({
        title: 'Request Pending',
        description: 'You already have a consultation request pending',
        variant: 'destructive'
      });
      return;
    }
    
    if (!socket || !socket.connected) {
      toast({
        title: 'Connection Error',
        description: 'Not connected to call server. Please refresh the page.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const consultationId = `consultation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`📱 Patient requesting consultation: ${consultationId}`);
      console.log(`  - Doctor ID: ${doctorId}`);
      console.log(`  - Patient ID: ${user?.id}`);
      console.log(`  - Type: ${consultationType}`);
      
      // Send request via socket
      socket.emit('consultation_request', {
        consultationId,
        doctorId,
        patientId: user?.id,
        patientInfo: { 
          id: user?.id,
          name: user?.name || 'Patient' 
        },
        consultationType
      });
      
      setPendingConsultation(consultationId);
      console.log(`🔄 Set pending consultation: ${consultationId}`);
      
      toast({
        title: 'Consultation Requested',
        description: `Waiting for doctor to accept your ${consultationType.toLowerCase()} call request...`,
      });
    } catch (error) {
      console.error('Error requesting consultation:', error);
      toast({
        title: 'Error',
        description: 'Failed to request consultation',
        variant: 'destructive'
      });
    }
  };
  
  const startVideoCall = async (doctorId: string) => {
    await requestConsultation(doctorId, 'Video');
  };
  
  const handleCallEnd = () => {
    setShowVideoCall(false);
    setCurrentCallTarget(null);
  };

  const handleProfileUpdate = async () => {
    if (!user?.id) return;
    
    try {
      const result = await updateProfile(user.id, profileForm);
      
      if (result.success) {
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
      localStorage.setItem('patientSettings', JSON.stringify(settings));
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
    const savedSettings = localStorage.getItem('patientSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);



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
          <h1 className="text-3xl font-bold text-foreground">{t('patient')} {t('dashboard')}</h1>
          <p className="text-muted-foreground mt-1">Your health, our priority</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-success">
            <Heart className="h-3 w-3 mr-1" />
            {t('welcome')}, {user?.name}
          </Badge>
          <Badge variant="outline" className="bg-primary/10 text-primary font-mono">
            ID: {user?.id}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Health Status Banner */}
      <Card className="shadow-medical bg-gradient-health text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Health Status: Good</h3>
              <p className="text-white/80">Last checkup: 2 weeks ago</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto mb-1" />
                <div className="text-sm">{t('active')}</div>
              </div>
              <div className="text-center">
                <Heart className="h-8 w-8 mx-auto mb-1" />
                <div className="text-sm">Healthy</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="symptoms">{t('symptoms')}</TabsTrigger>
          <TabsTrigger value="appointments">{t('appointments')}</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="medicines">Medicine Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="shadow-card hover:shadow-medical transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('upcomingAppointments')}</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{userAppointments.length}</div>
                <p className="text-xs text-muted-foreground">Next: Today 10:00 AM</p>
                <div className="mt-2">
                  <div className="flex items-center text-xs text-success">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    <span>Dr. Rachit confirmed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-medical transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('activePrescriptions')}</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">{patientPrescriptions.length}</div>
                <p className="text-xs text-muted-foreground">2 medicines to take today</p>
                <div className="mt-2">
                  <div className="flex items-center text-xs text-warning">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Next dose: 2:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-medical transition-shadow duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('healthScore')}</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-warning">Good</div>
                <p className="text-xs text-muted-foreground">Based on recent checkups</p>
                <div className="mt-2 flex items-center">
                  {[1, 2, 3, 4].map((star) => (
                    <Star key={star} className="h-3 w-3 text-warning fill-current" />
                  ))}
                  <Star className="h-3 w-3 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>{t('quickActions')}</CardTitle>
              <CardDescription>Common tasks for patients</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-4 gap-4">
              <Button
                variant="medical"
                className="h-20 flex-col space-y-2 hover:scale-105 transition-transform"
                onClick={() => {
                  setIsInstantBooking(false);
                  setShowAppointmentBooking(true);
                }}
              >
                <Calendar className="h-6 w-6" />
                <span>{t('bookAppointment')}</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2 hover:scale-105 transition-transform group"
                onClick={() => setActiveTab('medicines')}
              >
                <div className="relative">
                  <Search className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse"></div>
                </div>
                <span>Check Medicine</span>
              </Button>
              <Button 
                variant="warning" 
                className="h-20 flex-col space-y-2 hover:scale-105 transition-transform group"
                onClick={() => setActiveTab('symptoms')}
              >
                <div className="relative">
                  <Bot className="h-6 w-6 group-hover:animate-pulse" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                </div>
                <span>AI Symptoms</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col space-y-2 hover:scale-105 transition-transform group"
                onClick={() => {
                  setActiveTab('prescriptions');
                  loadPrescriptions();
                }}
              >
                <div className="relative">
                  <FileText className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
                <span>My Prescriptions</span>
              </Button>
            </CardContent>
          </Card>


          
          {/* Available Doctors */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5 text-primary" />
                <span>Available Doctors ({availableDoctors.filter(d => d.online).length})</span>
              </CardTitle>
              <CardDescription>
                Online doctors ready for consultation • Call Server: {connectionStatus === 'connected' ? '✅ Connected' : connectionStatus === 'error' ? '❌ Server Offline' : '⏳ Connecting...'}
                <br />
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    console.log('🧪 TEST: Manually triggering move_to_call');
                    setCurrentCallTarget('test_room_123');
                    setShowVideoCall(true);
                  }}
                  className="mt-2"
                >
                  🧪 Test Call Screen
                </Button>
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableDoctors.filter(d => d.online).length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-lg">
                  <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No doctors are currently online</p>
                  <p className="text-sm text-muted-foreground">Please check back later or book an appointment</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {availableDoctors.filter(d => d.online).map((doctor) => (
                    <div key={doctor.doctorId} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <Stethoscope className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">Dr. {doctor.name}</h4>
                            <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                          </div>
                        </div>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                          Online
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Experience: {doctor.experience || 'Not specified'}
                      </p>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => requestConsultation(doctor.doctorId, 'Video')}
                          disabled={!!pendingConsultation}
                          className="flex-1 hover:scale-105 transition-transform"
                        >
                          <Video className="h-3 w-3 mr-1" />
                          {pendingConsultation ? 'Pending...' : 'Video Call'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => requestConsultation(doctor.doctorId, 'Audio')}
                          disabled={!!pendingConsultation}
                          className="flex-1 hover:scale-105 transition-transform"
                        >
                          <AudioLines className="h-3 w-3 mr-1" />
                          Audio Call
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {pendingConsultation && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="font-medium text-orange-800">Consultation Request Pending</span>
                  </div>
                  <p className="text-sm text-orange-700">Waiting for doctor to accept your request...</p>
                  <p className="text-xs text-orange-600 mt-1">The doctor will either accept or decline your request shortly.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setPendingConsultation(null);
                      toast({
                        title: 'Request Cancelled',
                        description: 'Your consultation request has been cancelled.',
                      });
                    }}
                    className="mt-2"
                  >
                    Cancel Request
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Health Reminders */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-warning" />
                <span>Today's Reminders</span>
              </CardTitle>
              <CardDescription>Don't miss your health schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-3 h-3 rounded-full ${
                    reminder.type === 'medicine' ? 'bg-success animate-pulse' :
                    reminder.type === 'appointment' ? 'bg-primary animate-pulse' :
                    'bg-warning animate-pulse'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{reminder.title}</p>
                    <p className="text-xs text-muted-foreground">{reminder.time}</p>
                  </div>
                  <Badge variant={reminder.status === 'confirmed' ? 'default' : 'secondary'} className="text-xs">
                    {reminder.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>{t('recentActivity')}</CardTitle>
              <CardDescription>Your latest health interactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Prescription filled</p>
                  <p className="text-xs text-muted-foreground">Paracetamol - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Appointment confirmed</p>
                  <p className="text-xs text-muted-foreground">Dr. Rachit - Today 10:00 AM</p>
                  {/* Appointment Quick Actions */}
                  <div className="flex gap-4 mb-6 justify-end">
                    <Button variant="medical" onClick={() => { setIsInstantBooking(true); setShowAppointmentBooking(true); }}>
                      Instant Appointment
                    </Button>
                    <Button variant="outline" onClick={() => { setIsInstantBooking(false); setShowAppointmentBooking(true); }}>
                      Book Slot
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Health checkup reminder</p>
                  <p className="text-xs text-muted-foreground">Due in 3 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="symptoms" className="space-y-4">

          <Card className="shadow-card h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-primary" />
                <span>AI {t('symptoms')} Chat</span>
              </CardTitle>
              <CardDescription>Chat with our AI for additional health guidance</CardDescription>
              <div className="bg-gradient-subtle p-3 rounded-lg border border-border">
                <div className="flex items-center space-x-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span className="font-medium text-xs">Smart Symptom Analysis</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Describe your symptoms in detail and I'll analyze them for possible conditions.
                </p>
              </div>
            </CardHeader>


            <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-muted/20 rounded-lg">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${msg.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-4'
                      : 'bg-background border border-border mr-4'
                      }`}>
                      {msg.type === 'bot' && (
                        <div className="flex items-center space-x-2 mb-1">
                          <Bot className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium text-primary">AI Assistant</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {(isTyping || isAnalyzing) && (
                  <div className="flex justify-start">
                    <div className="bg-background border border-border p-3 rounded-lg mr-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <Bot className="h-4 w-4 text-primary" />
                        <span className="text-xs font-medium text-primary">
                          {isAnalyzing ? 'Analyzing Symptoms...' : 'AI Assistant'}
                        </span>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Symptom Analysis Results */}
                {symptomResults.length > 0 && (
                  <div className="bg-gradient-subtle p-4 rounded-lg border">
                    <h4 className="font-medium mb-2 flex items-center">
                      <Stethoscope className="h-4 w-4 mr-2 text-primary" />
                      Symptom Analysis Result
                    </h4>
                    {symptomResults.map((result, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{result.disease}</span>
                          <Badge variant="outline">{(result.match_score * 100).toFixed(1)}% match</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Matched symptoms: {result.matched_symptoms.join(', ')}
                        </p>
                        <Button size="sm" variant="medical" className="mt-2">
                          <Calendar className="h-3 w-3 mr-1" />
                          Book Appointment
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Message Input */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Describe your symptoms... (e.g., 'I have fever, headache and cough')"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  variant="medical"
                  size="icon"
                  disabled={!currentMessage.trim() || isTyping || isAnalyzing}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick Symptom Buttons */}
              <div className="flex flex-wrap gap-2">
                {['fever and headache', 'cough and fatigue', 'stomach pain', 'chest pain', 'dizziness'].map((symptom) => (
                  <Button
                    key={symptom}
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMessage(symptom)}
                    className="text-xs"
                  >
                    {symptom}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Your {t('appointments')}</CardTitle>
              <CardDescription>Manage your doctor consultations</CardDescription>
              <div className="space-y-3 mt-4">
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="medical" 
                    onClick={() => {
                      setIsInstantBooking(false);
                      setShowAppointmentBooking(true);
                    }}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={loadAppointments}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
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
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {userAppointments
                .filter(appointment => appointmentFilter === 'all' || appointment.status === appointmentFilter)
                .map((appointment) => (
                <div key={appointment.id} className="border border-border rounded-lg p-4 space-y-2 hover:shadow-card transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-medium">{appointment.doctorName}</span>
                      <Badge variant="outline" className="text-xs">
                        {appointment.doctorSpecialization}
                      </Badge>
                    </div>
                    <Badge variant={appointment.status === 'approved' ? 'default' : 'secondary'} className="animate-pulse-glow">
                      {appointment.status}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>
                        {appointment.timeSlot ? 
                          new Date(`2000-01-01T${appointment.timeSlot}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          }) : 
                          new Date(appointment.appointmentDate).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })
                        }
                      </span>
                    </div>
                  </div>
                  {appointment.symptoms && (
                    <div className="bg-muted/50 p-2 rounded text-sm">
                      <strong>{t('symptoms')}:</strong> {appointment.symptoms}
                    </div>
                  )}
                  <div className="flex gap-2 mt-2">
                    {appointment.status === 'approved' && (
                      <Button 
                        size="sm" 
                        variant="success" 
                        onClick={() => startVideoCall(appointment.doctorName)}
                      >
                        <div className="flex items-center space-x-1 mr-1">
                          <Video className="h-3 w-3" />
                          <AudioLines className="h-3 w-3" />
                        </div>
                        {t('joinCall')}
                      </Button>
                    )}
                    {appointment.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            toast({
                              title: 'Reschedule Request',
                              description: 'Reschedule functionality will be available soon',
                            });
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Reschedule
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => {
                            toast({
                              title: 'Cancel Appointment',
                              description: 'Appointment cancellation requested',
                              variant: 'destructive'
                            });
                          }}
                        >
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-4">

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Your Prescriptions</CardTitle>
              <CardDescription>Active prescriptions from doctors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2 mb-4">
                <Button 
                  onClick={loadPrescriptions} 
                  variant="outline" 
                  size="sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Refresh Prescriptions
                </Button>
                <Button 
                  onClick={() => {
                    console.log('📝 Current user ID:', user?.id);
                    console.log('📝 Current prescriptions:', patientPrescriptions);
                    toast({
                      title: 'Debug Info',
                      description: `User ID: ${user?.id}, Prescriptions: ${patientPrescriptions.length}`,
                    });
                  }}
                  variant="ghost"
                  size="sm"
                >
                  🔍 Debug
                </Button>
                <Button 
                  onClick={async () => {
                    // Test prescription creation by calling doctor API directly
                    try {
                      const response = await fetch('http://localhost:8080/api/prescriptions/create', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          patientId: parseInt(user?.id || '1'),
                          doctorId: 1,
                          medicines: 'Test Medicine - Take twice daily',
                          notes: 'Test prescription from patient dashboard'
                        })
                      });
                      const result = await response.json();
                      if (result.success) {
                        toast({ title: 'Test Prescription Created', description: `ID: ${result.prescriptionId}` });
                        loadPrescriptions();
                      } else {
                        toast({ title: 'Test Failed', description: result.message, variant: 'destructive' });
                      }
                    } catch (error) {
                      toast({ title: 'Test Error', description: 'Failed to create test prescription', variant: 'destructive' });
                    }
                  }}
                  variant="secondary"
                  size="sm"
                >
                  🧪 Test Prescription
                </Button>
                <Button 
                  onClick={() => {
                    if (socket && socket.connected) {
                      socket.emit('medicine_taken_notification', {
                        patientId: user?.id,
                        patientName: user?.name,
                        prescriptionId: 'TEST_123',
                        doctorName: 'Dr. Test',
                        takenAt: new Date().toISOString()
                      });
                      toast({ title: 'Test Notification Sent', description: 'Sent medicine taken notification to doctor' });
                    } else {
                      toast({ title: 'Not Connected', description: 'Socket not connected', variant: 'destructive' });
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  📡 Test Notify Doctor
                </Button>
              </div>
              
              {patientPrescriptions.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-2">No prescriptions found</p>
                  <p className="text-sm text-muted-foreground">Prescriptions from your doctors will appear here</p>
                </div>
              ) : (
                patientPrescriptions.map((prescription) => (
                  <div key={prescription.id} className="border border-border rounded-lg p-4 space-y-3 hover:shadow-card transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-primary" />
                        <span className="font-medium">Dr. {prescription.doctorName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                          {prescription.status}
                        </Badge>
                        <Badge variant="outline">{new Date(prescription.date).toLocaleDateString()}</Badge>
                      </div>
                    </div>

                    <div className="bg-muted/30 p-3 rounded">
                      <h5 className="font-medium mb-2 flex items-center">
                        <Pill className="h-4 w-4 mr-2 text-success" />
                        Medicines:
                      </h5>
                      <p className="text-sm whitespace-pre-wrap">{prescription.medicines}</p>
                    </div>

                    {prescription.notes && (
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded">
                        <p className="text-sm text-blue-800">
                          <strong>Doctor's Notes:</strong> {prescription.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" variant="outline" onClick={findNearbyPharmacies}>
                        <MapPin className="h-3 w-3 mr-1" />
                        Find Pharmacy
                      </Button>
                      <Button 
                        size="sm" 
                        variant="success"
                        onClick={async () => {
                          try {
                            const response = await fetch(`http://localhost:8080/api/prescriptions/${prescription.id}/mark-taken`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' }
                            });
                            const result = await response.json();
                            if (result.success) {
                              // Notify doctor via socket
                              if (socket && socket.connected) {
                                socket.emit('medicine_taken_notification', {
                                  patientId: user?.id,
                                  patientName: user?.name,
                                  prescriptionId: prescription.id,
                                  doctorName: prescription.doctorName,
                                  takenAt: new Date().toISOString()
                                });
                                console.log('📡 Sent medicine taken notification via socket');
                              }
                              
                              // Notify pharmacy
                              realtimeService.notifyMedicineTaken({
                                patientId: user?.id || '',
                                patientName: user?.name || 'Patient',
                                prescriptionId: prescription.id,
                                medicines: prescription.medicines,
                                takenAt: new Date().toISOString()
                              });
                              
                              toast({
                                title: '✅ Medicine Taken',
                                description: 'Doctor has been notified that you took your medicine.',
                              });
                              loadPrescriptions(); // Refresh the list
                            } else {
                              toast({
                                title: 'Error',
                                description: result.message || 'Failed to mark as taken',
                                variant: 'destructive'
                              });
                            }
                          } catch (error) {
                            toast({
                              title: 'Error',
                              description: 'Failed to mark medicine as taken',
                              variant: 'destructive'
                            });
                          }
                        }}
                        disabled={prescription.status === 'taken'}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {prescription.status === 'taken' ? 'Taken ✓' : 'Mark as Taken'}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medicines" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Medicine Availability</CardTitle>
              <CardDescription>Check if medicines are available at nearby pharmacies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search medicine..."
                  value={medicineSearch}
                  onChange={(e) => setMedicineSearch(e.target.value)}
                  className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
                <Button 
                  onClick={searchMedicine} 
                  variant="medical" 
                  className="hover:scale-105 transition-transform"
                  disabled={isSearchingMedicine}
                >
                  <Search className="h-4 w-4" />
                  {isSearchingMedicine ? 'Searching...' : 'Search'}
                </Button>
              </div>

              {/* Medicine Search Results */}
              {medicineResults.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Search Results</h4>
                  <div className="space-y-2">
                    {medicineResults.map((medicine) => (
                      <div key={medicine.id} className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium">{medicine.name}</h5>
                            <p className="text-sm text-muted-foreground">{medicine.manufacturer} • {medicine.category}</p>
                            <p className="text-sm">{medicine.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">₹{medicine.price}</p>
                            <Badge variant={medicine.available ? 'default' : 'secondary'}>
                              {medicine.available ? 'Available' : 'Out of Stock'}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => checkMedicineAvailability(medicine.name)}
                          >
                            Check Availability
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Popular medicines */}
              <div>
                <h4 className="font-medium mb-2">Popular Medicines</h4>
                <div className="flex flex-wrap gap-2">
                  {['Paracetamol', 'Azithromycin', 'Cetirizine', 'Amoxicillin'].map((medicine) => (
                    <Button
                      key={medicine}
                      variant="outline"
                      size="sm"
                      onClick={() => setMedicineSearch(medicine)}
                      className="hover:scale-105 transition-transform"
                    >
                      {medicine}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Nearby Pharmacies */}
              {nearbyPharmacies.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Nearby Pharmacies</h4>
                  <div className="space-y-2">
                    {nearbyPharmacies.map((pharmacy) => (
                      <div key={pharmacy.id} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium">{pharmacy.name}</h5>
                            <p className="text-sm text-muted-foreground">{pharmacy.address}</p>
                            <p className="text-sm">{pharmacy.openHours}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{pharmacy.distance}</p>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < pharmacy.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            {pharmacy.is24Hours && <Badge variant="outline" className="text-xs">24 Hours</Badge>}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="mt-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          Get Directions
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input
                  value={profileForm.email}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
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
                  <span>Settings</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted/30 p-3 rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Patient ID</span>
                  <span className="text-sm font-mono bg-primary/10 px-2 py-1 rounded">{user?.id}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Use this ID for prescriptions and appointments</p>
              </div>
              
              <Button
                onClick={() => {
                  setProfileForm({
                    name: user?.name || '',
                    phone: user?.phone || '',
                    address: user?.address || '',
                    email: user?.email || ''
                  });
                  setShowSettings(false);
                  setShowProfileEdit(true);
                }}
                variant="outline"
                className="w-full"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Preferences</h4>
                
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
                    <Mail className="h-4 w-4" />
                    <span>Email Alerts</span>
                  </div>
                  <Button
                    variant={settings.emailAlerts ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSettings(prev => ({ ...prev, emailAlerts: !prev.emailAlerts }))}
                  >
                    {settings.emailAlerts ? 'On' : 'Off'}
                  </Button>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4" />
                    <span>SMS Reminders</span>
                  </div>
                  <Button
                    variant={settings.smsReminders ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSettings(prev => ({ ...prev, smsReminders: !prev.smsReminders }))}
                  >
                    {settings.smsReminders ? 'On' : 'Off'}
                  </Button>
                </div>
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

      {/* Appointment Booking Modal */}
      {showAppointmentBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <AppointmentBooking
            isInstant={isInstantBooking}
            onClose={() => {
              setShowAppointmentBooking(false);
              setTimeout(() => {
                loadAppointments();
              }, 1000);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;