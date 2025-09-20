import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, User, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { appointmentService, type Doctor } from '@/services/appointmentService';

interface AppointmentBookingProps {
  onClose?: () => void;
  isInstant?: boolean;
}

const AppointmentBooking: React.FC<AppointmentBookingProps> = ({ onClose, isInstant = false }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const loadDoctors = async () => {
    const doctorList = await appointmentService.getDoctors();
    setDoctors(doctorList);
  };

  const loadAvailableSlots = async () => {
    if (selectedDoctor && selectedDate) {
      const slots = await appointmentService.getAvailableSlots(parseInt(selectedDoctor), selectedDate);
      setAvailableSlots(slots);
    }
  };

  const handleBooking = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime || !symptoms.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      const appointmentDate = `${selectedDate}T${selectedTime}:00`;
      
      const result = await appointmentService.bookAppointment({
        patientId: parseInt(user?.id || '0'),
        doctorId: parseInt(selectedDoctor),
        appointmentDate,
        symptoms
      });

      if (result.success) {
        toast({
          title: "Appointment Booked",
          description: isInstant ? "Instant appointment scheduled!" : "Your appointment has been scheduled successfully",
        });
        onClose?.();
      } else {
        toast({
          title: "Booking Failed",
          description: result.message || "Failed to book appointment",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getNextAvailableSlot = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    setSelectedDate(today);
    
    // For instant appointments, suggest the next available slot
    if (isInstant && availableSlots.length > 0) {
      const currentHour = now.getHours();
      const nextSlot = availableSlots.find(slot => {
        const slotHour = parseInt(slot.split(':')[0]);
        return slotHour > currentHour;
      });
      if (nextSlot) {
        setSelectedTime(nextSlot);
      }
    }
  };

  useEffect(() => {
    if (isInstant) {
      getNextAvailableSlot();
    }
  }, [isInstant, availableSlots]);

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-medical border-0 bg-card/95 backdrop-blur-sm animate-slide-up">
      <CardHeader className="text-center pb-6">
        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-4">
          {isInstant ? <Zap className="h-8 w-8 text-white animate-pulse" /> : <Calendar className="h-8 w-8 text-white" />}
        </div>
        <CardTitle className="text-2xl font-bold gradient-text">
          {isInstant ? 'Instant Appointment' : 'Book Appointment'}
        </CardTitle>
        <CardDescription className="text-lg text-muted-foreground">
          {isInstant ? 'Get immediate medical consultation' : 'Schedule your consultation with a doctor'}
        </CardDescription>
        {isInstant && (
          <div className="inline-flex items-center space-x-2 bg-warning/10 px-3 py-1 rounded-full text-warning text-sm font-medium">
            <Zap className="h-4 w-4" />
            <span>Available Now</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6 px-8 pb-8">
        <div>
          <label className="text-sm font-medium mb-3 block flex items-center space-x-2">
            <User className="h-4 w-4 text-primary" />
            <span>Select Doctor</span>
          </label>
          <Select onValueChange={setSelectedDoctor} value={selectedDoctor}>
            <SelectTrigger className="h-12 border-2 border-border/50 focus:border-primary/50 rounded-xl">
              <SelectValue placeholder="Choose a doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id.toString()} className="p-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{doctor.name}</div>
                      <div className="text-sm text-muted-foreground">{doctor.specialization}</div>
                      <div className="text-xs text-success">Available Today</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-3 block flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Date</span>
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="h-12 border-2 border-border/50 focus:border-primary/50 rounded-xl"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-3 block flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Time</span>
            </label>
            <Select onValueChange={setSelectedTime} value={selectedTime}>
              <SelectTrigger className="h-12 border-2 border-border/50 focus:border-primary/50 rounded-xl">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {availableSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{slot}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-3 block flex items-center space-x-2">
            <div className="w-4 h-4 bg-success/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-success rounded-full"></div>
            </div>
            <span>Symptoms / Reason for Visit</span>
          </label>
          <Textarea
            placeholder="Describe your symptoms or reason for consultation..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={4}
            className="border-2 border-border/50 focus:border-primary/50 rounded-xl resize-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
          <Button 
            onClick={handleBooking} 
            disabled={loading}
            className={`flex-1 h-12 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg ${
              isInstant 
                ? 'bg-gradient-to-r from-warning to-warning/80 hover:from-warning/90 hover:to-warning/70' 
                : 'bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90'
            }`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Booking...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                {isInstant ? <Zap className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                <span>{isInstant ? 'Book Instant Appointment' : 'Book Appointment'}</span>
              </div>
            )}
          </Button>
          
          {onClose && (
            <Button 
              variant="outline" 
              onClick={onClose}
              className="h-12 px-6 border-2 border-border/50 hover:border-primary/50 rounded-xl transition-all duration-300 hover:scale-105"
            >
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentBooking;