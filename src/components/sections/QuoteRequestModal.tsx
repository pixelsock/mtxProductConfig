import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Loader2 } from 'lucide-react';
import { useQuote } from '../../hooks/useQuote';
import type { ProductConfiguration } from '../../services/types/ServiceTypes';

interface CustomerInfo {
  name: string;
  email: string;
  company: string;
  phone: string;
  notes: string;
}

interface QuoteRequestModalProps {
  getConfigDescription: (config: ProductConfiguration) => string;
}

export const QuoteRequestModal: React.FC<QuoteRequestModalProps> = ({
  getConfigDescription
}) => {
  const { 
    quoteItems, 
    showQuoteForm, 
    hideQuote, 
    exportQuote, 
    hasItems 
  } = useQuote();
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    company: '',
    phone: '',
    notes: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleInputChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerInfo.name || !customerInfo.email) {
      setSubmitError('Name and email are required');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await exportQuote(customerInfo);
      
      if (result.success) {
        // Quote exported successfully
        hideQuote();
        // Reset form
        setCustomerInfo({
          name: '',
          email: '',
          company: '',
          phone: '',
          notes: ''
        });
      } else {
        setSubmitError(result.error || 'Failed to submit quote request');
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit quote request');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showQuoteForm) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Quote</h2>

          {!hasItems ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-6">
                No items in quote. Please add some configurations first.
              </p>
              <Button onClick={hideQuote} variant="outline">
                Close
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Quote Summary */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quote Summary</h3>
                <div className="space-y-3">
                  {quoteItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <span className="font-medium text-gray-900">
                          {getConfigDescription(item)}
                        </span>
                        <span className="text-gray-600 ml-2">(x{item.quantity})</span>
                      </div>
                      <Badge variant="secondary">Item {index + 1}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-8" />

              {/* Customer Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-gray-700">
                      Name *
                    </Label>
                    <Input
                      id="customerName"
                      value={customerInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="bg-gray-50 border-gray-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail" className="text-gray-700">
                      Email *
                    </Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-gray-50 border-gray-200"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerCompany" className="text-gray-700">
                      Company
                    </Label>
                    <Input
                      id="customerCompany"
                      value={customerInfo.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone" className="text-gray-700">
                      Phone
                    </Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="bg-gray-50 border-gray-200"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerNotes" className="text-gray-700">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="customerNotes"
                    value={customerInfo.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    className="bg-gray-50 border-gray-200"
                    rows={4}
                    placeholder="Any additional requirements or notes..."
                  />
                </div>
              </div>

              {/* Error Display */}
              {submitError && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{submitError}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={hideQuote}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !customerInfo.name || !customerInfo.email}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Quote Request'
                  )}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
};