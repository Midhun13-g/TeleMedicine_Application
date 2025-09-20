import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Activity } from 'lucide-react';

const TestComponent = () => {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold gradient-text">Frontend Test Component</h1>
      
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-5 w-5 text-success" />
            <span>Test Card</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>If you can see this card with proper styling, the frontend is working correctly.</p>
        </CardContent>
      </Card>

      <div className="flex space-x-4">
        <Button variant="default">Default Button</Button>
        <Button variant="medical">Medical Button</Button>
        <Button variant="success">Success Button</Button>
        <Button variant="outline">Outline Button</Button>
      </div>

      <div className="bg-gradient-subtle p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-primary animate-pulse" />
          <span>Gradient background test</span>
        </div>
      </div>
    </div>
  );
};

export default TestComponent;