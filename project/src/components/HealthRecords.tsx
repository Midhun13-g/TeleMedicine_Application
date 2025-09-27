import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Heart, Thermometer, Weight, TrendingUp, TrendingDown, Minus, RefreshCw, Plus } from 'lucide-react';

interface HealthRecord {
  id: number;
  recordType: string;
  title: string;
  value: string;
  unit: string;
  status: string;
  recordDate: string;
  doctorName: string;
}

interface HealthRecordsProps {
  patientId?: string;
}

const HealthRecords: React.FC<HealthRecordsProps> = ({ patientId }) => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    recordType: '',
    title: '',
    value: '',
    unit: '',
    status: '',
    doctorName: ''
  });

  const loadHealthRecords = async () => {
    if (!patientId) return;
    
    setLoading(true);
    try {
      // For showcase: Show common demo records for all patients
      const demoRecords = [
        { id: 1, recordType: 'VITAL_SIGNS', title: 'Blood Pressure', value: '120/80', unit: 'mmHg', status: 'NORMAL', recordDate: new Date().toISOString(), doctorName: 'Dr. Smith' },
        { id: 2, recordType: 'VITAL_SIGNS', title: 'Heart Rate', value: '72', unit: 'bpm', status: 'NORMAL', recordDate: new Date(Date.now() - 86400000).toISOString(), doctorName: 'Dr. Smith' },
        { id: 3, recordType: 'VITAL_SIGNS', title: 'Body Temperature', value: '98.6', unit: '°F', status: 'NORMAL', recordDate: new Date().toISOString(), doctorName: 'Dr. Smith' },
        { id: 4, recordType: 'VITAL_SIGNS', title: 'Weight', value: '70', unit: 'kg', status: 'NORMAL', recordDate: new Date(Date.now() - 172800000).toISOString(), doctorName: 'Dr. Smith' },
        { id: 5, recordType: 'LAB_RESULTS', title: 'Blood Sugar', value: '95', unit: 'mg/dL', status: 'NORMAL', recordDate: new Date(Date.now() - 604800000).toISOString(), doctorName: 'Dr. Johnson' },
        { id: 6, recordType: 'LAB_RESULTS', title: 'Cholesterol', value: '180', unit: 'mg/dL', status: 'NORMAL', recordDate: new Date(Date.now() - 1209600000).toISOString(), doctorName: 'Dr. Johnson' },
        { id: 7, recordType: 'LAB_RESULTS', title: 'Hemoglobin', value: '14.2', unit: 'g/dL', status: 'NORMAL', recordDate: new Date(Date.now() - 1814400000).toISOString(), doctorName: 'Dr. Johnson' },
        { id: 8, recordType: 'MEDICATION', title: 'Vitamin D3', value: '1000', unit: 'IU/day', status: 'NORMAL', recordDate: new Date(Date.now() - 2592000000).toISOString(), doctorName: 'Dr. Smith' }
      ];
      setRecords(demoRecords);
    } catch (error) {
      console.error('Error loading health records:', error);
    } finally {
      setLoading(false);
    }
  };

  const addHealthRecord = async () => {
    if (!patientId || !formData.recordType || !formData.title || !formData.value) return;
    
    try {
      const response = await fetch('http://localhost:8080/api/health-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: parseInt(patientId),
          ...formData
        })
      });
      
      if (response.ok) {
        setFormData({ recordType: '', title: '', value: '', unit: '', status: '', doctorName: '' });
        setShowForm(false);
        loadHealthRecords();
      }
    } catch (error) {
      console.error('Error adding health record:', error);
    }
  };

  useEffect(() => {
    loadHealthRecords();
  }, [patientId]);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'high': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'low': return <TrendingDown className="h-4 w-4 text-blue-500" />;
      case 'normal': return <Minus className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRecordIcon = (recordType: string) => {
    switch (recordType) {
      case 'VITAL_SIGNS': return <Heart className="h-4 w-4 text-red-500" />;
      case 'LAB_RESULTS': return <Activity className="h-4 w-4 text-blue-500" />;
      case 'MEDICATION': return <Thermometer className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        Loading health records...
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground mb-2">No health records found</p>
        <p className="text-sm text-muted-foreground">Your health data will appear here after consultations</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Recent Records ({records.length})</h4>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(!showForm)} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Record
          </Button>
          <Button onClick={loadHealthRecords} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
      
      {showForm && (
        <Card className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <Select value={formData.recordType} onValueChange={(value) => setFormData({...formData, recordType: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Record Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VITAL_SIGNS">Vital Signs</SelectItem>
                <SelectItem value="LAB_RESULTS">Lab Results</SelectItem>
                <SelectItem value="MEDICATION">Medication</SelectItem>
              </SelectContent>
            </Select>
            
            <Input 
              placeholder="Title (e.g., Blood Pressure)"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
            
            <Input 
              placeholder="Value (e.g., 120/80)"
              value={formData.value}
              onChange={(e) => setFormData({...formData, value: e.target.value})}
            />
            
            <Input 
              placeholder="Unit (e.g., mmHg)"
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
            />
            
            <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NORMAL">Normal</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Input 
              placeholder="Doctor Name"
              value={formData.doctorName}
              onChange={(e) => setFormData({...formData, doctorName: e.target.value})}
            />
          </div>
          
          <div className="flex gap-2 mt-3">
            <Button onClick={addHealthRecord} size="sm">Add Record</Button>
            <Button onClick={() => setShowForm(false)} variant="outline" size="sm">Cancel</Button>
          </div>
        </Card>
      )}
      
      <div className="grid gap-3">
        {records.slice(0, 6).map((record) => (
          <div key={record.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center space-x-3">
              {getRecordIcon(record.recordType)}
              <div>
                <p className="font-medium text-sm">{record.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(record.recordDate).toLocaleDateString()} • {record.doctorName}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="text-right">
                <p className="font-medium">{record.value} {record.unit}</p>
                <Badge variant={
                  record.status.toLowerCase() === 'normal' ? 'default' :
                  record.status.toLowerCase() === 'high' ? 'destructive' :
                  record.status.toLowerCase() === 'low' ? 'secondary' : 'outline'
                } className="text-xs">
                  {record.status}
                </Badge>
              </div>
              {getStatusIcon(record.status)}
            </div>
          </div>
        ))}
      </div>
      
      {records.length > 6 && (
        <Button variant="outline" className="w-full">
          View All Records ({records.length})
        </Button>
      )}
    </div>
  );
};

export default HealthRecords;