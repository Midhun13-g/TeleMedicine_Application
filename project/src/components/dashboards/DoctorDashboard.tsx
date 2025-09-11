import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Calendar, Clock, User, FileText, Video, AudioLines, CheckCircle, XCircle, Users, Stethoscope, Award, TrendingUp, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { mockAppointments } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: '',
    medicines: '',
    notes: ''
  });

  const doctorAppointments = mockAppointments.filter(apt => apt.doctorId === user?.id);
  const pendingCount = doctorAppointments.filter(apt => apt.status === 'pending').length;
  const approvedCount = doctorAppointments.filter(apt => apt.status === 'approved').length;

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

  const handleAddPrescription = () => {
    if (!prescriptionForm.medicines.trim()) {
      toast({
        title: "Error",
        description: "Please add medicines to the prescription.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Prescription Added",
      description: "Prescription has been saved and patient has been notified.",
    });

    setPrescriptionForm({ patientId: '', medicines: '', notes: '' });
  };

  const startVideoAudioCall = (appointmentId: string) => {
    toast({
      title: t('videoCallStarted'),
      description: t('connectingToPatient'),
    });
  };

  return (
    <div className="space-y-6">
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
        </div>
      </div>

      {/* Doctor Status Banner */}
      <Card className="shadow-medical bg-gradient-primary text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Status: {t('availableForConsultations')}</h3>
              <p className="text-white/80">Specialization: {user?.specialization}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="w-3 h-3 bg-success rounded-full mx-auto mb-1"></div>
                <div className="text-sm">Online</div>
              </div>
              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-1" />
                <div className="text-sm">High Rating</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t('overview')}</TabsTrigger>
          <TabsTrigger value="appointments">{t('appointments')}</TabsTrigger>
          <TabsTrigger value="prescriptions">{t('prescriptions')}</TabsTrigger>
          <TabsTrigger value="consultations">{t('consultations')}</TabsTrigger>
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

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>{t('quickActions')}</CardTitle>
              <CardDescription>Common tasks for doctors</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-4 gap-4">
              <Button variant="medical" className="h-20 flex-col space-y-2 hover:scale-105 transition-transform">
                <CheckCircle className="h-6 w-6" />
                <span>{t('approve')} {t('appointments')}</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col space-y-2 hover:scale-105 transition-transform">
                <FileText className="h-6 w-6" />
                <span>Write {t('prescriptions')}</span>
              </Button>
              <Button variant="success" className="h-20 flex-col space-y-2 hover:scale-105 transition-transform">
                <div className="flex items-center space-x-1">
                  <Video className="h-4 w-4" />
                  <AudioLines className="h-4 w-4" />
                </div>
                <span>{t('startConsultation')}</span>
              </Button>
              <Button variant="secondary" className="h-20 flex-col space-y-2 hover:scale-105 transition-transform">
                <MessageSquare className="h-6 w-6" />
                <span>{t('patient')} Messages</span>
              </Button>
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
            </CardHeader>
            <CardContent className="space-y-4">
              {doctorAppointments.map((appointment) => (
                <div key={appointment.id} className="border border-border rounded-lg p-4 space-y-3 hover:shadow-card transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-success" />
                      <span className="font-medium">{appointment.patientName}</span>
                      <Badge variant="outline" className="text-xs">
                        New {t('patient')}
                      </Badge>
                    </div>
                    <Badge variant={
                      appointment.status === 'pending' ? 'secondary' :
                      appointment.status === 'approved' ? 'default' : 'outline'
                    } className="animate-pulse-glow">
                      {t(appointment.status)}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{appointment.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{appointment.time}</span>
                    </div>
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
                        onClick={() => handleApproveAppointment(appointment.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {t('approve')}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        className="hover:scale-105 transition-transform"
                        onClick={() => handleRejectAppointment(appointment.id)}
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
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Add {t('prescriptions')}</CardTitle>
              <CardDescription>Create prescription for your patients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">{t('patient')}</label>
                <Input
                  placeholder={`Enter ${t('patient')} ${t('name')} or ID`}
                  value={prescriptionForm.patientId}
                  onChange={(e) => setPrescriptionForm(prev => ({ ...prev, patientId: e.target.value }))}
                  className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                />
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

              <Button onClick={handleAddPrescription} variant="medical" className="w-full hover:scale-105 transition-transform">
                <FileText className="h-4 w-4 mr-2" />
                Add {t('prescriptions')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consultations" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>{t('videoAudioConsultations')}</CardTitle>
              <CardDescription>{t('manageConsultations')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border border-border rounded-lg p-4 space-y-2 hover:shadow-card transition-shadow">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                    <span className="font-medium">{t('availableForConsultations')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Patients can book video/audio calls with you
                  </p>
                  <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
                    Go Offline
                  </Button>
                </div>

                <div className="border border-border rounded-lg p-4 space-y-2 hover:shadow-card transition-shadow">
                  <div className="text-lg font-semibold">{t('nextConsultation')}</div>
                  <div className="text-sm text-muted-foreground">
                    Krishna - 10:00 AM Today
                  </div>
                  <Button variant="medical" size="sm" className="hover:scale-105 transition-transform">
                    <div className="flex items-center space-x-1 mr-1">
                      <Video className="h-3 w-3" />
                      <AudioLines className="h-3 w-3" />
                    </div>
                    {t('joinCall')}
                  </Button>
                </div>
              </div>

              <div className="bg-gradient-subtle p-4 rounded-lg border border-border">
                <h4 className="font-medium mb-2">{t('callFeatures')}</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• {t('highQualityVideoAudio')}</li>
                  <li>• {t('screenSharing')}</li>
                  <li>• {t('callRecording')}</li>
                  <li>• {t('secureHipaaCompliant')}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorDashboard;