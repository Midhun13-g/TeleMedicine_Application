import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Pill, Search, CheckCircle, AlertCircle, FileText, Heart, Activity, Video, AudioLines, MapPin, Star, Send, Bot, Stethoscope, ExternalLink } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
// Removed mock data imports; use backend services only
import { useToast } from '@/hooks/use-toast';
import { symptomService, type SymptomResult } from '@/services/symptomService';
import { appointmentService, type Appointment } from '@/services/appointmentService';
import AppointmentBooking from '@/components/AppointmentBooking';

const PatientDashboard = () => {
  const { user } = useAuth();
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

  const [patientPrescriptions, setPatientPrescriptions] = useState([]);

  useEffect(() => {
    if (user?.id) {
      // Fetch prescriptions from backend
      fetch(`http://localhost:8081/api/prescriptions/patient/${user.id}`)
        .then(res => res.json())
        .then(data => setPatientPrescriptions(data))
        .catch(() => setPatientPrescriptions([]));
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadAppointments();
    }
  }, [user?.id]);

  const loadAppointments = async () => {
    if (user?.id) {
      const appointments = await appointmentService.getPatientAppointments(parseInt(user.id));
      setUserAppointments(appointments);
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

  // Replace with backend medicine search or remove if not implemented
  const searchMedicine = () => {
    toast({
      title: t('featureUnavailable'),
      description: 'Medicine search is not available yet.',
      variant: 'destructive'
    });
  };



  return (
    <div className="space-y-6">
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

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="symptoms">{t('symptoms')}</TabsTrigger>
          <TabsTrigger value="appointments">{t('appointments')}</TabsTrigger>
          <TabsTrigger value="medicines">{t('medicines')}</TabsTrigger>
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
              <Button variant="outline" className="h-20 flex-col space-y-2 hover:scale-105 transition-transform">
                <Search className="h-6 w-6" />
                <span>{t('checkMedicine')}</span>
              </Button>
              <Button variant="success" className="h-20 flex-col space-y-2 hover:scale-105 transition-transform">
                <div className="flex items-center space-x-1">
                  <Video className="h-4 w-4" />
                  <AudioLines className="h-4 w-4" />
                </div>
                <span>{t('videoAudioCall')}</span>
              </Button>
              <Button variant="secondary" className="h-20 flex-col space-y-2 hover:scale-105 transition-transform">
                <MapPin className="h-6 w-6" />
                <span>{t('findPharmacy')}</span>
              </Button>
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
            </CardHeader>
            <CardContent className="space-y-4">
              {userAppointments.map((appointment) => (
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
                      {t(appointment.status)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{appointment.appointmentDate}</span>
                    </div>
                  </div>
                  {appointment.symptoms && (
                    <div className="bg-muted/50 p-2 rounded text-sm">
                      <strong>{t('symptoms')}:</strong> {appointment.symptoms}
                    </div>
                  )}
                  {appointment.status === 'approved' && (
                    <Button size="sm" variant="success" className="mt-2">
                      <div className="flex items-center space-x-1 mr-1">
                        <Video className="h-3 w-3" />
                        <AudioLines className="h-3 w-3" />
                      </div>
                      {t('joinCall')}
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medicines" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>{t('medicineAvailability')}</CardTitle>
              <CardDescription>Check if medicines are available at nearby pharmacies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder={t('searchMedicine')}
                  value={medicineSearch}
                  onChange={(e) => setMedicineSearch(e.target.value)}
                  className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
                <Button onClick={searchMedicine} variant="medical" className="hover:scale-105 transition-transform">
                  <Search className="h-4 w-4" />
                  {t('search')}
                </Button>
              </div>

              {/* Popular medicines */}
              <div>
                <h4 className="font-medium mb-2">{t('popularMedicines')}</h4>
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
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>{t('yourPrescriptions')}</CardTitle>
              <CardDescription>Active prescriptions from doctors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {patientPrescriptions.map((prescription) => (
                <div key={prescription.id} className="border border-border rounded-lg p-4 space-y-3 hover:shadow-card transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-medium">{prescription.doctorName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                        {t(prescription.status)}
                      </Badge>
                      <Badge variant="outline">{prescription.date}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {prescription.medicines.map((medicine) => (
                      <div key={medicine.id} className="flex items-center space-x-2 text-sm p-2 bg-muted/30 rounded">
                        <Pill className="h-3 w-3 text-success" />
                        <span className="font-medium">{medicine.name}</span>
                        <span className="text-muted-foreground">
                          {medicine.dosage} - {medicine.frequency} for {medicine.duration}
                        </span>
                      </div>
                    ))}
                  </div>

                  {prescription.notes && (
                    <p className="text-sm text-muted-foreground bg-muted p-2 rounded">
                      {t('notes')}: {prescription.notes}
                    </p>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline">
                      <MapPin className="h-3 w-3 mr-1" />
                      {t('findPharmacy')}
                    </Button>
                    <Button size="sm" variant="success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t('markAsTaken')}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Appointment Booking Modal */}
      {showAppointmentBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <AppointmentBooking
            isInstant={isInstantBooking}
            onClose={() => {
              setShowAppointmentBooking(false);
              loadAppointments();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;