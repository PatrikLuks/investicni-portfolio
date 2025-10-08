/**
 * Performance Monitor for Portfolio Manager
 * Version: 1.0.0
 * Features: FPS monitoring, memory tracking, performance metrics, bottleneck detection
 */

class PerformanceMonitor {
    constructor() {
        this.fps = 60;
        this.frameTime = 0;
        this.lastFrameTime = performance.now();
        this.frames = [];
        this.isMonitoring = false;
        this.metrics = {
            fps: [],
            memory: [],
            timing: {},
            resources: []
        };
        
        this.init();
    }

    init() {
        // Start FPS monitoring
        this.startFPSMonitoring();
        
        // Monitor page load performance
        this.monitorPageLoad();
        
        // Monitor memory (if available)
        if (performance.memory) {
            this.startMemoryMonitoring();
        }
        
        // Monitor long tasks
        this.monitorLongTasks();
        
        // Add performance UI indicator (optional)
        this.createPerformanceIndicator();
        
        console.log('✅ Performance Monitor initialized');
    }

    startFPSMonitoring() {
        this.isMonitoring = true;
        const measureFPS = (timestamp) => {
            if (!this.isMonitoring) return;
            
            this.frameTime = timestamp - this.lastFrameTime;
            this.lastFrameTime = timestamp;
            
            const currentFPS = 1000 / this.frameTime;
            this.fps = Math.round(currentFPS);
            
            this.frames.push(this.fps);
            if (this.frames.length > 60) {
                this.frames.shift();
            }
            
            // Calculate average FPS
            const avgFPS = Math.round(
                this.frames.reduce((a, b) => a + b, 0) / this.frames.length
            );
            
            // Update UI indicator
            this.updateFPSIndicator(avgFPS);
            
            // Warn if FPS drops below threshold
            if (avgFPS < 30) {
                this.handleLowFPS(avgFPS);
            }
            
            requestAnimationFrame(measureFPS);
        };
        
        requestAnimationFrame(measureFPS);
    }

    stopFPSMonitoring() {
        this.isMonitoring = false;
    }

    monitorPageLoad() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                
                if (perfData) {
                    this.metrics.timing = {
                        dns: perfData.domainLookupEnd - perfData.domainLookupStart,
                        tcp: perfData.connectEnd - perfData.connectStart,
                        request: perfData.responseStart - perfData.requestStart,
                        response: perfData.responseEnd - perfData.responseStart,
                        domProcessing: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        load: perfData.loadEventEnd - perfData.loadEventStart,
                        total: perfData.loadEventEnd - perfData.fetchStart
                    };
                    
                    console.log('📊 Page Load Performance:', this.metrics.timing);
                    
                    // Warn if page load is slow
                    if (this.metrics.timing.total > 3000) {
                        console.warn('⚠️ Slow page load detected:', this.metrics.timing.total, 'ms');
                    }
                }
                
