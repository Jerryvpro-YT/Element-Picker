// ============================================================
// ELEMENT PICKER PRO - Clean Compact Design
// ============================================================

let isActive = false;
let panel = null;
let overlay = null;
let selectedData = null;

// ============================================================
// FONT AWESOME + EXO 2 INJECTION
// ============================================================

function injectFonts() {
  if (!document.getElementById('picker-fontawesome')) {
    const link = document.createElement('link');
    link.id = 'picker-fontawesome';
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css';
    document.head.appendChild(link);
  }
  
  if (!document.getElementById('picker-exo2')) {
    const link = document.createElement('link');
    link.id = 'picker-exo2';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Exo+2:wght@400;500;600;700&display=swap';
    document.head.appendChild(link);
  }
}

// ============================================================
// DETAILED SELECTOR GENERATION - FULL PATH
// ============================================================

function getDetailedSelector(element) {
  if (element.id) {
    return '#' + element.id;
  }
  
  let path = [];
  let current = element;
  let depth = 0;
  const maxDepth = 6;
  
  while (current && current !== document.body && depth < maxDepth) {
    let selector = current.tagName.toLowerCase();
    
    if (current.className && typeof current.className === 'string') {
      const classes = current.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) {
        selector += '.' + classes.join('.');
      }
    }
    
    if (current.parentElement) {
      const siblings = Array.from(current.parentElement.children);
      const index = siblings.indexOf(current) + 1;
      if (siblings.length > 1) {
        selector += `:nth-child(${index})`;
      }
    }
    
    path.unshift(selector);
    current = current.parentElement;
    depth++;
  }
  
  return path.join(' > ');
}

// ============================================================
// PANEL CREATION - COMPACT DESIGN
// ============================================================

