/**
 * Performance Monitor Component
 * 
 * A comprehensive dashboard component for monitoring application performance,
 * Core Web Vitals, component render times, and network performance.
 */

import React, { useState, useEffect } from 'react';
import {
  usePerformanceMetrics,
  useWebVitals,
  useNetworkPerformance,
  usePerformanceBudgets,
  useMemoryMonitoring,
  usePerformanceAlerts
} from '../../hooks/usePerformanceMonitoring';
import './PerformanceMonitor.css';

interface PerformanceMonitorProps {
  isVisible: boolean;
  onClose: () => void;
  compact?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isVisible,
  onClose,
  compact = false
}) => {
  const [activeTab, setActiveTab] = useState<'vitals' | 'components' | 'network' | 'budgets' | 'alerts'>('vitals');
  const { vitals, getVitalStatus } = useWebVitals();
  const { metrics, componentMetrics, clearMetrics } = usePerformanceMetrics();
  const { networkMetrics, averageResponseTime, slowRequests, failedRequests } = useNetworkPerformance();
  const { budgets, violations, hasBudgetViolations } = usePerformanceBudgets();
  const memoryInfo = useMemoryMonitoring();
  const { alerts, dismissAlert, clearAlerts } = usePerformanceAlerts();

  if (!isVisible) {return null;}

  const formatTime = (time: number): string => {
    if (time < 1000) {return `${time.toFixed(1)}ms`;}
    return `${(time / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes < 1024) {return `${bytes}B`;}
    if (bytes < 1024 * 1024) {return `${(bytes / 1024).toFixed(1)}KB`;}
    return `${(bytes / 1024 / 1024).toFixed(1)}MB`;
  };

  const getStatusColor = (status: 'good' | 'needs-improvement' | 'poor'): string => {
    switch (status) {
      case 'good': return '#16a34a';
      case 'needs-improvement': return '#ea580c';
      case 'poor': return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <div className={`performance-monitor ${compact ? 'performance-monitor--compact' : ''}`}>
      <div className="performance-monitor__header">
        <h3>Performance Monitor</h3>
        <div className="performance-monitor__controls">
          <button
            onClick={clearMetrics}
            className="performance-monitor__button performance-monitor__button--secondary"
            title="Clear all metrics"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="performance-monitor__button performance-monitor__button--close"
            title="Close performance monitor"
          >
            ×
          </button>
        </div>
      </div>

      <div className="performance-monitor__tabs">
        <button
          className={`performance-monitor__tab ${activeTab === 'vitals' ? 'performance-monitor__tab--active' : ''}`}
          onClick={() => setActiveTab('vitals')}
        >
          Web Vitals
        </button>
        <button
          className={`performance-monitor__tab ${activeTab === 'components' ? 'performance-monitor__tab--active' : ''}`}
          onClick={() => setActiveTab('components')}
        >
          Components
        </button>
        <button
          className={`performance-monitor__tab ${activeTab === 'network' ? 'performance-monitor__tab--active' : ''}`}
          onClick={() => setActiveTab('network')}
        >
          Network
        </button>
        <button
          className={`performance-monitor__tab ${activeTab === 'budgets' ? 'performance-monitor__tab--active' : ''}`}
          onClick={() => setActiveTab('budgets')}
        >
          Budgets {hasBudgetViolations && <span className="performance-monitor__badge">!</span>}
        </button>
        <button
          className={`performance-monitor__tab ${activeTab === 'alerts' ? 'performance-monitor__tab--active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          Alerts {alerts.length > 0 && <span className="performance-monitor__badge">{alerts.length}</span>}
        </button>
      </div>

      <div className="performance-monitor__content">
        {/* Web Vitals Tab */}
        {activeTab === 'vitals' && (
          <div className="performance-monitor__tab-content">
            <div className="performance-monitor__section">
              <h4>Core Web Vitals</h4>
              <div className="performance-monitor__metrics-grid">
                <div className="performance-monitor__metric">
                  <div className="performance-monitor__metric-label">LCP</div>
                  <div 
                    className="performance-monitor__metric-value"
                    style={{ color: getStatusColor(getVitalStatus('LCP', vitals.LCP)) }}
                  >
                    {vitals.LCP ? formatTime(vitals.LCP) : 'N/A'}
                  </div>
                  <div className="performance-monitor__metric-description">Largest Contentful Paint</div>
                </div>

                <div className="performance-monitor__metric">
                  <div className="performance-monitor__metric-label">FID</div>
                  <div 
                    className="performance-monitor__metric-value"
                    style={{ color: getStatusColor(getVitalStatus('FID', vitals.FID)) }}
                  >
                    {vitals.FID ? formatTime(vitals.FID) : 'N/A'}
                  </div>
                  <div className="performance-monitor__metric-description">First Input Delay</div>
                </div>

                <div className="performance-monitor__metric">
                  <div className="performance-monitor__metric-label">CLS</div>
                  <div 
                    className="performance-monitor__metric-value"
                    style={{ color: getStatusColor(getVitalStatus('CLS', vitals.CLS)) }}
                  >
                    {vitals.CLS ? vitals.CLS.toFixed(3) : 'N/A'}
                  </div>
                  <div className="performance-monitor__metric-description">Cumulative Layout Shift</div>
                </div>

                <div className="performance-monitor__metric">
                  <div className="performance-monitor__metric-label">FCP</div>
                  <div 
                    className="performance-monitor__metric-value"
                    style={{ color: getStatusColor(getVitalStatus('FCP', vitals.FCP)) }}
                  >
                    {vitals.FCP ? formatTime(vitals.FCP) : 'N/A'}
                  </div>
                  <div className="performance-monitor__metric-description">First Contentful Paint</div>
                </div>

                <div className="performance-monitor__metric">
                  <div className="performance-monitor__metric-label">TTFB</div>
                  <div 
                    className="performance-monitor__metric-value"
                    style={{ color: getStatusColor(getVitalStatus('TTFB', vitals.TTFB)) }}
                  >
                    {vitals.TTFB ? formatTime(vitals.TTFB) : 'N/A'}
                  </div>
                  <div className="performance-monitor__metric-description">Time to First Byte</div>
                </div>
              </div>
            </div>

            {/* Memory Usage */}
            {memoryInfo && (
              <div className="performance-monitor__section">
                <h4>Memory Usage</h4>
                <div className="performance-monitor__memory">
                  <div className="performance-monitor__memory-bar">
                    <div 
                      className="performance-monitor__memory-fill"
                      style={{ 
                        width: `${memoryInfo.usage}%`,
                        backgroundColor: memoryInfo.usage > 80 ? '#dc2626' : memoryInfo.usage > 60 ? '#ea580c' : '#16a34a'
                      }}
                    />
                  </div>
                  <div className="performance-monitor__memory-info">
                    <span>Used: {formatBytes(memoryInfo.usedJSHeapSize)}</span>
                    <span>Total: {formatBytes(memoryInfo.totalJSHeapSize)}</span>
                    <span>Limit: {formatBytes(memoryInfo.jsHeapSizeLimit)}</span>
                    <span>Usage: {memoryInfo.usage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Components Tab */}
        {activeTab === 'components' && (
          <div className="performance-monitor__tab-content">
            <div className="performance-monitor__section">
              <h4>Component Performance</h4>
              <div className="performance-monitor__table">
                <div className="performance-monitor__table-header">
                  <div>Component</div>
                  <div>Renders</div>
                  <div>Last Render</div>
                  <div>Average</div>
                  <div>Total</div>
                </div>
                {componentMetrics.slice(0, compact ? 5 : 10).map((component) => (
                  <div key={component.componentName} className="performance-monitor__table-row">
                    <div>{component.componentName}</div>
                    <div>{component.updateCount}</div>
                    <div style={{ color: component.lastRenderTime > 16 ? '#ea580c' : '#16a34a' }}>
                      {formatTime(component.lastRenderTime)}
                    </div>
                    <div>{formatTime(component.averageRenderTime)}</div>
                    <div>{formatTime(component.totalRenderTime)}</div>
                  </div>
                ))}
                {componentMetrics.length === 0 && (
                  <div className="performance-monitor__empty">No component metrics available</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Network Tab */}
        {activeTab === 'network' && (
          <div className="performance-monitor__tab-content">
            <div className="performance-monitor__section">
              <h4>Network Performance</h4>
              <div className="performance-monitor__metrics-grid">
                <div className="performance-monitor__metric">
                  <div className="performance-monitor__metric-label">Avg Response</div>
                  <div className="performance-monitor__metric-value">
                    {formatTime(averageResponseTime)}
                  </div>
                </div>
                <div className="performance-monitor__metric">
                  <div className="performance-monitor__metric-label">Slow Requests</div>
                  <div className="performance-monitor__metric-value" style={{ color: slowRequests.length > 0 ? '#ea580c' : '#16a34a' }}>
                    {slowRequests.length}
                  </div>
                </div>
                <div className="performance-monitor__metric">
                  <div className="performance-monitor__metric-label">Failed Requests</div>
                  <div className="performance-monitor__metric-value" style={{ color: failedRequests.length > 0 ? '#dc2626' : '#16a34a' }}>
                    {failedRequests.length}
                  </div>
                </div>
              </div>
            </div>

            <div className="performance-monitor__section">
              <h4>Recent Requests</h4>
              <div className="performance-monitor__table">
                <div className="performance-monitor__table-header">
                  <div>URL</div>
                  <div>Method</div>
                  <div>Duration</div>
                  <div>Status</div>
                </div>
                {networkMetrics.slice(-10).reverse().map((request, index) => (
                  <div key={index} className="performance-monitor__table-row">
                    <div title={request.url}>
                      {request.url.split('/').pop() || request.url}
                    </div>
                    <div>{request.method}</div>
                    <div style={{ color: request.duration > 1000 ? '#ea580c' : '#16a34a' }}>
                      {formatTime(request.duration)}
                    </div>
                    <div style={{ color: request.status >= 400 ? '#dc2626' : '#16a34a' }}>
                      {request.status || 'N/A'}
                    </div>
                  </div>
                ))}
                {networkMetrics.length === 0 && (
                  <div className="performance-monitor__empty">No network requests recorded</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Budgets Tab */}
        {activeTab === 'budgets' && (
          <div className="performance-monitor__tab-content">
            <div className="performance-monitor__section">
              <h4>Performance Budgets</h4>
              <div className="performance-monitor__table">
                <div className="performance-monitor__table-header">
                  <div>Metric</div>
                  <div>Current</div>
                  <div>Budget</div>
                  <div>Status</div>
                </div>
                {budgets.map((budget) => (
                  <div key={budget.metric} className="performance-monitor__table-row">
                    <div>{budget.metric}</div>
                    <div>{budget.current.toFixed(budget.metric === 'CLS' ? 3 : 0)}</div>
                    <div>{budget.budget.toFixed(budget.metric === 'CLS' ? 3 : 0)}</div>
                    <div style={{ color: getStatusColor(budget.status) }}>
                      {budget.status.replace('-', ' ').toUpperCase()}
                    </div>
                  </div>
                ))}
                {budgets.length === 0 && (
                  <div className="performance-monitor__empty">No budget data available</div>
                )}
              </div>

              {violations.length > 0 && (
                <div className="performance-monitor__violations">
                  <h5>Active Violations</h5>
                  {violations.map((violation, index) => (
                    <div key={index} className="performance-monitor__violation">
                      {violation}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="performance-monitor__tab-content">
            <div className="performance-monitor__section">
              <div className="performance-monitor__section-header">
                <h4>Performance Alerts</h4>
                {alerts.length > 0 && (
                  <button
                    onClick={clearAlerts}
                    className="performance-monitor__button performance-monitor__button--secondary"
                  >
                    Clear All
                  </button>
                )}
              </div>
              
              {alerts.length > 0 ? (
                <div className="performance-monitor__alerts">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`performance-monitor__alert performance-monitor__alert--${alert.severity}`}
                    >
                      <div className="performance-monitor__alert-content">
                        <div className="performance-monitor__alert-type">{alert.type.toUpperCase()}</div>
                        <div className="performance-monitor__alert-message">{alert.message}</div>
                        <div className="performance-monitor__alert-time">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="performance-monitor__alert-dismiss"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="performance-monitor__empty">No performance alerts</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;