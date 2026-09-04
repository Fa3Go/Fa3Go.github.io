// Windows 11 Desktop JavaScript

// Update Clock
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    document.querySelector('.time').textContent = `${hours}:${minutes}`;
    document.querySelector('.date').textContent = `${year}/${month}/${day}`;
}
updateClock();
setInterval(updateClock, 1000);

// Start Menu Toggle
const startButton = document.getElementById('startButton');
const startMenu = document.getElementById('startMenu');
let startMenuOpen = false;

startButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleStartMenu();
});

function toggleStartMenu() {
    startMenuOpen = !startMenuOpen;
    startMenu.classList.toggle('active', startMenuOpen);
    startButton.classList.toggle('active', startMenuOpen);
}

// Close start menu when clicking outside
document.addEventListener('click', (e) => {
    if (startMenuOpen && !startMenu.contains(e.target) && e.target !== startButton) {
        toggleStartMenu();
    }
});

// Widgets Panel
const widgetButton = document.getElementById('widgetButton');
const widgetsPanel = document.getElementById('widgetsPanel');
let widgetsPanelOpen = false;

widgetButton.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleWidgets();
});

function toggleWidgets() {
    widgetsPanelOpen = !widgetsPanelOpen;
    widgetsPanel.classList.toggle('active', widgetsPanelOpen);
}

function closeWidgets() {
    widgetsPanelOpen = false;
    widgetsPanel.classList.remove('active');
}

// Close widgets when clicking outside
document.addEventListener('click', (e) => {
    if (widgetsPanelOpen && !widgetsPanel.contains(e.target) && e.target !== widgetButton) {
        closeWidgets();
    }
});

// Window Management
let activeWindows = new Map();
let zIndexCounter = 100;
let draggedWindow = null;
let dragOffset = { x: 0, y: 0 };

// Open Window
function openWindow(windowId) {
    const window = document.getElementById(windowId + '-window');
    if (!window) return;

    // Always ensure display is set to flex
    window.style.display = 'flex';
    window.classList.add('active');
    window.style.zIndex = ++zIndexCounter;

    if (!activeWindows.has(windowId)) {
        activeWindows.set(windowId, {
            minimized: false,
            maximized: false
        });
        addTaskbarApp(windowId);

        // Set initial position if not set
        if (!window.style.left) {
            const offset = (activeWindows.size - 1) * 30;
            window.style.top = (100 + offset) + 'px';
            window.style.left = (200 + offset) + 'px';
            window.style.width = '700px';
            window.style.height = '500px';
        }
    } else {
        // Window was previously opened, restore it
        const state = activeWindows.get(windowId);
        state.minimized = false;
    }

    setActiveWindow(windowId);

    // Close start menu
    if (startMenuOpen) {
        toggleStartMenu();
    }
}

// Close Window
function closeWindow(windowId) {
    const window = document.getElementById(windowId);
    window.classList.remove('active');
    window.style.display = 'none';

    const id = windowId.replace('-window', '');
    activeWindows.delete(id);
    removeTaskbarApp(id);
}

// Minimize Window
function minimizeWindow(windowId) {
    const window = document.getElementById(windowId);
    window.classList.remove('active');
    window.style.display = 'none';

    const id = windowId.replace('-window', '');
    if (activeWindows.has(id)) {
        activeWindows.get(id).minimized = true;
    }
}

// Maximize Window
function maximizeWindow(windowId) {
    const window = document.getElementById(windowId);
    const id = windowId.replace('-window', '');

    if (activeWindows.has(id)) {
        const state = activeWindows.get(id);
        state.maximized = !state.maximized;

        window.classList.toggle('maximized', state.maximized);

        if (state.maximized) {
            // Store original dimensions
            window.dataset.originalTop = window.style.top;
            window.dataset.originalLeft = window.style.left;
            window.dataset.originalWidth = window.style.width;
            window.dataset.originalHeight = window.style.height;
        } else {
            // Restore original dimensions
            window.style.top = window.dataset.originalTop;
            window.style.left = window.dataset.originalLeft;
            window.style.width = window.dataset.originalWidth;
            window.style.height = window.dataset.originalHeight;
        }
    }
}

// Set Active Window
function setActiveWindow(windowId) {
    document.querySelectorAll('.window').forEach(w => {
        w.style.zIndex = parseInt(w.style.zIndex || 100);
    });

    const window = document.getElementById(windowId + '-window');
    if (window) {
        window.style.zIndex = ++zIndexCounter;
    }

    // Update taskbar
    document.querySelectorAll('.taskbar-app').forEach(app => {
        app.classList.remove('active');
    });
    const taskbarApp = document.getElementById('taskbar-' + windowId);
    if (taskbarApp) {
        taskbarApp.classList.add('active');
    }
}

// Add Taskbar App
function addTaskbarApp(windowId) {
    const taskbarApps = document.getElementById('taskbarApps');
    const window = document.getElementById(windowId + '-window');

    const app = document.createElement('button');
    app.className = 'taskbar-app';
    app.id = 'taskbar-' + windowId;

    const icon = window.querySelector('.window-title i');
    if (icon) {
        app.innerHTML = '<i class="' + icon.className + '"></i>';
    }

    app.addEventListener('click', () => {
        const windowElement = document.getElementById(windowId + '-window');
        if (windowElement.classList.contains('active') && windowElement.style.zIndex == zIndexCounter) {
            minimizeWindow(windowId + '-window');
        } else {
            windowElement.classList.add('active');
            windowElement.style.display = 'flex';
            setActiveWindow(windowId);

            if (activeWindows.has(windowId)) {
                activeWindows.get(windowId).minimized = false;
            }
        }
    });

    taskbarApps.appendChild(app);
}

// Remove Taskbar App
function removeTaskbarApp(windowId) {
    const app = document.getElementById('taskbar-' + windowId);
    if (app) {
        app.remove();
    }
}

// Window Dragging
document.querySelectorAll('.window-header').forEach(header => {
    header.addEventListener('mousedown', startDrag);
});

function startDrag(e) {
    if (e.target.closest('.window-controls')) return;

    const windowId = e.currentTarget.dataset.window;
    const window = document.getElementById(windowId);

    if (window.classList.contains('maximized')) return;

    draggedWindow = window;
    dragOffset.x = e.clientX - window.offsetLeft;
    dragOffset.y = e.clientY - window.offsetTop;

    setActiveWindow(windowId.replace('-window', ''));

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
}

function drag(e) {
    if (!draggedWindow) return;

    draggedWindow.style.left = (e.clientX - dragOffset.x) + 'px';
    draggedWindow.style.top = (e.clientY - dragOffset.y) + 'px';
}

function stopDrag() {
    draggedWindow = null;
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDrag);
}

// Desktop Icon Click
document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('dblclick', () => {
        const appId = icon.dataset.app;
        if (appId) {
            openWindow(appId);
        }
    });
});

// App Tile Click (Start Menu)
document.querySelectorAll('.app-tile[data-app]').forEach(tile => {
    tile.addEventListener('click', () => {
        const appId = tile.dataset.app;
        if (appId) {
            openWindow(appId);
        }
    });
});

// Click window to bring to front
document.querySelectorAll('.window').forEach(window => {
    window.addEventListener('mousedown', () => {
        const windowId = window.id.replace('-window', '');
        setActiveWindow(windowId);
    });
});

// Photo Viewer
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

// Switch to Mobile
function switchToMobile() {
    localStorage.removeItem('forceDesktop');
    window.location.href = 'mobile.html';
}

// Notes Auto-save
const notesArea = document.querySelector('.notes-area');
if (notesArea) {
    // Load saved notes
    const savedNotes = localStorage.getItem('desktop-notes');
    if (savedNotes) {
        notesArea.value = savedNotes;
    }

    // Auto-save
    notesArea.addEventListener('input', () => {
        localStorage.setItem('desktop-notes', notesArea.value);
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Windows key (or Meta key) to toggle start menu
    if (e.key === 'Meta' || e.key === 'OS') {
        e.preventDefault();
        toggleStartMenu();
    }

    // Escape to close start menu or widgets
    if (e.key === 'Escape') {
        if (startMenuOpen) {
            toggleStartMenu();
        }
        if (widgetsPanelOpen) {
            closeWidgets();
        }
    }
});

// Initialize
console.log('Windows 11 Desktop Interface Loaded');

// Open About window by default
setTimeout(() => {
    openWindow('about');
}, 300);
