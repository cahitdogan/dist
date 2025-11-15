/**
 * Connection Monitor
 * Continuously monitors internet connectivity and displays alerts when offline
 */

let isOnline = true;
let connectionAlert = null;
let checkInterval = null;
let wasOfflineShown = false;

// Create and show offline alert
function showOfflineAlert() {
    if (connectionAlert) return; // Alert already shown

    connectionAlert = document.createElement('div');
    connectionAlert.id = 'connection-alert';
    connectionAlert.innerHTML = `
        <i class="fa-solid fa-wifi-slash"></i>
        <strong>No Internet Connection</strong>
        <span>You are currently offline. Changes may not be saved.</span>
    `;

    document.body.appendChild(connectionAlert);

    // Trigger show immediately
    setTimeout(() => {
        connectionAlert.classList.add('show');
        wasOfflineShown = true;
    }, 10);
}

// Hide and remove offline alert
function hideOfflineAlert() {
    if (!connectionAlert) return;

    connectionAlert.classList.remove('show');

    setTimeout(() => {
        if (connectionAlert && connectionAlert.parentNode) {
            connectionAlert.parentNode.removeChild(connectionAlert);
            connectionAlert = null;
        }
    }, 400);
}

// Show brief online notification
function showOnlineNotification() {
    // Only show if we previously showed offline alert
    if (!wasOfflineShown) return;

    const notification = document.createElement('div');
    notification.id = 'connection-online';
    notification.innerHTML = `
        <i class="fa-solid fa-wifi"></i>
        <strong>Connection Restored</strong>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Auto-hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }, 3000);

    wasOfflineShown = false;
}

// Check connection by trying to fetch a small resource
async function checkConnection() {
    // First check browser's online status
    if (!navigator.onLine) {
        return false;
    }

    try {
        // Try to fetch a small resource with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        // Try multiple endpoints to ensure we're really online
        const response = await fetch('https://www.google.com/favicon.ico?t=' + Date.now(), {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-cache',
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        return true; // If fetch completes without error, we're online
    } catch (error) {
        // Fetch failed, we're offline
        return false;
    }
}

// Handle connection status change
async function handleConnectionChange() {
    const actuallyOnline = await checkConnection();

    if (!actuallyOnline && isOnline) {
        // Just went offline
        isOnline = false;
        showOfflineAlert();
    } else if (actuallyOnline && !isOnline) {
        // Just came back online
        isOnline = true;
        hideOfflineAlert();
        showOnlineNotification();
    }
}

// Initialize connection monitoring
function initConnectionMonitor() {
    // Listen to browser online/offline events for instant detection
    window.addEventListener('online', handleConnectionChange);
    window.addEventListener('offline', handleConnectionChange);

    // Continuous connection check (every 3 seconds)
    checkInterval = setInterval(handleConnectionChange, 3000);

    // Initial check immediately
    handleConnectionChange();

    // Add styles
    if (!document.getElementById('connection-monitor-styles')) {
        const style = document.createElement('style');
        style.id = 'connection-monitor-styles';
        style.textContent = `
            #connection-alert {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 999999;
                background: linear-gradient(135deg, #dc3545 0%, #bd2130 100%);
                color: white;
                padding: 1.8rem 2rem;
                box-shadow: 0 4px 20px rgba(220, 53, 69, 0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 1.5rem;
                transform: translateY(-100%);
                transition: transform 0.4s ease;
                opacity: 0;
                font-family: 'Nunito Sans', sans-serif;
            }

            #connection-alert.show {
                transform: translateY(0);
                opacity: 1;
            }

            #connection-alert i {
                font-size: 2.4rem;
                animation: shake 0.5s ease-in-out infinite;
            }

            #connection-alert strong {
                font-size: 1.8rem;
                font-weight: 700;
                margin-right: 1rem;
            }

            #connection-alert span {
                font-size: 1.4rem;
                opacity: 0.95;
            }

            #connection-online {
                position: fixed;
                top: 2rem;
                right: 2rem;
                z-index: 999999;
                background: linear-gradient(135deg, #28a745 0%, #218838 100%);
                color: white;
                padding: 1.5rem 2.5rem;
                border-radius: 0.8rem;
                box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
                display: flex;
                align-items: center;
                gap: 1.2rem;
                transform: translateX(calc(100% + 3rem));
                transition: transform 0.4s ease, opacity 0.4s ease;
                opacity: 0;
                font-family: 'Nunito Sans', sans-serif;
            }

            #connection-online.show {
                transform: translateX(0);
                opacity: 1;
            }

            #connection-online i {
                font-size: 2.2rem;
            }

            #connection-online strong {
                font-size: 1.6rem;
                font-weight: 700;
            }

            @keyframes shake {
                0%, 100% {
                    transform: rotate(0deg);
                }
                25% {
                    transform: rotate(-10deg);
                }
                75% {
                    transform: rotate(10deg);
                }
            }

            @keyframes pulse-glow {
                0%, 100% {
                    box-shadow: 0 4px 20px rgba(220, 53, 69, 0.5);
                }
                50% {
                    box-shadow: 0 4px 30px rgba(220, 53, 69, 0.8);
                }
            }

            #connection-alert.show {
                animation: pulse-glow 2s ease-in-out infinite;
            }

            @media screen and (max-width: 650px) {
                #connection-alert {
                    padding: 1.5rem 1.5rem;
                    flex-direction: column;
                    gap: 1rem;
                    text-align: center;
                }

                #connection-alert i {
                    font-size: 2rem;
                }

                #connection-alert strong {
                    font-size: 1.6rem;
                    margin-right: 0;
                }

                #connection-alert span {
                    font-size: 1.3rem;
                }

                #connection-online {
                    top: 1rem;
                    right: 1rem;
                    left: 1rem;
                    padding: 1.2rem 1.5rem;
                    justify-content: center;
                }

                #connection-online i {
                    font-size: 2rem;
                }

                #connection-online strong {
                    font-size: 1.4rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (checkInterval) {
        clearInterval(checkInterval);
    }
});

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConnectionMonitor);
} else {
    initConnectionMonitor();
}
