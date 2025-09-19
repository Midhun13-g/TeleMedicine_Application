import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Bot, Search, Stethoscope, TrendingUp, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { symptomService, type SymptomResult } from '@/services/symptomService';



interface SymptomCheckerProps {
  onResultSelect?: (result: SymptomResult) => void;
}

const SymptomChecker: React.FC<SymptomCheckerProps> = ({ onResultSelect }) => {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [results, setResults] = useState<SymptomResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const commonSymptoms = symptomService.getCommonSymptoms();

  const addSymptom = () => {
    if (currentSymptom.trim() && !symptoms.includes(currentSymptom.trim().toLowerCase())) {
      setSymptoms([...symptoms, currentSymptom.trim().toLowerCase()]);
      setCurrentSymptom('');
    }
  };

  const removeSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
  };

  const addQuickSymptom = (symptom: string) => {
    if (!symptoms.includes(symptom.toLowerCase())) {
      setSymptoms([...symptoms, symptom.toLowerCase()]);
    }
  };



  const checkSymptoms = async () => {
    if (symptoms.length === 0) {
      toast({
        title: "No symptoms entered",
        description: "Please add at least one symptom to check.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const results = await symptomService.checkSymptoms(symptoms);
      setResults(results);
    } catch (error) {
      toast({
        title: "Error checking symptoms",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (score: number) => {
    if (score >= 0.7) return 'text-red-600 bg-red-50';
    if (score >= 0.4) return 'text-orange-600 bg-orange-50';
    return 'text-yellow-600 bg-yellow-50';
  };

  const getSeverityText = (score: number) => {
    if (score >= 0.7) return 'High Match';
    if (score >= 0.4) return 'Medium Match';
    return 'Low Match';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <span>AI Symptom Checker</span>
          </CardTitle>
          <CardDescription>
            Enter your symptoms to get possible condition matches. This is for informational purposes only.
          </CardDescription>
          <div className="bg-gradient-subtle p-3 rounded-lg border border-border">
            <div className="flex items-center space-x-2 mb-1">
              <AlertCircle className="h-4 w-4 text-warning" />
              <span className="font-medium text-xs">Medical Disclaimer</span>
            </div>
            <p className="text-xs text-muted-foreground">
              This tool provides general guidance only. Always consult healthcare professionals for proper diagnosis and treatment.
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Symptom Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Add Symptoms</label>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter a symptom (e.g., fever, headache)"
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSymptom()}
                className="flex-1"
              />
              <Button onClick={addSymptom} variant="outline">
                Add
              </Button>
            </div>
          </div>

          {/* Quick Symptom Buttons */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Add Common Symptoms</label>
            <div className="flex flex-wrap gap-2">
              {commonSymptoms.map((symptom) => (
                <Button
                  key={symptom}
                  variant="outline"
                  size="sm"
                  onClick={() => addQuickSymptom(symptom)}
                  disabled={symptoms.includes(symptom.toLowerCase())}
                  className="text-xs"
                >
                  {symptom.replace(/_/g, ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Selected Symptoms */}
          {symptoms.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Selected Symptoms ({symptoms.length})</label>
              <div className="flex flex-wrap gap-2">
                {symptoms.map((symptom) => (
                  <Badge key={symptom} variant="secondary" className="flex items-center space-x-1">
                    <span>{symptom.replace(/_/g, ' ')}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeSymptom(symptom)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Check Button */}
          <Button 
            onClick={checkSymptoms} 
            disabled={symptoms.length === 0 || isLoading}
            className="w-full"
            variant="medical"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Analyzing Symptoms...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Check Symptoms</span>
              </div>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Possible Conditions</span>
            </CardTitle>
            <CardDescription>
              Based on your symptoms, here are the most likely conditions. Please consult a doctor for proper diagnosis.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-3">
            {results.map((result, index) => (
              <div 
                key={index} 
                className="border border-border rounded-lg p-4 space-y-2 hover:shadow-card transition-shadow duration-200 cursor-pointer"
                onClick={() => onResultSelect?.(result)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-lg">{result.disease}</h4>
                  <Badge className={getSeverityColor(result.match_score)}>
                    {getSeverityText(result.match_score)}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>Match Score: {(result.match_score * 100).toFixed(1)}%</span>
                  <span>•</span>
                  <span>{result.matched_symptoms.length} symptoms matched</span>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">Matched Symptoms:</p>
                  <div className="flex flex-wrap gap-1">
                    {result.matched_symptoms.map((symptom, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {symptom.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {onResultSelect && (
                  <div className="pt-2">
                    <Button size="sm" variant="outline">
                      Book Appointment for {result.disease}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SymptomChecker;