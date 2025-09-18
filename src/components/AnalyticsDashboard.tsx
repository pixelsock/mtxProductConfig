import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { supabaseClient } from '../utils/supabase/client';
import { BarChart3, TrendingUp, Package, DollarSign, RefreshCw } from 'lucide-react';

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnalyticsDashboard({ isOpen, onClose }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await supabaseClient.getAnalytics();
      setAnalytics(response.analytics);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart3 className="w-6 h-6 mr-2" />
              Analytics Dashboard
            </h2>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAnalytics}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>

          {loading && !analytics ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-gray-400" />
                <p className="text-gray-600">Loading analytics...</p>
              </div>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Quotes</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.totalQuotes}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Configurations</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics.totalConfigurations}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <DollarSign className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Value</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${analytics.totalValue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                {analytics.recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.recentActivity.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant={item.id.startsWith('quote_') ? 'default' : 'secondary'}>
                            {item.id.startsWith('quote_') ? 'Quote' : 'Config'}
                          </Badge>
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.id.startsWith('quote_') 
                                ? `Quote from ${item.customer?.firstName || 'Unknown'} ${item.customer?.lastName || ''}`
                                : `Configuration for ${item.productType?.replace('-', ' ')}`
                              }
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(item.createdAt).toLocaleDateString()} at{' '}
                              {new Date(item.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        {item.totalValue && (
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">${item.totalValue}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-6">No recent activity</p>
                )}
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Failed to load analytics data</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={fetchAnalytics}
              >
                Try Again
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}