import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Video, Phone, MapPin, AlertCircle } from 'lucide-react';
import { Appointment } from '@/services/appointmentService';

interface AppointmentCardProps {
  appointment: Appointment;
  onReschedule?: (appointmentId: string) => void;
  onCancel?: (appointmentId: string) => void;
  onJoinCall?: (appointmentId: string) => void;
  showActions?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ 
  appointment, 
  onReschedule, 
  onCancel, 
  onJoinCall,
  showActions = true 
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'rescheduled': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConsultationIcon = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Phone className="h-4 w-4" />;
      case 'in_person': return <MapPin className="h-4 w-4" />;
      default: return <Video className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'Time not set';
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const isUpcoming = () => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    return appointmentDate > now && ['pending', 'confirmed', 'approved'].includes(appointment.status.toLowerCase());
  };

  const canJoinCall = () => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    const timeDiff = appointmentDate.getTime() - now.getTime();
    const minutesDiff = timeDiff / (1000 * 60);
    return minutesDiff <= 15 && minutesDiff >= -30 && appointment.status.toLowerCase() === 'confirmed';
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                Dr. {appointment.doctorName}
              </CardTitle>
              <p className="text-sm text-gray-600">
                {appointment.doctorSpecialization || 'General Medicine'}
              </p>
            </div>
          </div>
          <Badge className={`${getStatusColor(appointment.status)} font-medium`}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-gray-700">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {formatDate(appointment.appointmentDate)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-700">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              {formatTime(appointment.timeSlot)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-700">
            {getConsultationIcon(appointment.consultationType)}
            <span className="text-sm font-medium capitalize">
              {appointment.consultationType?.replace('_', ' ') || 'Video Call'}
            </span>
          </div>
          
          {appointment.symptoms && (
            <div className="flex items-start space-x-2 text-gray-700 md:col-span-2">
              <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <span className="text-sm font-medium block">Symptoms:</span>
                <span className="text-sm text-gray-600">{appointment.symptoms}</span>
              </div>
            </div>
          )}
        </div>
        
        {showActions && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            {canJoinCall() && onJoinCall && (
              <Button 
                onClick={() => onJoinCall(appointment.id.toString())}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Video className="h-4 w-4 mr-2" />
                Join Call
              </Button>
            )}
            
            {isUpcoming() && onReschedule && (
              <Button 
                onClick={() => onReschedule(appointment.id.toString())}
                variant="outline"
                size="sm"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Reschedule
              </Button>
            )}
            
            {isUpcoming() && onCancel && (
              <Button 
                onClick={() => onCancel(appointment.id.toString())}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AppointmentCard;
