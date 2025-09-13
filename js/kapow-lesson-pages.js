/**
 * Course Player Event Handler
 * Manages communication between Thinkific Course Player and lesson pages
 */

class CoursePlayerManager {
  constructor() {
    this.isInitialized = false;
    this.drawerSystemInitialized = false; // Track drawer system initialization
    this.confettiInitialized = false; // Track confetti library initialization
    this.jsConfetti = null; // Will hold confetti instance
    this.eventListeners = new Map();
    this.drawers = new Map();
    this.drawerItems = new Map(); // Track items to prevent duplicates
    this.drawerConfig = new Map(); // Dynamic drawer configuration
    this.drawerButtonsContainer = null; // Will hold the container for drawer buttons
    this.activeCTAs = new Map(); // Track active CTAs to prevent duplicates
    this.courseId = null; // Store course ID for persistent storage
    this.persistenceInitialized = false; // Track if persistence has been set up
    this.init();
  }

  init() {
    $(document).ready(() => {
      if (typeof(CoursePlayerV2) !== 'undefined') {
        this.setupCoursePlayerHooks();
        this.setupEventListeners();
        this.isInitialized = true;
        console.log('Course Player Manager initialized');
      } else {
        console.warn('CoursePlayerV2 not available - Course Player Manager not initialized');
      }
    });
  }

  setupCoursePlayerHooks() {
    // Always show Complete and Continue button when content will change
    CoursePlayerV2.on('hooks:contentWillChange', (data) => {
      console.log('Content will change:', data);
      this.showCompleteButton();
    });

    // Handle content did change
    CoursePlayerV2.on('hooks:contentDidChange', (data) => {
      console.log('Content did change - lesson page loaded:', data);
      this.setupIframeEventListeners();
      
      // Capture course ID for persistent storage
      if (data.course && data.course.id && !this.courseId) {
        this.courseId = data.course.id;
        console.log('Course ID captured for persistence:', this.courseId);
      }
      
      // Initialize drawer system on first content load (only once)
      if (!this.drawerSystemInitialized) {
        console.log('Setting up drawer system on first content load');
        this.setupDrawerSystem();
        this.drawerSystemInitialized = true;
      }

      // Initialize persistence after drawer system is set up
      if (!this.persistenceInitialized && this.drawerSystemInitialized && this.courseId) {
        console.log('Initializing drawer persistence');
        this.initializeDrawerPersistence();
        this.persistenceInitialized = true;
      }

      // Initialize confetti library on first content load (only once)
      if (!this.confettiInitialized) {
        console.log('Loading confetti library');
        this.loadConfettiLibrary();
        this.confettiInitialized = true;
      }
    });
  }

  setupEventListeners() {
    console.log("Setting up message listener")
    // Listen for lesson page events
    window.addEventListener('message', (event) => {
      this.handleLessonPageEvent(event);
    });
  }

  setupIframeEventListeners() {
    // Listen for events from the iframed lesson page
    const iframe = document.querySelector('iframe');
    if (iframe) {
      iframe.addEventListener('load', () => {
        console.log('Lesson page iframe loaded');
      });
    }
  }

  handleLessonPageEvent(event) {
    // Handle messages from lesson page iframe
    console.log("Got event from iframe");
    if (event.data && typeof event.data === 'object' && event.data.type) {
      const { type, data } = event.data;
      
      switch (type) {
        case 'kapow_lp_hide_cc':
          this.hideCompleteButton();
          break;
        case 'kapow_lp_show_cc':
          this.showCompleteButton();
          break;
        case 'kapow_lp_click_cc':
          this.clickCompleteButton();
          break;
        case 'kapow_lp_show_toast':
          this.showToast(data);
          break;
        case 'kapow_lp_show_video_overlay':
          this.showVideoOverlay(data);
          break;
        case 'kapow_lp_add_to_drawer':
          this.addToDrawer(data);
          break;
        case 'kapow_lp_confetti':
          this.triggerConfetti(data);
          break;
        case 'kapow_lp_show_cta':
          this.showCTA(data);
          break;
        default:
          console.log('Unknown lesson page event:', type, data);
      }
    }
  }

  hideCompleteButton() {
    const footer = document.getElementById('course-player-footer');
    if (footer) {
      footer.style.display = 'none';
      console.log('Complete and Continue button hidden');
    } else {
      console.warn('Course player footer not found');
    }
  }

  showCompleteButton() {
    const footer = document.getElementById('course-player-footer');
    if (footer) {
      footer.style.display = '';
      console.log('Complete and Continue button shown');
    } else {
      console.warn('Course player footer not found');
    }
  }

  clickCompleteButton() {
    const button = document.querySelector('#course-player-footer [data-qa="complete-continue__btn"]');
    if (button) {
      button.click();
      console.log('Complete and Continue button clicked');
    } else {
      console.warn('Complete and Continue button not found');
    }
  }