                // Monitor resource loading
                this.monitorResources();
            }, 0);
        });
    }

    monitorResources() {
        const resources = performance.getEntriesByType('resource');
        
        resources.forEach(resource => {
            const duration = resource.duration;
            const size = resource.transferSize || 0;
            
            this.metrics.resources.push({
                name: resource.name,
                duration: Math.round(duration),
                size: Math.round(size / 1024), // KB
                type: resource.initiatorType
            });
            
            // Warn about slow resources
            if (duration > 1000) {
                console.warn(`⚠️ Slow resource load: ${resource.name} (${Math.round(duration)}ms)`);
            }
        });
    }

    startMemoryMonitoring() {
        setInterval(() => {
            if (performance.memory) {
                const memoryInfo = {
                    used: Math.round(performance.memory.usedJSHeapSize / 1048576), // MB
                    total: Math.round(performance.memory.totalJSHeapSize / 1048576), // MB
                    limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576), // MB
                    timestamp: Date.now()
                };
                
                this.metrics.memory.push(memoryInfo);
                
                // Keep only last 100 measurements
                if (this.metrics.memory.length > 100) {
                    this.metrics.memory.shift();
                }
                
                // Warn if memory usage is high
                const usagePercent = (memoryInfo.used / memoryInfo.limit) * 100;
                if (usagePercent > 80) {
                    console.warn(`⚠️ High memory usage: ${usagePercent.toFixed(1)}%`);
                }
            }
        }, 5000); // Check every 5 seconds
    }

    monitorLongTasks() {
        if ('PerformanceObserver' in window) {
            try {
                const observer = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        console.warn(`⚠️ Long task detected: ${Math.round(entry.duration)}ms`);
                        
                        // Show warning if task blocks for too long
                        if (entry.duration > 100) {
                            this.handleLongTask(entry);
                        }
                    }
                });
                
                observer.observe({ entryTypes: ['longtask'] });
            } catch (e) {
                console.log('Long task monitoring not supported');
            }
        }
    }

    handleLowFPS(fps) {
        console.warn(`⚠️ Low FPS detected: ${fps}`);
        
        // Throttle chart updates
        if (typeof Chart !== 'undefined') {
            Chart.defaults.animation.duration = 0;
        }
    }

    handleLongTask(entry) {
        // Suggest optimization if same task happens repeatedly
        if (typeof showToast === 'function' && entry.duration > 500) {
            showToast('warning', 'Výkonnostní problém', 
                'Aplikace zpracovává velké množství dat. Zkuste zmenšit portfolio.', 3000);
        }
    }

    createPerformanceIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'performance-indicator';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 11px;
            z-index: 9999;
            display: none;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        
        indicator.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span id="fps-value">60</span> FPS
                <span id="fps-indicator" style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e;"></span>
            </div>
        `;
        
        document.body.appendChild(indicator);
        
        // Toggle with Ctrl+Shift+P
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'P') {
                const display = indicator.style.display === 'none' ? 'block' : 'none';
                indicator.style.display = display;
                console.log(`Performance indicator ${display === 'block' ? 'shown' : 'hidden'}`);
            }
        });
    }

    updateFPSIndicator(fps) {
        const fpsValue = document.getElementById('fps-value');
        const fpsIndicator = document.getElementById('fps-indicator');
        
        if (fpsValue && fpsIndicator) {
            fpsValue.textContent = fps;
            
            // Color based on performance
            if (fps >= 50) {
                fpsIndicator.style.background = '#22c55e'; // Green
            } else if (fps >= 30) {
                fpsIndicator.style.background = '#eab308'; // Yellow
            } else {
                fpsIndicator.style.background = '#ef4444'; // Red
            }
        }
    }

    getReport() {
        const avgFPS = this.frames.length > 0
            ? Math.round(this.frames.reduce((a, b) => a + b, 0) / this.frames.length)
            : 60;
        
        const currentMemory = performance.memory ? {
            used: Math.round(performance.memory.usedJSHeapSize / 1048576),
            limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576)
        } : null;
        
        return {
            fps: {
                current: this.fps,
                average: avgFPS,
                samples: this.frames.length
            },
            memory: currentMemory,
            timing: this.metrics.timing,
            slowResources: this.metrics.resources.filter(r => r.duration > 500),
            timestamp: new Date().toISOString()
        };
    }

    exportReport() {
        const report = this.getReport();
        const blob = new Blob([JSON.stringify(report, null, 2)], 
            { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-report-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('✅ Performance report exported');
    }

    // Debounce helper for performance
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle helper for performance
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}

// Initialize performance monitor globally
window.performanceMonitor = new PerformanceMonitor();

// Export helpers
window.debounce = PerformanceMonitor.debounce;
window.throttle = PerformanceMonitor.throttle;

console.log('✅ Performance Monitor module loaded');
console.log('💡 Press Ctrl+Shift+P to toggle FPS indicator');
