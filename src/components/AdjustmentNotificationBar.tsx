/**
 * AdjustmentNotificationBar Component
 *
 * Displays notifications when selections are automatically adjusted
 * due to dynamic filtering changes.
 */

import React, { useEffect, useState } from 'react';
import { useConfiguratorStore } from '../store';
import { AdjustmentNotification } from '../store/types';

const AdjustmentNotificationBar: React.FC = () => {
  const adjustmentNotifications = useConfiguratorStore(
    (state) => state.adjustmentNotifications
  );
  const clearAdjustmentNotifications = useConfiguratorStore(
    (state) => state.clearAdjustmentNotifications
  );

  const [visibleNotifications, setVisibleNotifications] = useState<AdjustmentNotification[]>([]);

  // Show new notifications with a delay for stacking effect
  useEffect(() => {
    if (adjustmentNotifications.length > visibleNotifications.length) {
      const newNotifications = adjustmentNotifications.slice(visibleNotifications.length);

      newNotifications.forEach((notification, index) => {
        setTimeout(() => {
          setVisibleNotifications((prev) => [...prev, notification]);
        }, index * 150); // 150ms delay between each notification
      });
    } else if (adjustmentNotifications.length === 0) {
      setVisibleNotifications([]);
    }
  }, [adjustmentNotifications, visibleNotifications.length]);

  // Auto-hide notifications after 4 seconds
  useEffect(() => {
    if (visibleNotifications.length > 0) {
      const timer = setTimeout(() => {
        clearAdjustmentNotifications();
        setVisibleNotifications([]);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visibleNotifications, clearAdjustmentNotifications]);

  if (visibleNotifications.length === 0) {
    return null;
  }

  const getFieldDisplayName = (field: string): string => {
    const fieldNames: Record<string, string> = {
      mirrorStyle: 'Mirror Style',
      frameColor: 'Frame Color',
      frameThickness: 'Frame Thickness',
      mounting: 'Mounting',
      lighting: 'Lighting Direction',
      colorTemperature: 'Color Temperature',
      lightOutput: 'Light Output',
      driver: 'Driver',
    };
    return fieldNames[field] || field;
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visibleNotifications.map((notification, index) => (
        <div
          key={`adjustment-${notification.timestamp}-${index}`}
          className="bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg max-w-sm animate-slide-in-right"
        >
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-blue-800">
                Selection Adjusted
              </p>
              <p className="mt-1 text-sm text-blue-600">
                <span className="font-medium">
                  {getFieldDisplayName(notification.field)}
                </span>{' '}
                was automatically changed to maintain compatibility with your other selections.
              </p>
              <div className="mt-2 text-xs text-blue-500">
                <span className="line-through opacity-75">{notification.oldValue}</span>
                {' → '}
                <span className="font-medium">{notification.newValue}</span>
              </div>
            </div>
            <button
              onClick={() => {
                clearAdjustmentNotifications();
                setVisibleNotifications([]);
              }}
              className="flex-shrink-0 ml-2 text-blue-400 hover:text-blue-600"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdjustmentNotificationBar;