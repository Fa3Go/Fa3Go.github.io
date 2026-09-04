// iOS Mobile Interface JavaScript

// Update time in status bar
function updateTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('time').textContent = `${hours}:${minutes}`;
}
updateTime();
setInterval(updateTime, 60000);

// App opening and closing
let currentApp = null;

// Open app
function openApp(appId) {
    const appView = document.getElementById(appId + '-app');
    if (!appView) return;

    currentApp = appId;
    appView.classList.add('active');

    // Hide home screen
    document.getElementById('homeScreen').style.display = 'none';
}

// Close app
function closeApp() {
    if (!currentApp) return;

    const appView = document.getElementById(currentApp + '-app');
    if (appView) {
        appView.classList.remove('active');
    }

    // Show home screen
    document.getElementById('homeScreen').style.display = 'flex';
    currentApp = null;
}

// App icon click handlers
document.querySelectorAll('.app-icon[data-app]').forEach(icon => {
    icon.addEventListener('click', function() {
        const appId = this.getAttribute('data-app');
        openApp(appId);
    });
});

// Dock icon click handlers
document.querySelectorAll('.dock-icon[data-app]').forEach(icon => {
    icon.addEventListener('click', function() {
        const appId = this.getAttribute('data-app');
        openApp(appId);
    });
});

// Photo viewer
function openPhoto(src) {
    const viewer = document.getElementById('photoViewer');
    const img = document.getElementById('photoViewerImg');
    img.src = src;
    viewer.classList.add('active');
}

function closePhoto() {
    const viewer = document.getElementById('photoViewer');
    viewer.classList.remove('active');
}

// Control Center
let controlCenterOpen = false;
const controlCenter = document.getElementById('controlCenter');
let touchStartY = 0;
let touchStartX = 0;

// Detect swipe down from top-right to open control center
document.addEventListener('touchstart', function(e) {
    touchStartY = e.touches[0].clientY;
    touchStartX = e.touches[0].clientX;
}, { passive: true });

document.addEventListener('touchmove', function(e) {
    if (controlCenterOpen) return;

    const touchY = e.touches[0].clientY;
    const touchX = e.touches[0].clientX;
    const deltaY = touchY - touchStartY;
    const deltaX = touchX - touchStartX;

    // Swipe down from top-right corner (within first 60px height and right half)
    if (touchStartY < 60 && touchStartX > window.innerWidth / 2 && deltaY > 50 && Math.abs(deltaX) < 100) {
        openControlCenter();
    }
}, { passive: true });

// Swipe up to close control center
controlCenter.addEventListener('touchstart', function(e) {
    touchStartY = e.touches[0].clientY;
}, { passive: true });

controlCenter.addEventListener('touchmove', function(e) {
    const touchY = e.touches[0].clientY;
    const deltaY = touchY - touchStartY;

    if (deltaY < -50) {
        closeControlCenter();
    }
}, { passive: true });

function openControlCenter() {
    controlCenter.classList.add('active');
    controlCenterOpen = true;
}

function closeControlCenter() {
    controlCenter.classList.remove('active');
    controlCenterOpen = false;
}

// Close control center when clicking outside
controlCenter.addEventListener('click', function(e) {
    if (e.target === controlCenter) {
        closeControlCenter();
    }
});

// Swipe up from bottom to go home (close app)
let swipeStartY = 0;
let swipeStartTime = 0;

document.addEventListener('touchstart', function(e) {
    swipeStartY = e.touches[0].clientY;
    swipeStartTime = Date.now();
}, { passive: true });

document.addEventListener('touchend', function(e) {
    if (!currentApp) return;

    const swipeEndY = e.changedTouches[0].clientY;
    const swipeTime = Date.now() - swipeStartTime;
    const swipeDistance = swipeStartY - swipeEndY;

    // Swipe up from bottom (within last 100px)
    if (swipeStartY > window.innerHeight - 100 && swipeDistance > 100 && swipeTime < 500) {
        closeApp();
    }
}, { passive: true });

// Control center toggle buttons
document.querySelectorAll('.control-item').forEach(item => {
    item.addEventListener('click', function() {
        this.style.background = this.style.background === 'rgba(255, 255, 255, 0.4)'
            ? 'rgba(255, 255, 255, 0.2)'
            : 'rgba(255, 255, 255, 0.4)';
    });
});

// Prevent default touch behaviors
document.addEventListener('touchmove', function(e) {
    // Allow scrolling within app content
    if (e.target.closest('.app-content') || e.target.closest('.control-center')) {
        return;
    }
    // Prevent pull-to-refresh and overscroll
    if (e.touches.length === 1) {
        e.preventDefault();
    }
}, { passive: false });

// Disable double-tap zoom
let lastTouchEnd = 0;
document.addEventListener('touchend', function(e) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, { passive: false });

// App icon press effect
document.querySelectorAll('.app-icon, .dock-icon').forEach(icon => {
    icon.addEventListener('touchstart', function() {
        this.style.transform = 'scale(0.9)';
    }, { passive: true });

    icon.addEventListener('touchend', function() {
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 100);
    }, { passive: true });
});

// Long press on app icon (for future features like edit mode)
let longPressTimer;
document.querySelectorAll('.app-icon').forEach(icon => {
    icon.addEventListener('touchstart', function(e) {
        longPressTimer = setTimeout(() => {
            // Future: enable edit mode
            // For now, just add a subtle vibration if available
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }, 500);
    }, { passive: true });

    icon.addEventListener('touchend', function() {
        clearTimeout(longPressTimer);
    }, { passive: true });

    icon.addEventListener('touchmove', function() {
        clearTimeout(longPressTimer);
    }, { passive: true });
});

// Smooth scroll for app content
document.querySelectorAll('.app-content').forEach(content => {
    let isScrolling;
    content.addEventListener('scroll', function() {
        window.clearTimeout(isScrolling);
        isScrolling = setTimeout(function() {
            // Scroll ended
        }, 66);
    }, { passive: true });
});

// Battery status (if available)
if ('getBattery' in navigator) {
    navigator.getBattery().then(function(battery) {
        function updateBatteryStatus() {
            const batteryIcon = document.querySelector('.status-right .fa-battery-three-quarters');
            if (batteryIcon) {
                const level = Math.floor(battery.level * 100);
                if (level > 75) {
                    batteryIcon.className = 'fas fa-battery-full';
                } else if (level > 50) {
                    batteryIcon.className = 'fas fa-battery-three-quarters';
                } else if (level > 25) {
                    batteryIcon.className = 'fas fa-battery-half';
                } else if (level > 10) {
                    batteryIcon.className = 'fas fa-battery-quarter';
                } else {
                    batteryIcon.className = 'fas fa-battery-empty';
                }
            }
        }

        updateBatteryStatus();
        battery.addEventListener('levelchange', updateBatteryStatus);
        battery.addEventListener('chargingchange', updateBatteryStatus);
    });
}

// Keyboard handling for notes app
const notesTextarea = document.querySelector('.notes-textarea');
if (notesTextarea) {
    // Load saved notes from localStorage
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
        notesTextarea.value = savedNotes;
    }

    // Auto-save notes
    notesTextarea.addEventListener('input', function() {
        localStorage.setItem('notes', this.value);
    });
}

// Prevent zoom on input focus
document.querySelectorAll('input, textarea').forEach(element => {
    element.addEventListener('focus', function() {
        document.querySelector('meta[name=viewport]').setAttribute(
            'content',
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
    });

    element.addEventListener('blur', function() {
        document.querySelector('meta[name=viewport]').setAttribute(
            'content',
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
    });
});

// Add haptic feedback for iOS devices
function hapticFeedback(style = 'light') {
    if ('vibrate' in navigator) {
        switch(style) {
            case 'light':
                navigator.vibrate(10);
                break;
            case 'medium':
                navigator.vibrate(20);
                break;
            case 'heavy':
                navigator.vibrate(30);
                break;
        }
    }
}

// Add haptic to buttons
document.querySelectorAll('.back-button, .control-item, .settings-item').forEach(button => {
    button.addEventListener('click', () => hapticFeedback('light'));
});

// Orientation change handler
window.addEventListener('orientationchange', function() {
    // Adjust layout if needed
    setTimeout(function() {
        window.scrollTo(0, 0);
    }, 100);
});

// Page visibility change (save state when app goes to background)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Save current state
        if (currentApp) {
            localStorage.setItem('lastApp', currentApp);
        }
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Restore last open app if needed
    // (Commented out for better UX - always start at home)
    // const lastApp = localStorage.getItem('lastApp');
    // if (lastApp) {
    //     openApp(lastApp);
    // }

    console.log('iOS Mobile Interface Loaded');
});