  showToast(options = {}) {
    // Default toast options
    const defaults = {
      message: 'Great job! Keep going!',
      location: 'top-right',
      size: 'medium',
      style: 'success',
      duration: 3000,
      backgroundColor: '#28a745',
      textColor: '#ffffff'
    };

    const config = { ...defaults, ...options };

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `course-player-toast toast-${config.location} toast-${config.size} toast-${config.style}`;
    
    // Apply custom styles
    toast.style.cssText = `
      position: fixed;
      z-index: 10000;
      padding: ${config.size === 'small' ? '8px 12px' : config.size === 'large' ? '20px 30px' : '12px 20px'};
      background-color: ${config.backgroundColor};
      color: ${config.textColor};
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: ${config.size === 'small' ? '14px' : config.size === 'large' ? '18px' : '16px'};
      font-weight: 500;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      max-width: 400px;
      word-wrap: break-word;
      animation: toastSlideIn 0.3s ease-out;
      transition: all 0.3s ease;
    `;

    // Position the toast
    this.positionToast(toast, config.location);

    toast.textContent = config.message;

    // Add to document
    document.body.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
      toast.style.animation = 'toastSlideOut 0.3s ease-in';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, config.duration);

    console.log('Toast displayed:', config.message, 'Location:', config.location);
  }

  positionToast(element, location) {
    // Clear positioning
    element.style.top = element.style.bottom = element.style.left = element.style.right = 'auto';

    switch (location) {
      case 'top-left':
        element.style.top = '20px';
        element.style.left = '20px';
        break;
      case 'top-center':
        element.style.top = '20px';
        element.style.left = '50%';
        element.style.transform = 'translateX(-50%)';
        break;
      case 'top-right':
      default:
        element.style.top = '20px';
        element.style.right = '20px';
        break;
      case 'center':
        element.style.top = '50%';
        element.style.left = '50%';
        element.style.transform = 'translate(-50%, -50%)';
        break;
      case 'bottom-left':
        element.style.bottom = '20px';
        element.style.left = '20px';
        break;
      case 'bottom-center':
        element.style.bottom = '20px';
        element.style.left = '50%';
        element.style.transform = 'translateX(-50%)';
        break;
      case 'bottom-right':
        element.style.bottom = '20px';
        element.style.right = '20px';
        break;
    }
  }

  showVideoOverlay(options = {}) {
    // Default video overlay options
    const defaults = {
      videoUrl: '',
      message: '',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      backgroundOpacity: 0.95,
      showProgress: true
    };

    const config = { ...defaults, ...options };

    if (!config.videoUrl) {
      console.error('Video URL is required for video overlay');
      return;
    }

    // Create overlay container
    const overlay = document.createElement('div');
    overlay.id = 'course-player-video-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Set background with opacity
    const bgColor = this.hexToRgb(config.backgroundColor);
    overlay.style.backgroundColor = `rgba(${bgColor.r}, ${bgColor.g}, ${bgColor.b}, ${config.backgroundOpacity})`;

    // Create message container (if message provided)
    if (config.message) {
      const messageContainer = document.createElement('div');
      messageContainer.style.cssText = `
        color: ${config.textColor};
        font-size: 24px;
        font-weight: 600;
        text-align: center;
        margin-bottom: 30px;
        max-width: 800px;
        line-height: 1.4;
      `;
      messageContainer.textContent = config.message;
      overlay.appendChild(messageContainer);
    }

    // Create video container
    const videoContainer = document.createElement('div');
    videoContainer.style.cssText = `
      position: relative;
      max-width: 90%;
      max-height: 70%;
      background: #000;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    `;

    // Create video element
    const video = document.createElement('video');
    video.style.cssText = `
      width: 100%;
      height: 100%;
      display: block;
      outline: none;
    `;
    video.src = config.videoUrl;
    video.preload = 'metadata';
    video.disablePictureInPicture = true;
    video.controlsList = 'nodownload nofullscreen noremoteplayback';

    // Create custom progress bar (if enabled)
    let progressContainer, progressBar, timeDisplay;
    if (config.showProgress) {
      progressContainer = document.createElement('div');
      progressContainer.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0,0,0,0.7);
        padding: 15px 20px;
        color: ${config.textColor};
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 15px;
      `;

      // Progress bar
      const progressTrack = document.createElement('div');
      progressTrack.style.cssText = `
        flex: 1;
        height: 4px;
        background: rgba(255,255,255,0.3);
        border-radius: 2px;
        overflow: hidden;
      `;

      progressBar = document.createElement('div');
      progressBar.style.cssText = `
        height: 100%;
        background: ${config.textColor};
        width: 0%;
        transition: width 0.1s ease;
        border-radius: 2px;
      `;
      progressTrack.appendChild(progressBar);

      // Time display
      timeDisplay = document.createElement('div');
      timeDisplay.style.cssText = `
        font-weight: 500;
        min-width: 80px;
        text-align: right;
        font-variant-numeric: tabular-nums;
      `;

      progressContainer.appendChild(progressTrack);
      progressContainer.appendChild(timeDisplay);
    }

    // Assemble video container
    videoContainer.appendChild(video);
    if (progressContainer) {
      videoContainer.appendChild(progressContainer);
    }
    overlay.appendChild(videoContainer);

    // Add to document
    document.body.appendChild(overlay);

    // Video event handlers
    video.addEventListener('loadedmetadata', () => {
      console.log('Video metadata loaded, duration:', video.duration);
      if (timeDisplay) {
        timeDisplay.textContent = this.formatTime(video.duration);
      }
    });

    video.addEventListener('timeupdate', () => {
      if (config.showProgress && video.duration) {
        const progress = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${progress}%`;
        
        const remaining = video.duration - video.currentTime;
        timeDisplay.textContent = this.formatTime(remaining);
      }
    });

    video.addEventListener('ended', () => {
      console.log('Video ended, removing overlay');
      this.removeVideoOverlay();
    });

    video.addEventListener('error', (e) => {
      console.error('Video error:', e);
      alert('Error loading video. Please check the video URL.');
      this.removeVideoOverlay();
    });

    // Start playing
    video.play().catch(error => {
      console.error('Error playing video:', error);
      alert('Could not play video. It may need user interaction to start.');
    });

    // Prevent background scrolling
    document.body.style.overflow = 'hidden';

    console.log('Video overlay displayed:', config.videoUrl);
  }

  removeVideoOverlay() {
    const overlay = document.getElementById('course-player-video-overlay');
    if (overlay) {
      overlay.remove();
      document.body.style.overflow = '';
      console.log('Video overlay removed');
    }
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  setupDrawerSystem() {
    // Find the course progress container
    const progressContainer = document.querySelector('.course-progress__container');
    if (!progressContainer) {
      console.warn('course-progress__container not found - drawer system not initialized');
      return;
    }

    // Create drawer buttons container (initially empty)
    this.drawerButtonsContainer = document.createElement('div');
    this.drawerButtonsContainer.className = 'course-drawers-buttons';
    this.drawerButtonsContainer.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 12px 0px;
      align-items: center;
      max-width: 100%;
      overflow: hidden;
      box-sizing: border-box;
    `;

    // Add empty container to progress container (buttons will be added dynamically)
    progressContainer.appendChild(this.drawerButtonsContainer);

    // Create drawer overlay (panels will be added dynamically)
    this.createDrawerOverlay();

    console.log('Drawer system initialized - waiting for dynamic drawer creation');
  }

  createDrawerOverlay() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'course-drawers-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 9999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
    `;

    // Click overlay to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closeAllDrawers();
      }
    });

    // Create drawer container (initially empty)
    const drawerContainer = document.createElement('div');
    drawerContainer.id = 'course-drawers-container';
    drawerContainer.style.cssText = `
      position: fixed;
      top: 0;
      right: -400px;
      width: 400px;
      height: 100%;
      background: white;
      box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
      transition: right 0.3s ease;
      display: flex;
      flex-direction: column;
      z-index: 10000;
    `;

    // Container starts empty - panels will be added dynamically when drawers are created

    overlay.appendChild(drawerContainer);
    document.body.appendChild(overlay);
  }

  createDrawerPanel(drawerId) {
    const config = this.drawerConfig.get(drawerId);
    
    const panel = document.createElement('div');
    panel.className = `course-drawer-panel course-drawer-panel--${drawerId}`;
    panel.style.cssText = `
      display: none;
      flex-direction: column;
      height: 100%;
    `;

    panel.innerHTML = `
      <div class="drawer-header" style="
        padding: 20px;
        border-bottom: 1px solid #e5e7eb;
        background: #f9fafb;
      ">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 24px;">${config.icon}</span>
            <div>
              <h3 style="margin: 0; color: #111827; font-size: 18px; font-weight: 600;">${config.label}</h3>
              <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">${config.description}</p>
            </div>
          </div>
          <button class="drawer-close-btn" style="
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #6b7280;
            padding: 4px;
            border-radius: 4px;
            line-height: 1;
          ">×</button>
        </div>
      </div>
      <div class="drawer-content" style="
        flex: 1;
        overflow-y: auto;
        padding: 0;
      ">
        <div class="drawer-empty-state" style="
          padding: 40px 20px;
          text-align: center;
          color: #6b7280;
        ">
          <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">${config.icon}</div>
          <p style="margin: 0; font-size: 16px;">No items yet</p>
          <p style="margin: 8px 0 0 0; font-size: 14px;">Items will appear here as you progress through lessons.</p>
        </div>
        <div class="drawer-items" style="display: none;"></div>
      </div>
    `;

    // Close button handler
    const closeBtn = panel.querySelector('.drawer-close-btn');
    closeBtn.addEventListener('click', () => this.closeAllDrawers());

    return panel;
  }

  toggleDrawer(drawerId) {
    const overlay = document.getElementById('course-drawers-overlay');
    const container = document.getElementById('course-drawers-container');
    const panel = this.drawers.get(drawerId);
    
    if (!overlay || !container || !panel) return;

    // If drawer is already open, close it
    if (overlay.style.visibility === 'visible') {
      this.closeAllDrawers();
      return;
    }

    // Hide all panels
    this.drawers.forEach(p => p.style.display = 'none');
    
    // Show selected panel
    panel.style.display = 'flex';

    // Show overlay and slide in container
    overlay.style.visibility = 'visible';
    overlay.style.opacity = '1';
    container.style.right = '0';

    console.log(`Opened ${drawerId} drawer`);
  }

  closeAllDrawers() {
    const overlay = document.getElementById('course-drawers-overlay');
    const container = document.getElementById('course-drawers-container');
    
    if (overlay && container) {
      overlay.style.opacity = '0';
      overlay.style.visibility = 'hidden';
      container.style.right = '-400px';
    }
  }

  createDrawerButton(drawerId, config) {
    // Create button
    const button = document.createElement('button');
    button.className = `course-drawer-btn course-drawer-btn--${drawerId}`;
    button.setAttribute('data-drawer', drawerId);
    button.style.cssText = `
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(0, 0, 0, 0.1);
      border-radius: 6px;
      padding: 6px 10px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      display: flex;
      align-items: center;
      gap: 5px;
      transition: all 0.2s ease;
      position: relative;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    `;

    // Button content
    button.innerHTML = `
      <span class="drawer-icon">${config.icon}</span>
      <span class="drawer-label">${config.label}</span>
      <span class="drawer-count" style="
        background: #DAD7CD;
        color: #333333;
        border-radius: 10px;
        padding: 2px 6px;
        font-size: 11px;
        font-weight: 600;
        min-width: 16px;
        text-align: center;
        display: none;
      ">0</span>
    `;

    // Hover effects
    button.addEventListener('mouseenter', () => {
      button.style.background = 'rgba(59, 130, 246, 0.1)';
      button.style.borderColor = 'rgba(59, 130, 246, 0.3)';
      button.style.transform = 'translateY(-1px)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = 'rgba(255, 255, 255, 0.9)';
      button.style.borderColor = 'rgba(0, 0, 0, 0.1)';
      button.style.transform = 'translateY(0)';
    });

    // Click handler
    button.addEventListener('click', () => this.toggleDrawer(drawerId));

    return button;
  }

  ensureDrawerExists(drawerId, config = null) {
    // If drawer already exists, do nothing
    if (this.drawerConfig.has(drawerId)) {
      return;
    }

    // Set default configuration if none provided
    const defaultConfig = config || {
      label: drawerId.charAt(0).toUpperCase() + drawerId.slice(1),
      icon: '📁',
      description: `${drawerId} collection`
    };

    // Store configuration
    this.drawerConfig.set(drawerId, defaultConfig);

    // Initialize drawer items tracking
    this.drawerItems.set(drawerId, new Set());

    // Create and add button
    if (this.drawerButtonsContainer) {
      const button = this.createDrawerButton(drawerId, defaultConfig);
      this.drawerButtonsContainer.appendChild(button);
    }

    // Create and add panel
    const drawerContainer = document.getElementById('course-drawers-container');
    if (drawerContainer) {
      const panel = this.createDrawerPanel(drawerId);
      drawerContainer.appendChild(panel);
      this.drawers.set(drawerId, panel);
    }

    console.log(`Created new drawer: ${drawerId}`, defaultConfig);
  }

  addToDrawer(data) {
    const { drawerId, itemId, content, title, type = 'default', drawerConfig, autoOpen = false, showToast = false, toastMessage, _skipPersistence = false } = data;

    if (!drawerId || !itemId || !content) {
      console.error('addToDrawer requires drawerId, itemId, and content');
      return;
    }

    // Ensure the drawer exists (create if needed)
    this.ensureDrawerExists(drawerId, drawerConfig);

    // Check if item already exists
    const drawerItems = this.drawerItems.get(drawerId);
    if (drawerItems.has(itemId)) {
      console.log(`Item ${itemId} already exists in ${drawerId} drawer`);
      return;
    }

    // Add item to tracking
    drawerItems.add(itemId);

    // Get drawer panel
    const panel = this.drawers.get(drawerId);
    if (!panel) return;

    // Hide empty state and show items container
    const emptyState = panel.querySelector('.drawer-empty-state');
    const itemsContainer = panel.querySelector('.drawer-items');
    
    emptyState.style.display = 'none';
    itemsContainer.style.display = 'block';

    // Create item element
    const itemElement = document.createElement('div');
    itemElement.className = `drawer-item drawer-item--${type}`;
    itemElement.setAttribute('data-item-id', itemId);
    itemElement.style.cssText = `
      border-bottom: 1px solid #f3f4f6;
      padding: 16px 20px;
      transition: background-color 0.2s ease;
    `;

    // Add title if provided
    let itemHTML = '';
    if (title) {
      /*
      itemHTML += `<div class="drawer-item-title" style="
        font-weight: 600;
        color: #111827;
        margin-bottom: 8px;
        font-size: 14px;
      ">${title}</div>`;
      */
    }
    
    itemHTML += `<div class="drawer-item-content">${content}</div>`;
    itemElement.innerHTML = itemHTML;

    // Hover effect
    itemElement.addEventListener('mouseenter', () => {
      itemElement.style.backgroundColor = '#f9fafb';
    });

    itemElement.addEventListener('mouseleave', () => {
      itemElement.style.backgroundColor = 'transparent';
    });

    // Add to container
    itemsContainer.appendChild(itemElement);

    // Update button count
    this.updateDrawerCount(drawerId);

    console.log(`Added item ${itemId} to ${drawerId} drawer`);

    // Persist to localStorage (unless it's a restored item)
    if (!_skipPersistence) {
      this.persistDrawerItem(data);
    }

    // Auto-open drawer if requested
    if (autoOpen) {
      console.log(`Auto-opening ${drawerId} drawer`);
      setTimeout(() => {
        this.toggleDrawer(drawerId);
      }, 100); // Small delay to ensure UI is updated
    }

    // Show toast message if requested
    if (showToast) {
      const defaultToastMessage = title ? `Added "${title}" to ${this.drawerConfig.get(drawerId).label}` : `New item added to ${this.drawerConfig.get(drawerId).label}`;
      const finalToastMessage = toastMessage || defaultToastMessage;
      
      console.log(`Showing toast: ${finalToastMessage}`);
      this.showToast({
        message: finalToastMessage,
        location: 'top-right',
        backgroundColor: '#10b981',
        textColor: '#ffffff',
        duration: 3000
      });
    }
  }

  updateDrawerCount(drawerId) {
    const button = document.querySelector(`[data-drawer="${drawerId}"]`);
    const countElement = button?.querySelector('.drawer-count');
    
    if (button && countElement) {
      const count = this.drawerItems.get(drawerId).size;
      countElement.textContent = count;
      countElement.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }

  // Drawer Persistence Methods
  initializeDrawerPersistence() {
    if (!this.courseId) {
      console.warn('Cannot initialize persistence - no course ID available');
      return;
    }
    
    try {
      console.log('Loading stored drawer items for course:', this.courseId);
      const storedItems = this.getStoredDrawerItems();
      
      if (storedItems.length > 0) {
        console.log(`Restoring ${storedItems.length} drawer items from storage`);
        
        // Restore items
        storedItems.forEach(item => {
          // Don't persist again when restoring
          this.addToDrawer({ ...item, _skipPersistence: true });
        });
        
        console.log('Drawer items restored from persistent storage');
      } else {
        console.log('No stored drawer items found for this course');
      }
    } catch (error) {
      console.error('Error initializing drawer persistence:', error);
    }
  }

  getStorageKey() {
    return `thinkific_drawers_${this.courseId}`;
  }

  isStorageAvailable() {
    try {
      const test = 'localStorage_test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  compressData(data) {
    try {
      // Simple compression by removing unnecessary whitespace and shortening keys
      const compressed = JSON.stringify(data).replace(/\s+/g, ' ');
      return compressed;
    } catch (error) {
      console.error('Error compressing drawer data:', error);
      return JSON.stringify(data);
    }
  }

  decompressData(compressedData) {
    try {
      return JSON.parse(compressedData);
    } catch (error) {
      console.error('Error decompressing drawer data:', error);
      return [];
    }
  }

  getStoredDrawerItems() {
    if (!this.isStorageAvailable() || !this.courseId) {
      return [];
    }

    try {
      const storageKey = this.getStorageKey();
      const compressed = localStorage.getItem(storageKey);
      
      if (!compressed) {
        return [];
      }
      
      const data = this.decompressData(compressed);
      
      // Clean up old items (older than 90 days)
      const maxAge = 90 * 24 * 60 * 60 * 1000; // 90 days in milliseconds
      const cutoff = Date.now() - maxAge;
      const validItems = data.filter(item => 
        !item.timestamp || item.timestamp > cutoff
      );
      
      // If we cleaned up items, save the cleaned version
      if (validItems.length !== data.length) {
        console.log(`Cleaned up ${data.length - validItems.length} old drawer items`);
        this.saveDrawerItems(validItems, false); // Don't log this save
      }
      
      return validItems;
    } catch (error) {
      console.error('Error retrieving stored drawer items:', error);
      return [];
    }
  }

  saveDrawerItems(items, shouldLog = true) {
    if (!this.isStorageAvailable() || !this.courseId) {
      return false;
    }

    try {
      const storageKey = this.getStorageKey();
      const compressed = this.compressData(items);
      
      // Check storage size (warn if approaching 5MB)
      const sizeInBytes = new Blob([compressed]).size;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      if (sizeInMB > 4) {
        console.warn(`Drawer storage approaching limit: ${sizeInMB.toFixed(2)}MB`);
      }
      
      localStorage.setItem(storageKey, compressed);
      
      if (shouldLog) {
        console.log(`Saved ${items.length} drawer items to persistent storage (${sizeInMB.toFixed(2)}MB)`);
      }
      
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded - attempting cleanup');
        this.performStorageCleanup();
        return false;
      } else {
        console.error('Error saving drawer items:', error);
        return false;
      }
    }
  }

  performStorageCleanup() {
    try {
      // Remove items older than 30 days
      const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
      const cutoff = Date.now() - maxAge;
      
      const currentItems = this.getStoredDrawerItems();
      const cleanedItems = currentItems.filter(item => 
        !item.timestamp || item.timestamp > cutoff
      );
      
      console.log(`Storage cleanup: ${currentItems.length - cleanedItems.length} items removed`);
      
      if (cleanedItems.length < currentItems.length) {
        this.saveDrawerItems(cleanedItems, false);
      }
    } catch (error) {
      console.error('Error during storage cleanup:', error);
    }
  }

  persistDrawerItem(drawerData) {
    if (!this.isStorageAvailable() || !this.courseId) {
      return;
    }

    try {
      const currentItems = this.getStoredDrawerItems();
      
      // Check for duplicates based on drawerId + itemId
      const isDuplicate = currentItems.some(item => 
        item.drawerId === drawerData.drawerId && 
        item.itemId === drawerData.itemId
      );
      
      if (isDuplicate) {
        console.log('Drawer item already persisted, skipping storage');
        return;
      }
      
      // Add timestamp for cleanup purposes
      const itemWithTimestamp = {
        ...drawerData,
        timestamp: Date.now()
      };
      
      currentItems.push(itemWithTimestamp);
      this.saveDrawerItems(currentItems);
      
    } catch (error) {
      console.error('Error persisting drawer item:', error);
    }
  }

  // Utility method for debugging storage
  getStorageStats() {
    if (!this.courseId) {
      return { error: 'No course ID available' };
    }

    try {
      const storageKey = this.getStorageKey();
      const compressed = localStorage.getItem(storageKey);
      
      if (!compressed) {
        return { 
          courseId: this.courseId,
          itemCount: 0, 
          storageSize: 0,
          storageSizeMB: 0 
        };
      }
      
      const items = this.decompressData(compressed);
      const sizeInBytes = new Blob([compressed]).size;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      return {
        courseId: this.courseId,
        itemCount: items.length,
        storageSize: sizeInBytes,
        storageSizeMB: parseFloat(sizeInMB.toFixed(2)),
        items: items.map(item => ({
          drawerId: item.drawerId,
          itemId: item.itemId,
          title: item.title,
          timestamp: item.timestamp,
          age: item.timestamp ? Math.floor((Date.now() - item.timestamp) / (1000 * 60 * 60 * 24)) + ' days' : 'unknown'
        }))
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Clear all stored drawer items for this course
  clearStoredDrawers() {
    if (!this.courseId) {
      console.warn('Cannot clear storage - no course ID available');
      return false;
    }

    try {
      const storageKey = this.getStorageKey();
      localStorage.removeItem(storageKey);
      console.log(`Cleared all stored drawer items for course ${this.courseId}`);
      return true;
    } catch (error) {
      console.error('Error clearing stored drawers:', error);
      return false;
    }
  }

  loadConfettiLibrary() {
    // Check if js-confetti is already loaded
    if (window.JSConfetti) {
      this.jsConfetti = new window.JSConfetti();
      console.log('JSConfetti instance created (library already loaded)');
      return;
    }

    // Load js-confetti library
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/js-confetti@latest/dist/js-confetti.browser.js';
    script.onload = () => {
      this.jsConfetti = new window.JSConfetti();
      console.log('JSConfetti library loaded and instance created');
    };
    script.onerror = (error) => {
      console.error('Failed to load JSConfetti library:', error);
    };
    document.head.appendChild(script);
  }

  triggerConfetti(options = {}) {
    if (!this.jsConfetti) {
      console.warn('JSConfetti not initialized - attempting to load library first');
      this.loadConfettiLibrary();
      
      // Retry after a brief delay
      setTimeout(() => {
        if (this.jsConfetti) {
          this.jsConfetti.addConfetti(options);
          console.log('Confetti triggered (delayed):', options);
        } else {
          console.error('JSConfetti still not available after loading attempt');
        }
      }, 100);
      return;
    }

    // Trigger confetti with provided options
    this.jsConfetti.addConfetti(options);
    console.log('Confetti triggered:', options);
  }

  showCTA(options = {}) {
    // Default CTA options
    const defaults = {
      id: 'default-cta',
      heading: 'Ready to get started?',
      subheading: '',
      buttonText: 'Get Started',
      buttonLink: '#',
      style: 'floating-card',
      location: 'bottom-right',
      backgroundColor: '#3b82f6',
      textColor: '#ffffff',
      buttonBackgroundColor: '#ffffff',
      buttonTextColor: '#3b82f6',
      dismissible: true,
      autoClose: 0, // 0 means no auto-close
      width: 320,
      padding: 20
    };

    const config = { ...defaults, ...options };

    // Validate required fields
    if (!config.heading || !config.buttonText || !config.buttonLink) {
      console.error('showCTA requires heading, buttonText, and buttonLink');
      return;
    }

    // Check if CTA already exists
    if (this.activeCTAs.has(config.id)) {
      console.log(`CTA ${config.id} already exists`);
      return;
    }

    // Create CTA element based on style
    let ctaElement;
    switch (config.style) {
      case 'thin-bar':
        ctaElement = this.createThinBarCTA(config);
        break;
      case 'modal':
        ctaElement = this.createModalCTA(config);
        break;
      case 'floating-card':
      default:
        ctaElement = this.createFloatingCardCTA(config);
        break;
    }

    // Add to active CTAs tracking
    this.activeCTAs.set(config.id, {
      element: ctaElement,
      config: config
    });

    // Add to document
    document.body.appendChild(ctaElement);

    // Auto-close handling
    if (config.autoClose > 0) {
      setTimeout(() => {
        this.closeCTA(config.id);
      }, config.autoClose * 1000);
    }

    console.log('CTA displayed:', config.id, config.style);
  }

  createFloatingCardCTA(config) {
    const cta = document.createElement('div');
    cta.id = `course-cta-${config.id}`;
    cta.className = 'course-cta course-cta-floating-card';
    cta.style.cssText = `
      position: fixed;
      z-index: 9998;
      background: ${config.backgroundColor};
      color: ${config.textColor};
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      padding: ${config.padding}px;
      width: ${config.width}px;
      max-width: calc(100vw - 40px);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: ctaSlideIn 0.4s ease-out;
      box-sizing: border-box;
    `;

    // Position the CTA
    this.positionCTA(cta, config.location, config.style);

    // Create content
    let contentHTML = `
      <div class="cta-content">
        <h3 style="margin: 0 0 ${config.subheading ? '8px' : '16px'} 0; font-size: 18px; font-weight: 600; line-height: 1.3;">
          ${config.heading}
        </h3>
    `;

    if (config.subheading) {
      contentHTML += `
        <p style="margin: 0 0 16px 0; font-size: 14px; opacity: 0.9; line-height: 1.4;">
          ${config.subheading}
        </p>
      `;
    }

    contentHTML += `
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <a href="${config.buttonLink}" class="cta-button" style="
            background: ${config.buttonBackgroundColor};
            color: ${config.buttonTextColor};
            text-decoration: none;
            padding: 10px 20px;
            border-radius: 6px;
            font-weight: 500;
            font-size: 14px;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
            display: inline-block;
          ">${config.buttonText}</a>
    `;

    if (config.dismissible) {
      contentHTML += `
          <button class="cta-close" style="
            background: none;
            border: none;
            color: ${config.textColor};
            font-size: 20px;
            cursor: pointer;
            opacity: 0.7;
            padding: 4px;
            margin-left: 12px;
            border-radius: 4px;
            transition: opacity 0.2s ease;
          ">×</button>
      `;
    }

    contentHTML += `
        </div>
      </div>
    `;

    cta.innerHTML = contentHTML;

    // Add event handlers
    this.addCTAEventHandlers(cta, config);

    return cta;
  }

  createThinBarCTA(config) {
    const cta = document.createElement('div');
    cta.id = `course-cta-${config.id}`;
    cta.className = 'course-cta course-cta-thin-bar';
    cta.style.cssText = `
      position: fixed;
      z-index: 9998;
      background: ${config.backgroundColor};
      color: ${config.textColor};
      width: 100%;
      padding: 12px 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: ctaSlideIn 0.4s ease-out;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    `;

    // Position the CTA (top or bottom for thin bar)
    if (config.location.includes('top')) {
      cta.style.top = '0';
      cta.style.left = '0';
      cta.style.right = '0';
    } else {
      cta.style.bottom = '0';
      cta.style.left = '0';
      cta.style.right = '0';
    }

    // Create content - more compact for thin bar
    let contentHTML = `
      <div class="cta-content" style="display: flex; align-items: center; gap: 16px; flex: 1;">
        <div>
          <span style="font-weight: 600; font-size: 16px;">${config.heading}</span>
    `;

    if (config.subheading) {
      contentHTML += `<span style="margin-left: 8px; opacity: 0.9; font-size: 14px;">${config.subheading}</span>`;
    }

    contentHTML += `
        </div>
        <a href="${config.buttonLink}" class="cta-button" style="
          background: ${config.buttonBackgroundColor};
          color: ${config.buttonTextColor};
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 5px;
          font-weight: 500;
          font-size: 14px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        ">${config.buttonText}</a>
      </div>
    `;

    if (config.dismissible) {
      contentHTML += `
        <button class="cta-close" style="
          background: none;
          border: none;
          color: ${config.textColor};
          font-size: 20px;
          cursor: pointer;
          opacity: 0.7;
          padding: 4px;
          margin-left: 12px;
          border-radius: 4px;
          transition: opacity 0.2s ease;
        ">×</button>
      `;
    }

    cta.innerHTML = contentHTML;

    // Add event handlers
    this.addCTAEventHandlers(cta, config);

    return cta;
  }

  createModalCTA(config) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = `course-cta-${config.id}`;
    overlay.className = 'course-cta course-cta-modal';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
      animation: modalFadeIn 0.3s ease-out;
    `;

    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'cta-modal-content';
    modal.style.cssText = `
      background: ${config.backgroundColor};
      color: ${config.textColor};
      border-radius: 12px;
      padding: ${config.padding * 1.5}px;
      max-width: ${config.width + 80}px;
      width: 100%;
      position: relative;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      text-align: center;
    `;

    // Create content
    let contentHTML = `
      <h2 style="margin: 0 0 ${config.subheading ? '12px' : '24px'} 0; font-size: 24px; font-weight: 600; line-height: 1.3;">
        ${config.heading}
      </h2>
    `;

    if (config.subheading) {
      contentHTML += `
        <p style="margin: 0 0 24px 0; font-size: 16px; opacity: 0.9; line-height: 1.5;">
          ${config.subheading}
        </p>
      `;
    }

    contentHTML += `
      <div style="margin-top: 24px;">
        <a href="${config.buttonLink}" class="cta-button" style="
          background: ${config.buttonBackgroundColor};
          color: ${config.buttonTextColor};
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 500;
          font-size: 16px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-block;
          min-width: 120px;
        ">${config.buttonText}</a>
      </div>
    `;

    if (config.dismissible) {
      contentHTML += `
        <button class="cta-close" style="
          position: absolute;
          top: 15px;
          right: 15px;
          background: none;
          border: none;
          color: ${config.textColor};
          font-size: 24px;
          cursor: pointer;
          opacity: 0.7;
          padding: 4px;
          border-radius: 4px;
          transition: opacity 0.2s ease;
        ">×</button>
      `;
    }

    modal.innerHTML = contentHTML;
    overlay.appendChild(modal);

    // Prevent closing when clicking on modal content
    modal.addEventListener('click', (e) => e.stopPropagation());

    // Close when clicking overlay (if dismissible)
    if (config.dismissible) {
      overlay.addEventListener('click', () => this.closeCTA(config.id));
    }

    // Add event handlers
    this.addCTAEventHandlers(overlay, config);

    return overlay;
  }

  positionCTA(element, location, style) {
    // Clear positioning
    element.style.top = element.style.bottom = element.style.left = element.style.right = 'auto';

    // Don't position modal - it handles its own positioning
    if (style === 'modal') return;

    const margin = 20;

    switch (location) {
      case 'top-left':
        element.style.top = `${margin}px`;
        element.style.left = `${margin}px`;
        break;
      case 'top-center':
        element.style.top = `${margin}px`;
        element.style.left = '50%';
        element.style.transform = 'translateX(-50%)';
        break;
      case 'top-right':
        element.style.top = `${margin}px`;
        element.style.right = `${margin}px`;
        break;
      case 'center-left':
        element.style.top = '50%';
        element.style.left = `${margin}px`;
        element.style.transform = 'translateY(-50%)';
        break;
      case 'center':
        element.style.top = '50%';
        element.style.left = '50%';
        element.style.transform = 'translate(-50%, -50%)';
        break;
      case 'center-right':
        element.style.top = '50%';
        element.style.right = `${margin}px`;
        element.style.transform = 'translateY(-50%)';
        break;
      case 'bottom-left':
        element.style.bottom = `${margin}px`;
        element.style.left = `${margin}px`;
        break;
      case 'bottom-center':
        element.style.bottom = `${margin}px`;
        element.style.left = '50%';
        element.style.transform = 'translateX(-50%)';
        break;
      case 'bottom-right':
      default:
        element.style.bottom = `${margin}px`;
        element.style.right = `${margin}px`;
        break;
    }
  }

  addCTAEventHandlers(element, config) {
    // Close button handler
    const closeBtn = element.querySelector('.cta-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.closeCTA(config.id);
      });

      // Hover effect for close button
      closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.opacity = '1';
      });

      closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.opacity = '0.7';
      });
    }

    // Button hover effect
    const ctaButton = element.querySelector('.cta-button');
    if (ctaButton) {
      ctaButton.addEventListener('mouseenter', () => {
        ctaButton.style.transform = 'translateY(-1px)';
        ctaButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      });

      ctaButton.addEventListener('mouseleave', () => {
        ctaButton.style.transform = 'translateY(0)';
        ctaButton.style.boxShadow = 'none';
      });
    }
  }

  closeCTA(ctaId) {
    const ctaData = this.activeCTAs.get(ctaId);
    if (!ctaData) return;

    const element = ctaData.element;
    
    // Animate out
    element.style.animation = 'ctaSlideOut 0.3s ease-in';
    
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.activeCTAs.delete(ctaId);
      console.log(`CTA ${ctaId} closed`);
    }, 300);
  }

  // Method for lesson pages to trigger events
  triggerEvent(eventType, data = null) {
    if (window.parent !== window) {
      // We're in an iframe, send message to parent
      window.parent.postMessage({
        type: eventType,
        data: data
      }, '*');
      console.log('Event triggered:', eventType, data);
    } else {
      console.warn('Not in iframe - cannot trigger parent events');
    }
  }
}

// Lesson Page Event Helpers (for use in lesson pages)
window.LessonPageEvents = {
  hideCompleteButton() {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'kapow_lp_hide_cc'
      }, '*');
    }
  },

  showCompleteButton() {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'kapow_lp_show_cc'
      }, '*');
    }
  },

  clickCompleteButton() {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'kapow_lp_click_cc'
      }, '*');
    }
  },

  showToast(message, options = {}) {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'kapow_lp_show_toast',
        data: { message, ...options }
      }, '*');
    }
  },

  showVideoOverlay(videoUrl, options = {}) {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'kapow_lp_show_video_overlay',
        data: { videoUrl, ...options }
      }, '*');
    }
  },

  addToDrawer(drawerId, itemId, content, options = {}) {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'kapow_lp_add_to_drawer',
        data: { drawerId, itemId, content, ...options }
      }, '*');
    }
  },

  triggerConfetti(options = {}) {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'kapow_lp_confetti',
        data: options
      }, '*');
    }
  },

  showCTA(options = {}) {
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'kapow_lp_show_cta',
        data: options
      }, '*');
    }
  }
};

// Add CSS animations for CTA elements
if (!document.getElementById('course-player-cta-styles')) {
  const style = document.createElement('style');
  style.id = 'course-player-cta-styles';
  style.textContent = `
    @keyframes ctaSlideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes ctaSlideOut {
      from {
        opacity: 1;
        transform: translateY(0);
      }
      to {
        opacity: 0;
        transform: translateY(-20px);
      }
    }

    @keyframes modalFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    /* Toast animations */
    @keyframes toastSlideIn {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes toastSlideOut {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100%);
      }
    }

    /* CTA responsive adjustments */
    @media (max-width: 768px) {
      .course-cta-floating-card {
        width: calc(100vw - 20px) !important;
        max-width: none !important;
        margin: 0 10px !important;
      }
      
      .course-cta-thin-bar {
        padding: 10px 15px !important;
      }
      
      .course-cta-thin-bar .cta-content {
        flex-direction: column !important;
        gap: 8px !important;
        text-align: center !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// Initialize Course Player Manager
window.coursePlayerManager = new CoursePlayerManager();
