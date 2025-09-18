import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ConfigurationOption } from './ConfigurationOption';
import { Plus } from 'lucide-react';

interface ProductConfigurationProps {
  selectedProduct: string;
  configuration: any;
  onUpdateConfiguration: (key: string, value: any) => void;
  onAddToQuote: () => void;
}

export function ProductConfiguration({
  selectedProduct,
  configuration,
  onUpdateConfiguration,
  onAddToQuote
}: ProductConfigurationProps) {
  const frameOptions = [
    { id: 'black-frame', name: 'Black Frame', sku: 'BF-001' },
    { id: 'white-frame', name: 'White Frame', sku: 'WF-001' },
    { id: 'silver-frame', name: 'Silver Frame', sku: 'SF-001' },
    { id: 'gold-frame', name: 'Gold Frame', sku: 'GF-001' }
  ];

  const mirrorOptions = [
    { id: 'standard', name: 'Standard Glass', sku: 'SG-001' },
    { id: 'anti-fog', name: 'Anti-Fog Glass', sku: 'AG-001' },
    { id: 'low-iron', name: 'Low Iron Glass', sku: 'LG-001' }
  ];

  const lightColors = [
    { id: 'warm-white', name: 'Warm White', color: '#FFF8DC', sku: 'WW-001' },
    { id: 'cool-white', name: 'Cool White', color: '#F0F8FF', sku: 'CW-001' },
    { id: 'daylight', name: 'Daylight', color: '#FFFAFA', sku: 'DL-001' },
    { id: 'rgb', name: 'RGB Color', color: 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)', sku: 'RGB-001' }
  ];

  const sizeOptions = [
    { id: '18x24', name: '18" × 24"', sku: 'S1824' },
    { id: '24x32', name: '24" × 32"', sku: 'S2432' },
    { id: '30x40', name: '30" × 40"', sku: 'S3040' },
    { id: '36x48', name: '36" × 48"', sku: 'S3648' }
  ];

  const mountingOptions = [
    { id: 'wall-mount', name: 'Wall Mount', sku: 'WM-001' },
    { id: 'flush-mount', name: 'Flush Mount', sku: 'FM-001' },
    { id: 'recessed', name: 'Recessed Mount', sku: 'RM-001' }
  ];

  return (
    <div className="space-y-12">
      {/* Product Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Future Dots Mirror Collection
        </h1>
        <p className="text-gray-600 leading-relaxed mb-6">
          Experience the perfect blend of functionality and style with our Future Dots Mirror Collection. 
          Each mirror features advanced LED technology, premium materials, and customizable options to 
          create the perfect lighting solution for any space.
        </p>

        {/* Current Configuration Summary */}
        <Card className="bg-gray-50 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Current Configuration</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <span className="text-sm text-gray-600">Frame Style:</span>
              <p className="font-medium">{configuration.frameStyle.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Size:</span>
              <p className="font-medium">{configuration.useCustomSize ? `${configuration.customWidth}" × ${configuration.customHeight}"` : configuration.size.replace('x', '" × "') + '"'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Light Color:</span>
              <p className="font-medium">{configuration.lightColor.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Mounting:</span>
              <p className="font-medium">{configuration.mounting.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            </div>
          </div>
          <Button 
            className="w-full bg-amber-500 hover:bg-amber-600 text-white"
            onClick={onAddToQuote}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to Quote - $1,299
          </Button>
        </Card>
      </div>

      {/* Frame Style */}
      <ConfigurationOption
        title="Frame Style"
        description="Choose your preferred frame finish"
        type="grid"
        options={frameOptions}
        selected={configuration.frameStyle}
        onSelect={(value) => onUpdateConfiguration('frameStyle', value)}
        columns={2}
      />

      {/* Mirror Glass */}
      <ConfigurationOption
        title="Mirror Glass"
        description="Select the type of mirror glass"
        type="single"
        options={mirrorOptions}
        selected={configuration.mirrorGlass}
        onSelect={(value) => onUpdateConfiguration('mirrorGlass', value)}
      />

      {/* Light Color */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Light Color</h3>
        <p className="text-gray-600 mb-4">Choose your preferred lighting color temperature</p>
        <div className="grid grid-cols-2 gap-4">
          {lightColors.map((option) => (
            <button
              key={option.id}
              onClick={() => onUpdateConfiguration('lightColor', option.id)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${
                configuration.lightColor === option.id
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-gray-200"
                  style={{ background: option.color }}
                />
                <span className="font-medium">{option.name}</span>
              </div>
              <Badge variant="secondary" className="text-xs">{option.sku}</Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Size Selection */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Size</h3>
        <p className="text-gray-600 mb-4">Choose from standard sizes or specify custom dimensions</p>
        
        <div className="space-y-4">
          {!configuration.useCustomSize && (
            <div className="grid grid-cols-2 gap-4">
              {sizeOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onUpdateConfiguration('size', option.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    configuration.size === option.id
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium mb-1">{option.name}</p>
                  <Badge variant="secondary" className="text-xs">{option.sku}</Badge>
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-2 py-2">
            <Switch
              checked={configuration.useCustomSize}
              onCheckedChange={(checked) => onUpdateConfiguration('useCustomSize', checked)}
            />
            <Label>Use custom size</Label>
          </div>

          {configuration.useCustomSize && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="customWidth">Width (inches)</Label>
                <Input
                  id="customWidth"
                  type="number"
                  placeholder="24"
                  value={configuration.customWidth}
                  onChange={(e) => onUpdateConfiguration('customWidth', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="customHeight">Height (inches)</Label>
                <Input
                  id="customHeight"
                  type="number"
                  placeholder="32"
                  value={configuration.customHeight}
                  onChange={(e) => onUpdateConfiguration('customHeight', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mounting Options */}
      <ConfigurationOption
        title="Mounting Style"
        description="Choose how you want to mount your mirror"
        type="single"
        options={mountingOptions}
        selected={configuration.mounting}
        onSelect={(value) => onUpdateConfiguration('mounting', value)}
      />

      {/* Advanced Features */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Advanced Features</h3>
        <p className="text-gray-600 mb-4">Additional functionality options</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Dimmable Lighting</p>
              <p className="text-sm text-gray-600">Adjustable brightness control</p>
            </div>
            <Switch
              checked={configuration.dimming === 'dimmable'}
              onCheckedChange={(checked) => 
                onUpdateConfiguration('dimming', checked ? 'dimmable' : 'fixed')
              }
            />
          </div>
          
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Motion Sensor</p>
              <p className="text-sm text-gray-600">Automatic on/off detection</p>
            </div>
            <Switch
              checked={configuration.motionSensor || false}
              onCheckedChange={(checked) => 
                onUpdateConfiguration('motionSensor', checked)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}