function createPanel() {
  if (panel) {
    panel.style.display = 'block';
    return;
  }
  
  injectFonts();
  
  panel = document.createElement('div');
  panel.id = 'ep-panel';
  panel.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    z-index: 999999 !important;
    width: 380px !important;
    max-height: 85vh !important;
    background: #1e1e2e !important;
    border-radius: 12px !important;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important;
    font-family: 'Exo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif !important;
    font-size: 13px !important;
    border: 1px solid #313244 !important;
    user-select: none !important;
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
    color: #cdd6f4 !important;
  `;
  
  panel.innerHTML = `
    <!-- Header -->
    <div id="ep-header" style="
      background: #181825;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: move;
      flex-shrink: 0;
      border-bottom: 1px solid #313244;
    ">
      <span style="display: flex; align-items: center; gap: 10px; font-weight: 600; font-size: 14px; font-family: 'Exo 2', sans-serif;">
        <i class="fas fa-crosshairs" style="font-size: 14px; color: #89b4fa;"></i>
        <span style="color: #cdd6f4;">Element Picker</span>
      </span>
      <div style="display: flex; gap: 4px;">
        <button id="ep-min" style="
          background: transparent;
          border: none;
          color: #6c7086;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        ">
          <i class="fas fa-minus"></i>
        </button>
        <button id="ep-close" style="
          background: transparent;
          border: none;
          color: #6c7086;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        ">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    
    <!-- Body -->
    <div id="ep-body" style="
      padding: 14px 16px 16px 16px;
      overflow-y: auto;
      flex: 1;
      max-height: 520px;
    ">
      <!-- Toggle Button -->
      <button id="ep-toggle" style="
        width: 100%;
        padding: 10px;
        border: none;
        border-radius: 8px;
        background: #313244;
        color: #cdd6f4;
        font-size: 13px;
        font-weight: 600;
        font-family: 'Exo 2', sans-serif;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.3s ease;
        border: 1px solid #45475a;
      ">
        <i class="fas fa-play" style="font-size: 12px; color: #a6e3a1;"></i>
        Start Picking
      </button>
      
      <!-- Result -->
      <div id="ep-result" style="display: none; margin-top: 12px;">
        <!-- Tag - Compact pill (ONLY shows tag name, no ID) -->
        <div style="
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 10px;
        ">
          <span id="ep-tag" style="
            background: #313244;
            color: #a6e3a1;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            font-family: 'Exo 2', monospace;
            border: 1px solid #45475a;
          ">-</span>
        </div>
        
        <!-- ID Box - Always visible -->
        <div id="ep-id-box" style="
          background: #181825;
          border-radius: 8px;
          padding: 8px 12px;
          margin-bottom: 8px;
          border: 1px solid #313244;
          cursor: pointer;
          transition: all 0.2s;
        ">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <i class="fas fa-hashtag" style="font-size: 11px; color: #6c7086;"></i>
            <span style="font-size: 10px; color: #6c7086; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">ID</span>
            <span style="margin-left: auto; font-size: 9px; color: #6c7086; font-weight: 400;">
              <i class="fas fa-copy" style="font-size: 9px;"></i> Click to copy
            </span>
          </div>
          <div id="ep-id-display" style="
            font-family: 'Exo 2', monospace;
            font-size: 12px;
            padding: 6px 8px;
            margin-top: 2px;
            word-break: break-all;
            background: #11111b;
            border-radius: 6px;
            border: 1px solid #313244;
          ">-</div>
        </div>
        
        <!-- Classes Box - Full box with dark inner, click to copy -->
        <div id="ep-classes-box" style="
          background: #181825;
          border-radius: 8px;
          padding: 8px 12px;
          margin-bottom: 8px;
          border: 1px solid #313244;
          cursor: pointer;
          transition: all 0.2s;
        ">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <i class="fas fa-tags" style="font-size: 11px; color: #6c7086;"></i>
            <span style="font-size: 10px; color: #6c7086; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Classes</span>
            <span style="margin-left: auto; font-size: 9px; color: #6c7086; font-weight: 400;">
              <i class="fas fa-copy" style="font-size: 9px;"></i> Click to copy
            </span>
          </div>
          <div id="ep-classes-display" style="
            font-family: 'Exo 2', monospace;
            font-size: 12px;
            color: #cdd6f4;
            padding: 6px 8px;
            margin-top: 2px;
            word-break: break-all;
            background: #11111b;
            border-radius: 6px;
            border: 1px solid #313244;
          ">-</div>
        </div>
        
        <!-- Selector Box - Full box with dark inner, click to copy -->
        <div id="ep-selector-box" style="
          background: #181825;
          border-radius: 8px;
          padding: 8px 12px;
          border: 1px solid #313244;
          cursor: pointer;
          transition: all 0.2s;
        ">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <i class="fas fa-code" style="font-size: 11px; color: #6c7086;"></i>
            <span style="font-size: 10px; color: #6c7086; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Selector</span>
            <span style="margin-left: auto; font-size: 9px; color: #6c7086; font-weight: 400;">
              <i class="fas fa-copy" style="font-size: 9px;"></i> Click to copy
            </span>
          </div>
          <div id="ep-selector-display" style="
            font-family: 'Exo 2', monospace;
            font-size: 11px;
            color: #cdd6f4;
            padding: 8px 10px;
            margin-top: 2px;
            word-break: break-all;
            max-height: 150px;
            overflow-y: auto;
            line-height: 1.8;
            background: #11111b;
            border-radius: 6px;
            border: 1px solid #313244;
          ">
            <span style="color: #6c7086;">Click an element to see its selector</span>
          </div>
        </div>
      </div>
      
      <!-- Help Text -->
      <div style="
        margin-top: 12px;
        font-size: 10px;
        color: #6c7086;
        text-align: center;
        padding: 6px;
        background: #181825;
        border-radius: 6px;
        border: 1px solid #313244;
        font-family: 'Exo 2', sans-serif;
      ">
        <i class="fas fa-mouse-pointer" style="font-size: 10px;"></i>
        Click to inspect &nbsp;·&nbsp;
        <kbd style="
          background: #313244;
          padding: 0px 8px;
          border-radius: 4px;
          font-size: 9px;
          font-weight: 700;
          color: #cdd6f4;
          font-family: 'Exo 2', monospace;
          border: 1px solid #45475a;
        ">ESC</kbd> to stop &nbsp;&nbsp;
      </div>
    </div>
  `;
  
  document.body.appendChild(panel);
  
  // Custom scrollbar styles + hover effects
  const style = document.createElement('style');
  style.textContent = `
    #ep-body::-webkit-scrollbar {
      width: 4px;
    }
    #ep-body::-webkit-scrollbar-track {
      background: transparent;
    }
    #ep-body::-webkit-scrollbar-thumb {
      background: #313244;
      border-radius: 4px;
    }
    #ep-body::-webkit-scrollbar-thumb:hover {
      background: #45475a;
    }
    
    #ep-selector-display::-webkit-scrollbar {
      width: 4px;
    }
    #ep-selector-display::-webkit-scrollbar-track {
      background: transparent;
    }
    #ep-selector-display::-webkit-scrollbar-thumb {
      background: #313244;
      border-radius: 4px;
    }
    #ep-selector-display::-webkit-scrollbar-thumb:hover {
      background: #45475a;
    }
    
    #ep-body, #ep-selector-display {
      scrollbar-width: thin;
      scrollbar-color: #313244 transparent;
    }
    
    #ep-min:hover, #ep-close:hover {
      background: #313244 !important;
      color: #cdd6f4 !important;
    }
    #ep-toggle:hover {
      background: #45475a !important;
      border-color: #a6e3a1 !important;
    }
    
    #ep-id-box:hover {
      border-color: #89b4fa !important;
      box-shadow: 0 0 20px rgba(137, 180, 250, 0.05) !important;
    }
    #ep-classes-box:hover {
      border-color: #a6e3a1 !important;
      box-shadow: 0 0 20px rgba(166, 227, 161, 0.05) !important;
    }
    #ep-selector-box:hover {
      border-color: #89b4fa !important;
      box-shadow: 0 0 20px rgba(137, 180, 250, 0.05) !important;
    }
  `;
  panel.appendChild(style);
  
  setupEvents();
  setupDrag();
  
  chrome.storage.local.get(['ep-lastData'], (r) => {
    if (r['ep-lastData']) {
      selectedData = r['ep-lastData'];
      showResult(r['ep-lastData']);
    }
  });
}

// ============================================================
// EVENTS
// ============================================================

function setupEvents() {
  const toggleBtn = document.getElementById('ep-toggle');
  if (toggleBtn) {
    toggleBtn.onclick = function(e) {
      e.stopPropagation();
      isActive = !isActive;
      chrome.storage.local.set({ 'ep-isActive': isActive });
      updateButton();
      if (isActive) startPicking();
      else stopPicking();
    };
  }
  
  const closeBtn = document.getElementById('ep-close');
  if (closeBtn) {
    closeBtn.onclick = function(e) {
      e.stopPropagation();
      if (panel) { panel.style.display = 'none'; }
      if (isActive) { isActive = false; stopPicking(); }
      chrome.storage.local.set({ 'ep-panelVisible': false });
    };
  }
  
  const minBtn = document.getElementById('ep-min');
  if (minBtn) {
    minBtn.onclick = function(e) {
      e.stopPropagation();
      const body = document.getElementById('ep-body');
      const icon = this.querySelector('i');
      if (body.style.display === 'none') {
        body.style.display = 'block';
        icon.className = 'fas fa-minus';
      } else {
        body.style.display = 'none';
        icon.className = 'fas fa-plus';
      }
    };
  }
  
  // Click on ID box to copy ID
  const idBox = document.getElementById('ep-id-box');
  if (idBox) {
    idBox.onclick = function(e) {
      e.stopPropagation();
      if (selectedData && selectedData.id) {
        copyText(selectedData.id, 'ID copied!');
      } else {
        showToast('No ID to copy', '#f38ba8');
      }
    };
  }
  
  // Click on Classes box to copy classes
  const classesBox = document.getElementById('ep-classes-box');
  if (classesBox) {
    classesBox.onclick = function(e) {
      e.stopPropagation();
      if (selectedData && selectedData.classes.length) {
        copyText(selectedData.classes.join(' '), 'Classes copied!');
      } else {
        showToast('No classes to copy', '#f38ba8');
      }
    };
  }
  
  // Click on Selector box to copy selector
  const selectorBox = document.getElementById('ep-selector-box');
  if (selectorBox) {
    selectorBox.onclick = function(e) {
      e.stopPropagation();
      if (selectedData && selectedData.selector) {
        copyText(selectedData.selector, 'Selector copied!');
      } else {
        showToast('No element selected', '#f38ba8');
      }
    };
  }
}

// ============================================================
// DRAG
// ============================================================

function setupDrag() {
  const header = document.getElementById('ep-header');
  if (!header) return;
  let dragging = false, ox, oy;
  header.onmousedown = function(e) {
    if (e.target.closest('button')) return;
    dragging = true;
    const r = panel.getBoundingClientRect();
    ox = e.clientX - r.left;
    oy = e.clientY - r.top;
    panel.style.cursor = 'grabbing';
    e.preventDefault();
  };
  document.onmousemove = function(e) {
    if (!dragging || !panel) return;
    panel.style.left = (e.clientX - ox) + 'px';
    panel.style.top = (e.clientY - oy) + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  };
  document.onmouseup = function() {
    if (dragging && panel) panel.style.cursor = '';
    dragging = false;
  };
}

// ============================================================
// UI UPDATES
// ============================================================

function updateButton() {
  const btn = document.getElementById('ep-toggle');
  if (!btn) return;
  
  if (isActive) {
    btn.innerHTML = '<i class="fas fa-stop" style="font-size: 12px; color: #f38ba8;"></i> Stop Picking';
    btn.style.background = '#313244';
    btn.style.borderColor = '#f38ba8';
    btn.style.color = '#f38ba8';
  } else {
    btn.innerHTML = '<i class="fas fa-play" style="font-size: 12px; color: #a6e3a1;"></i> Start Picking';
    btn.style.background = '#313244';
    btn.style.borderColor = '#45475a';
    btn.style.color = '#cdd6f4';
  }
}

function showToast(msg, color = '#a6e3a1') {
  const existing = document.getElementById('ep-toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.id = 'ep-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: #181825;
    color: #cdd6f4;
    padding: 10px 20px;
    border-radius: 10px;
    font-family: 'Exo 2', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    font-size: 13px;
    z-index: 9999999;
    box-shadow: 0 4px 30px rgba(0,0,0,0.6);
    border: 1px solid #313244;
    font-weight: 500;
    max-width: 90%;
    text-align: center;
    animation: slideUp 0.3s ease;
  `;
  toast.innerHTML = `<span style="color: ${color}; margin-right: 8px;">●</span> ${msg}`;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

