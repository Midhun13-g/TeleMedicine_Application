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
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {isInstant ? <Zap className="h-5 w-5 text-warning" /> : <Calendar className="h-5 w-5 text-primary" />}
          <span>{isInstant ? 'Instant Appointment' : 'Book Appointment'}</span>
        </CardTitle>
        <CardDescription>
          {isInstant ? 'Get immediate medical consultation' : 'Schedule your consultation with a doctor'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Doctor</label>
          <Select onValueChange={setSelectedDoctor} value={selectedDoctor}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id.toString()}>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{doctor.name}</div>
                      <div className="text-xs text-muted-foreground">{doctor.specialization}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Date</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Time</label>
            <Select onValueChange={setSelectedTime} value={selectedTime}>
              <SelectTrigger>
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
          <label className="text-sm font-medium mb-2 block">Symptoms / Reason for Visit</label>
          <Textarea
            placeholder="Describe your symptoms or reason for consultation..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={handleBooking} 
            disabled={loading}
            variant={isInstant ? "warning" : "medical"}
            className="flex-1"
          >
            {loading ? 'Booking...' : (isInstant ? 'Book Instant Appointment' : 'Book Appointment')}
          </Button>
          
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppointmentBooking;