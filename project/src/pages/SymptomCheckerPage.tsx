import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, User, Stethoscope, Bot, MessageSquare, History, BookOpen } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import SymptomChecker from '@/components/SymptomChecker';

interface SymptomResult {
  disease: string;
  match_score: number;
  matched_symptoms: string[];
}

interface ChatMessage {
  id: number;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
  result?: SymptomResult;
}

const SymptomCheckerPage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      type: 'bot',
      message: 'Hello! I\'m your AI health assistant. You can use the symptom checker or chat with me about your health concerns.',
      timestamp: new Date()
    }
  ]);
  const [checkHistory, setCheckHistory] = useState<SymptomResult[]>([]);

  const handleSymptomResult = (result: SymptomResult) => {
    // Add to history
    setCheckHistory(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
    
    // Add to chat
    const botMessage: ChatMessage = {
      id: Date.now(),
      type: 'bot',
      message: `Based on your symptoms, I found a ${(result.match_score * 100).toFixed(1)}% match with ${result.disease}. Would you like to book an appointment with a specialist?`,
      timestamp: new Date(),
      result
    };
    
    setChatMessages(prev => [...prev, botMessage]);
    
    toast({
      title: "Analysis Complete",
      description: `Found ${result.disease} with ${(result.match_score * 100).toFixed(1)}% match`,
    });
  };

  const bookAppointment = (condition: string) => {
    toast({
      title: "Appointment Booking",
      description: `Redirecting to book appointment for ${condition}...`,
    });
    // Here you would integrate with your appointment booking system
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Symptom Checker & Health Assistant</h1>
          <p className="text-muted-foreground mt-1">AI-powered health assessment and guidance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-primary">
            <Stethoscope className="h-3 w-3 mr-1" />
            AI Health Assistant
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="checker" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checker" className="flex items-center space-x-2">
            <Stethoscope className="h-4 w-4" />
            <span>Symptom Checker</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Health Chat</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checker" className="space-y-4">
          <SymptomChecker onResultSelect={handleSymptomResult} />
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5 text-primary" />
                <span>Health Assistant Chat</span>
              </CardTitle>
              <CardDescription>
                Chat with our AI assistant about your health concerns and symptom analysis results
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-muted/20 rounded-lg">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.type === 'user' 
                        ? 'bg-primary text-primary-foreground ml-4' 
                        : 'bg-background border border-border mr-4'
                    }`}>
                      {msg.type === 'bot' && (
                        <div className="flex items-center space-x-2 mb-1">
                          <Bot className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium text-primary">Health Assistant</span>
                        </div>
                      )}
                      <p className="text-sm">{msg.message}</p>
                      
                      {msg.result && (
                        <div className="mt-2 p-2 bg-muted/50 rounded border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">{msg.result.disease}</span>
                            <Badge variant="outline" className="text-xs">
                              {(msg.result.match_score * 100).toFixed(1)}% match
                            </Badge>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs mt-1"
                            onClick={() => bookAppointment(msg.result!.disease)}
                          >
                            <Calendar className="h-3 w-3 mr-1" />
                            Book Appointment
                          </Button>
                        </div>
                      )}
                      
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                Use the Symptom Checker tab to analyze your symptoms, and results will appear here for discussion.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5 text-primary" />
                <span>Symptom Check History</span>
              </CardTitle>
              <CardDescription>
                Your recent symptom analysis results and health assessments
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {checkHistory.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No symptom checks yet</p>
                  <p className="text-sm text-muted-foreground">Use the Symptom Checker to start analyzing your symptoms</p>
                </div>
              ) : (
                checkHistory.map((result, index) => (
                  <div key={index} className="border border-border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{result.disease}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          {(result.match_score * 100).toFixed(1)}% match
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Recent
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Matched {result.matched_symptoms.length} symptoms: {result.matched_symptoms.slice(0, 3).join(', ')}
                      {result.matched_symptoms.length > 3 && '...'}
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        Book Appointment
                      </Button>
                      <Button size="sm" variant="ghost">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SymptomCheckerPage;