function showResult(data) {
  selectedData = data;
  
  // Tag - ONLY shows tag name
  const tag = document.getElementById('ep-tag');
  if (tag) tag.textContent = data.tagName || '-';
  
  // ID - Always visible in its own box
  const idDisplay = document.getElementById('ep-id-display');
  if (idDisplay) {
    idDisplay.textContent = data.id ? '#' + data.id : '(no id)';
  }
  
  // Classes
  const classesDisplay = document.getElementById('ep-classes-display');
  if (classesDisplay) classesDisplay.textContent = data.classes.length ? data.classes.join(' ') : '(no classes)';
  
  // Selector
  const selectorDisplay = document.getElementById('ep-selector-display');
  if (selectorDisplay) {
    selectorDisplay.textContent = data.selector || '-';
    selectorDisplay.scrollTop = 0;
  }
  
  // Show result
  const result = document.getElementById('ep-result');
  if (result) result.style.display = 'block';
  
  chrome.storage.local.set({ 'ep-lastData': data });
  showToast('Element picked!', '#a6e3a1');
}

function copyText(text, msg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(msg, '#a6e3a1');
    });
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;left:-9999px;';
    document.body.appendChild(ta);
    ta.select();
    try { 
      document.execCommand('copy'); 
      showToast(msg, '#a6e3a1');
    } catch(e) { 
      showToast('Failed to copy', '#f38ba8');
    }
    document.body.removeChild(ta);
  }
}

// ============================================================
// PICKING LOGIC
// ============================================================

function createOverlay() {
  if (overlay) return;
  overlay = document.createElement('div');
  overlay.id = 'ep-overlay';
  overlay.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 999998;
    background: rgba(137, 180, 250, 0.06);
    border: 2px solid #89b4fa;
    border-radius: 6px;
    display: none;
    box-shadow: 0 0 30px rgba(137, 180, 250, 0.05);
    transition: all 0.05s ease;
  `;
  document.body.appendChild(overlay);
}

function getAllClasses(el) {
  const all = [];
  let cur = el;
  let depth = 0;
  while (cur && cur !== document.body && depth < 4) {
    if (cur.className && typeof cur.className === 'string') {
      cur.className.split(' ').filter(x => x.trim()).forEach(c => all.push(c));
    }
    cur = cur.parentElement;
    depth++;
  }
  return [...new Set(all)];
}

function updateOverlayPosition(target) {
  if (!overlay || !target) return;
  
  const rect = target.getBoundingClientRect();
  overlay.style.display = 'block';
  overlay.style.top = rect.top + 'px';
  overlay.style.left = rect.left + 'px';
  overlay.style.width = rect.width + 'px';
  overlay.style.height = rect.height + 'px';
  overlay._lastTarget = target;
}

function onMouseMove(e) {
  if (!isActive) return;
  const target = e.target;
  if (target.closest('#ep-panel') || target === overlay) return;
  
  updateOverlayPosition(target);
  document.body.style.cursor = 'pointer';
}

function onScroll(e) {
  if (!isActive || !overlay || overlay.style.display === 'none') return;
  
  const lastTarget = overlay._lastTarget;
  if (lastTarget && document.contains(lastTarget)) {
    updateOverlayPosition(lastTarget);
  }
}

function onElementClick(e) {
  if (!isActive) return;
  const target = e.target;
  if (target.closest('#ep-panel')) return;
  
  e.preventDefault();
  e.stopPropagation();
  
  const classes = target.className ? target.className.split(' ').filter(x => x.trim()) : [];
  const data = {
    tagName: target.tagName.toLowerCase(),
    classes: classes,
    allClasses: getAllClasses(target),
    id: target.id || null,
    selector: getDetailedSelector(target),
    innerText: target.innerText?.substring(0, 100) || ''
  };
  
  showResult(data);
  
  const orig = target.style.background;
  target.style.transition = 'background 0.15s';
  target.style.background = 'rgba(137, 180, 250, 0.08)';
  setTimeout(() => { target.style.background = orig || ''; }, 400);
}

function onKeyDown(e) {
  if (e.key === 'Escape' && isActive) {
    isActive = false;
    chrome.storage.local.set({ 'ep-isActive': false });
    stopPicking();
    updateButton();
    showToast('Picker stopped', '#89b4fa');
  }
}

function startPicking() {
  createOverlay();
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('click', onElementClick, true);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('scroll', onScroll, true);
  window.addEventListener('scroll', onScroll, true);
  showToast('Click any element to inspect', '#89b4fa');
}

function stopPicking() {
  document.removeEventListener('mousemove', onMouseMove);
  document.removeEventListener('click', onElementClick, true);
  document.removeEventListener('keydown', onKeyDown);
  document.removeEventListener('scroll', onScroll, true);
  window.removeEventListener('scroll', onScroll, true);
  if (overlay) {
    overlay.style.display = 'none';
    overlay._lastTarget = null;
  }
  document.body.style.cursor = '';
}

// ============================================================
// MESSAGE HANDLER
// ============================================================

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.action === 'toggle') {
    if (panel) {
      if (panel.style.display === 'none') {
        panel.style.display = 'block';
        chrome.storage.local.set({ 'ep-panelVisible': true });
      } else {
        panel.remove();
        panel = null;
        if (isActive) { isActive = false; stopPicking(); }
        chrome.storage.local.set({ 'ep-panelVisible': false });
      }
    } else {
      createPanel();
      chrome.storage.local.set({ 'ep-panelVisible': true });
    }
    sendResponse({ status: 'done' });
  }
  return true;
});

// ============================================================
// INIT
// ============================================================

injectFonts();

chrome.storage.local.get(['ep-panelVisible', 'ep-isActive'], (r) => {
  if (r['ep-panelVisible']) createPanel();
  if (r['ep-isActive']) {
    isActive = true;
    startPicking();
    setTimeout(updateButton, 100);
  }
});