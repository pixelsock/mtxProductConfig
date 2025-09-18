import React from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, Info, Wifi, WifiOff } from 'lucide-react';

interface StatusAlertProps {
  type: 'system' | 'demo' | 'connection' | 'success';
}

export function StatusAlert({ type }: StatusAlertProps) {
  const getAlertConfig = () => {
    switch (type) {
      case 'system':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          title: 'System Status: Operational',
          description: 'All systems are running normally. Configuration and quote services are available.',
          badge: { text: 'Online', color: 'bg-green-100 text-green-800' }
        };
      case 'demo':
        return {
          icon: Info,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-blue-600',
          title: 'Demo Mode Active',
          description: 'You are viewing a demonstration version of the product configurator. Some features may be limited.',
          badge: { text: 'Demo', color: 'bg-blue-100 text-blue-800' }
        };
      case 'connection':
        return {
          icon: WifiOff,
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          iconColor: 'text-orange-600',
          title: 'Connection Issues Detected',
          description: 'Some features may be unavailable. Your configurations are being saved locally.',
          badge: { text: 'Limited', color: 'bg-orange-100 text-orange-800' }
        };
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-600',
          title: 'Configuration Saved Successfully',
          description: 'Your product configuration has been saved and added to your quote.',
          badge: { text: 'Saved', color: 'bg-green-100 text-green-800' }
        };
      default:
        return null;
    }
  };

  const config = getAlertConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-4">
      <Alert className={`${config.bgColor} ${config.borderColor} border-l-4`}>
        <div className="flex items-start space-x-3">
          <Icon className={`w-5 h-5 mt-0.5 ${config.iconColor}`} />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-gray-900">{config.title}</h4>
              <Badge className={config.badge.color}>{config.badge.text}</Badge>
            </div>
            <AlertDescription className="text-gray-700">
              {config.description}
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  );
}