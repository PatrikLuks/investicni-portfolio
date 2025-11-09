/**
 * Accessibility JavaScript Helpers
 * Version: 1.0.0
 * WCAG 2.1 AA Compliance utilities
 */

class AccessibilityManager {
  constructor() {
    this.focusTrapStack = [];
    this.init();
  }

  init() {
    this.addSkipLink();
    this.enhanceKeyboardNavigation();
    this.announcePageChanges();
    this.addARIALabels();
  }

  // Add skip to main content link
  addSkipLink() {
    const skipLink = document.createElement("a");
    skipLink.href = "#main-content";
    skipLink.className = "skip-link";
    skipLink.textContent = "Přejít na hlavní obsah";
    skipLink.addEventListener("click", (e) => {
      e.preventDefault();
      const main =
        document.getElementById("main-content") ||
        document.querySelector("main");
      if (main) {
        main.tabIndex = -1;
        main.focus();
      }
    });
    document.body.insertBefore(skipLink, document.body.firstChild);
  }

  // Enhanced keyboard navigation
  enhanceKeyboardNavigation() {
    // Add keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Escape key - close modals/dialogs
      if (e.key === "Escape") {
        this.handleEscape();
      }

      // Tab key - ensure focus is visible
      if (e.key === "Tab") {
        document.body.classList.add("user-is-tabbing");
      }

      // Keyboard shortcuts with Alt key
      if (e.altKey) {
        switch (e.key) {
          case "h": {
            // Alt+H: Go to home/dashboard
            e.preventDefault();
            window.location.hash = "";
            break;
          }
          case "s": {
            // Alt+S: Focus search
            e.preventDefault();
            const search = document.getElementById("tableSearch");
            if (search) {
              search.focus();
            }
            break;
          }
          case "n": {
            // Alt+N: New portfolio item
            e.preventDefault();
            const addBtn = document.querySelector('button[type="submit"]');
            if (addBtn) {
              addBtn.click();
            }
            break;
          }
          default:
            break;
        }
      }
    });

    // Remove focus indicator on mouse click
    document.addEventListener("mousedown", () => {
      document.body.classList.remove("user-is-tabbing");
    });
  }

  // Announce dynamic content changes to screen readers
  announcePageChanges() {
    // Create live region for announcements
    const liveRegion = document.createElement("div");
    liveRegion.id = "aria-live-region";
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className = "sr-only";
    document.body.appendChild(liveRegion);

    // Monitor DOM changes and announce them
    // Note: MutationObserver is a global browser API
    /* global MutationObserver */
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          // Check if it's a meaningful change
          const addedElement = mutation.addedNodes[0];
          if (addedElement.nodeType === 1) {
            // Element node
            const announcement = this.getAnnouncementForElement(addedElement);
            if (announcement) {
              this.announce(announcement);
            }
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  getAnnouncementForElement(element) {
    // Toast notifications
    if (element.classList && element.classList.contains("toast")) {
      const title = element.querySelector(".toast-title")?.textContent;
      const message = element.querySelector(".toast-message")?.textContent;
      return `${title}. ${message}`;
    }

    // Table rows
    if (element.tagName === "TR") {
      return "Nový řádek byl přidán do tabulky";
    }

    // Cards
    if (element.classList && element.classList.contains("card")) {
      return "Nová sekce byla přidána";
    }

    return null;
  }

  announce(message, priority = "polite") {
    const liveRegion = document.getElementById("aria-live-region");
    if (liveRegion) {
      liveRegion.setAttribute("aria-live", priority);
      liveRegion.textContent = message;

      // Clear after 3 seconds
      setTimeout(() => {
        liveRegion.textContent = "";
      }, 3000);
    }
  }

  // Add ARIA labels to interactive elements
  addARIALabels() {
    // Buttons without labels
    document.querySelectorAll("button:not([aria-label])").forEach((btn) => {
      if (!btn.textContent.trim() && !btn.getAttribute("aria-label")) {
        // Try to infer label from icon or context
        const icon = btn.querySelector('[class*="icon"]');
        if (icon) {
          btn.setAttribute("aria-label", this.inferLabelFromIcon(icon));
        }
      }
    });

    // Form inputs without labels
    document.querySelectorAll("input:not([aria-label])").forEach((input) => {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (!label && !input.getAttribute("aria-label")) {
        const placeholder = input.getAttribute("placeholder");
        if (placeholder) {
          input.setAttribute("aria-label", placeholder);
        }
      }
    });

    // Tables
    document.querySelectorAll("table").forEach((table) => {
      if (!table.getAttribute("role")) {
        table.setAttribute("role", "table");
      }

      // Add caption if missing
      if (
        !table.querySelector("caption") &&
        !table.getAttribute("aria-label")
      ) {
        const prevHeading = table.previousElementSibling;
        if (prevHeading && /^H[1-6]$/.test(prevHeading.tagName)) {
          table.setAttribute(
            "aria-labelledby",
            prevHeading.id || this.generateId(),
          );
          if (!prevHeading.id) {
            prevHeading.id = table.getAttribute("aria-labelledby");
          }
        }
      }
    });
  }

  inferLabelFromIcon(icon) {
    const iconMap = {
      trash: "Smazat",
      delete: "Smazat",
      edit: "Upravit",
      pencil: "Upravit",
      save: "Uložit",
      close: "Zavřít",
      menu: "Menu",
      search: "Hledat",
      filter: "Filtrovat",
      sort: "Seřadit",
      download: "Stáhnout",
      upload: "Nahrát",
      print: "Tisknout",
      export: "Exportovat",
      import: "Importovat",
    };

    const iconClass = icon.className.toLowerCase();
    for (const [key, label] of Object.entries(iconMap)) {
      if (iconClass.includes(key)) {
        return label;
      }
    }

    return "Akce";
  }

  generateId() {
    return `a11y-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Handle Escape key
  handleEscape() {
    // Close any open modals
    const modals = document.querySelectorAll(
      '.modal, .dialog, [role="dialog"]',
    );
    modals.forEach((modal) => {
      if (modal.style.display !== "none") {
        modal.style.display = "none";
        this.announce("Dialog zavřen");
      }
    });

    // Release focus trap
    if (this.focusTrapStack.length > 0) {
      this.releaseFocusTrap();
    }
  }

  // Focus trap for modals
  trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      "a[href], button:not([disabled]), textarea:not([disabled]), " +
        'input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const trapHandler = (e) => {
      if (e.key !== "Tab") {
        return;
      }

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    };

    element.addEventListener("keydown", trapHandler);
    this.focusTrapStack.push({ element, handler: trapHandler });

    // Focus first element
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }

  releaseFocusTrap() {
    const trap = this.focusTrapStack.pop();
    if (trap) {
      trap.element.removeEventListener("keydown", trap.handler);
    }
  }

  // Check color contrast
  checkContrast(foreground, background) {
    const getLuminance = (color) => {
      const rgb = color.match(/\d+/g).map(Number);
      const [r, g, b] = rgb.map((val) => {
        val = val / 255;
        return val <= 0.03928
          ? val / 12.92
          : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };

    const l1 = getLuminance(foreground);
    const l2 = getLuminance(background);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    return {
      ratio: ratio.toFixed(2),
      passAA: ratio >= 4.5,
      passAAA: ratio >= 7,
    };
  }

  // Make element keyboard accessible
  makeKeyboardAccessible(element, onClick) {
    element.setAttribute("tabindex", "0");
    element.setAttribute("role", "button");

    element.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick(e);
      }
    });
  }
}

// Initialize accessibility manager
window.accessibilityManager = new AccessibilityManager();

// Announce helper function
window.announce = (message, priority = "polite") => {
  window.accessibilityManager.announce(message, priority);
};
