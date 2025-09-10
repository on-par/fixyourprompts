/**
 * Performance Widget Component
 * 
 * A compact floating widget for quick performance monitoring during development.
 * Shows key metrics and provides quick access to the full performance monitor.
 */

import React, { useState, useCallback } from 'react';
import { useWebVitals, usePerformanceAlerts, useMemoryMonitoring } from '../../hooks/usePerformanceMonitoring';
import { PerformanceMonitor } from '../PerformanceMonitor';
import './PerformanceWidget.css';

interface PerformanceWidgetProps {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showInProduction?: boolean;
}

const PerformanceWidget: React.FC<PerformanceWidgetProps> = ({
  position = 'bottom-right',
  showInProduction = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFullMonitor, setShowFullMonitor] = useState(false);
  const { vitals, getVitalStatus } = useWebVitals();
  const { alerts } = usePerformanceAlerts();
  const memoryInfo = useMemoryMonitoring();

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const handleShowFullMonitor = useCallback(() => {
    setShowFullMonitor(true);
    setIsExpanded(false);
  }, []);

  const handleCloseFullMonitor = useCallback(() => {
    setShowFullMonitor(false);
  }, []);

  // Hide widget in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  const formatTime = (time: number): string => {
    if (time < 1000) {return `${time.toFixed(0)}ms`;}
    return `${(time / 1000).toFixed(1)}s`;
  };

  const getWorstVitalStatus = (): 'good' | 'needs-improvement' | 'poor' => {
    const statuses = Object.entries(vitals).map(([key, value]) => 
      getVitalStatus(key as keyof typeof vitals, value)
    );
    
    if (statuses.includes('poor')) {return 'poor';}
    if (statuses.includes('needs-improvement')) {return 'needs-improvement';}
    return 'good';
  };

  const getStatusColor = (status: 'good' | 'needs-improvement' | 'poor'): string => {
    switch (status) {
      case 'good': return '#16a34a';
      case 'needs-improvement': return '#ea580c';
      case 'poor': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const overallStatus = getWorstVitalStatus();
  const hasAlerts = alerts.length > 0;
  const hasMemoryWarning = memoryInfo && memoryInfo.usage > 80;

  return (
    <>
      <div className={`performance-widget performance-widget--${position}`}>
        {/* Collapsed State */}
        {!isExpanded && (
          <div className="performance-widget__collapsed" onClick={handleToggleExpanded}>
            <div 
              className="performance-widget__status-indicator"
              style={{ backgroundColor: getStatusColor(overallStatus) }}
            />
            {(hasAlerts || hasMemoryWarning) && (
              <div className="performance-widget__alert-badge">!</div>
            )}
            <div className="performance-widget__icon">⚡</div>
          </div>
        )}

        {/* Expanded State */}
        {isExpanded && (
          <div className="performance-widget__expanded">
            <div className="performance-widget__header">
              <div className="performance-widget__title">Performance</div>
              <div className="performance-widget__controls">
                <button
                  className="performance-widget__control-button"
                  onClick={handleShowFullMonitor}
                  title="Open full monitor"
                >
                  📊
                </button>
                <button
                  className="performance-widget__control-button"
                  onClick={handleToggleExpanded}
                  title="Close widget"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="performance-widget__content">
              {/* Core Web Vitals Summary */}
              <div className="performance-widget__section">
                <div className="performance-widget__section-title">Web Vitals</div>
                <div className="performance-widget__vitals">
                  <div className="performance-widget__vital">
                    <span className="performance-widget__vital-label">LCP</span>
                    <span 
                      className="performance-widget__vital-value"
                      style={{ color: getStatusColor(getVitalStatus('LCP', vitals.LCP)) }}
                    >
                      {vitals.LCP ? formatTime(vitals.LCP) : 'N/A'}
                    </span>
                  </div>
                  <div className="performance-widget__vital">
                    <span className="performance-widget__vital-label">FID</span>
                    <span 
                      className="performance-widget__vital-value"
                      style={{ color: getStatusColor(getVitalStatus('FID', vitals.FID)) }}
                    >
                      {vitals.FID ? formatTime(vitals.FID) : 'N/A'}
                    </span>
                  </div>
                  <div className="performance-widget__vital">
                    <span className="performance-widget__vital-label">CLS</span>
                    <span 
                      className="performance-widget__vital-value"
                      style={{ color: getStatusColor(getVitalStatus('CLS', vitals.CLS)) }}
                    >
                      {vitals.CLS ? vitals.CLS.toFixed(3) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Memory Usage */}
              {memoryInfo && (
                <div className="performance-widget__section">
                  <div className="performance-widget__section-title">Memory</div>
                  <div className="performance-widget__memory">
                    <div className="performance-widget__memory-bar">
                      <div 
                        className="performance-widget__memory-fill"
                        style={{ 
                          width: `${memoryInfo.usage}%`,
                          backgroundColor: memoryInfo.usage > 80 ? '#dc2626' : memoryInfo.usage > 60 ? '#ea580c' : '#16a34a'
                        }}
                      />
                    </div>
                    <div className="performance-widget__memory-text">
                      {memoryInfo.usage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Alerts Summary */}
              {alerts.length > 0 && (
                <div className="performance-widget__section">
                  <div className="performance-widget__section-title">
                    Alerts ({alerts.length})
                  </div>
                  <div className="performance-widget__alerts">
                    {alerts.slice(0, 3).map((alert) => (
                      <div 
                        key={alert.id} 
                        className={`performance-widget__alert performance-widget__alert--${alert.severity}`}
                      >
                        <div className="performance-widget__alert-type">
                          {alert.type.toUpperCase()}
                        </div>
                        <div className="performance-widget__alert-message">
                          {alert.message.slice(0, 50)}
                          {alert.message.length > 50 ? '...' : ''}
                        </div>
                      </div>
                    ))}
                    {alerts.length > 3 && (
                      <div className="performance-widget__more-alerts">
                        +{alerts.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* No Issues State */}
              {alerts.length === 0 && overallStatus === 'good' && (
                <div className="performance-widget__section">
                  <div className="performance-widget__all-good">
                    ✅ All systems performing well
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Full Performance Monitor */}
      <PerformanceMonitor
        isVisible={showFullMonitor}
        onClose={handleCloseFullMonitor}
        compact={false}
      />
    </>
  );
};

export default PerformanceWidget;