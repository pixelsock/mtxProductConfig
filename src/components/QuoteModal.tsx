import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card } from './ui/card';
import { X, Send } from 'lucide-react';

interface QuoteModalProps {
  quoteItems: any[];
  onClose: () => void;
  onSubmit: (customerInfo: any) => void;
  isLoading?: boolean;
}

export function QuoteModal({ quoteItems, onClose, onSubmit, isLoading = false }: QuoteModalProps) {
  const [customerInfo, setCustomerInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    projectName: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(customerInfo);
  };

  const updateField = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const totalValue = quoteItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Request Quote</DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quote Items */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quote Items ({quoteItems.length})</h3>
            <div className="space-y-4 mb-6">
              {quoteItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">
                      {item.product.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    <span className="font-semibold text-gray-900">${item.price}</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Size: {item.configuration.useCustomSize 
                      ? `${item.configuration.customWidth || 'N/A'}" × ${item.configuration.customHeight || 'N/A'}"`
                      : (item.configuration.size || 'Not specified')
                    }</p>
                    <p>Frame Color: {item.configuration.frameColor 
                      ? item.configuration.frameColor.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                      : 'Not specified'}</p>
                    <p>Light Output: {item.configuration.lightOutput 
                      ? item.configuration.lightOutput.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                      : 'Not specified'}</p>
                    <p>Color Temperature: {item.configuration.colorTemperature 
                      ? item.configuration.colorTemperature.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                      : 'Not specified'}</p>
                    <p>Mounting: {item.configuration.mounting 
                      ? item.configuration.mounting.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                      : 'Not specified'}</p>
                  </div>
                </Card>
              ))}
            </div>
            
            <Card className="p-4 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total Estimated Value:</span>
                <span className="text-xl font-bold text-gray-900">${totalValue.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Final pricing may vary based on customizations and installation requirements.
              </p>
            </Card>
          </div>

          {/* Customer Information Form */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Customer Information</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    required
                    value={customerInfo.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    required
                    value={customerInfo.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={customerInfo.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={customerInfo.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={customerInfo.projectName}
                  onChange={(e) => updateField('projectName', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  rows={4}
                  placeholder="Any specific requirements, installation details, or questions..."
                  value={customerInfo.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? 'Submitting...' : 'Submit Quote Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}