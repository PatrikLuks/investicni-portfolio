/**
 * Command Pattern Implementation for Undo/Redo
 * Version: 1.0.0
 * Features: Unlimited history, keyboard shortcuts, visual timeline
 */

class Command {
  constructor(execute, undo, description = "") {
    this.execute = execute;
    this.undo = undo;
    this.description = description;
    this.timestamp = new Date();
  }
}

class CommandStack {
  constructor(maxSize = 50) {
    this.history = [];
    this.currentIndex = -1;
    this.maxSize = maxSize;
    this.isExecuting = false;
  }

  execute(command) {
    if (this.isExecuting) {
      return;
    } // Prevent nested execution

    this.isExecuting = true;

    try {
      // Execute the command
      command.execute();

      // Remove any commands after current index (redo history)
      this.history = this.history.slice(0, this.currentIndex + 1);

      // Add new command
      this.history.push(command);
      this.currentIndex++;

      // Limit history size
      if (this.history.length > this.maxSize) {
        this.history.shift();
        this.currentIndex--;
      }

      this.updateUI();
    } catch (error) {
      console.error("Command execution failed:", error);
      if (window.errorHandler) {
        window.errorHandler.handleError({
          message: `Command failed: ${error.message}`,
          error: error,
        });
      }
    } finally {
      this.isExecuting = false;
    }
  }

  undo() {
    if (!this.canUndo()) {
      return false;
    }

    this.isExecuting = true;

    try {
      const command = this.history[this.currentIndex];
      command.undo();
      this.currentIndex--;

      this.updateUI();

      if (typeof announce === "function") {
        announce(`Vráceno: ${command.description}`);
      }

      return true;
    } catch (error) {
      console.error("Undo failed:", error);
      return false;
    } finally {
      this.isExecuting = false;
    }
  }

  redo() {
    if (!this.canRedo()) {
      return false;
    }

    this.isExecuting = true;

    try {
      this.currentIndex++;
      const command = this.history[this.currentIndex];
      command.execute();

      this.updateUI();

      if (typeof announce === "function") {
        announce(`Znovu provedeno: ${command.description}`);
      }

      return true;
    } catch (error) {
      console.error("Redo failed:", error);
      this.currentIndex--;
      return false;
    } finally {
      this.isExecuting = false;
    }
  }

  canUndo() {
    return this.currentIndex >= 0;
  }

  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  clear() {
    this.history = [];
    this.currentIndex = -1;
    this.updateUI();
  }

  getHistory() {
    return this.history.map((cmd, index) => ({
      description: cmd.description,
      timestamp: cmd.timestamp,
      isCurrent: index === this.currentIndex,
    }));
  }

  updateUI() {
    // Update undo/redo button states
    const undoBtn = document.getElementById("undoBtn");
    const redoBtn = document.getElementById("redoBtn");

    if (undoBtn) {
      undoBtn.disabled = !this.canUndo();
      undoBtn.title = this.canUndo()
        ? `Vrátit: ${this.history[this.currentIndex]?.description}`
        : "Není co vrátit";
    }

    if (redoBtn) {
      redoBtn.disabled = !this.canRedo();
      redoBtn.title = this.canRedo()
        ? `Znovu: ${this.history[this.currentIndex + 1]?.description}`
        : "Není co znovu provést";
    }

    // Update history timeline if visible
    this.updateHistoryTimeline();
  }

  updateHistoryTimeline() {
    const timeline = document.getElementById("historyTimeline");
    if (!timeline) {
      return;
    }

    timeline.innerHTML = "";

    this.history.forEach((cmd, index) => {
      const item = document.createElement("div");
      item.className = `history-item ${index === this.currentIndex ? "current" : ""} ${index > this.currentIndex ? "future" : "past"}`;
      item.innerHTML = `
                <div class="history-icon">${index === this.currentIndex ? "●" : "○"}</div>
                <div class="history-content">
                    <div class="history-description">${cmd.description}</div>
                    <div class="history-time">${this.formatTime(cmd.timestamp)}</div>
                </div>
            `;

      item.addEventListener("click", () => {
        this.jumpToIndex(index);
      });

      timeline.appendChild(item);
    });
  }

  jumpToIndex(targetIndex) {
    if (targetIndex < 0 || targetIndex >= this.history.length) {
      return;
    }

    while (this.currentIndex > targetIndex) {
      this.undo();
    }

    while (this.currentIndex < targetIndex) {
      this.redo();
    }
  }

  formatTime(date) {
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) {
      return "Právě teď";
    }
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)} min. zpět`;
    }
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)} hod. zpět`;
    }
    return date.toLocaleString("cs-CZ");
  }
}

// Portfolio-specific commands
class AddFondCommand extends Command {
  constructor(fondData) {
    const execute = () => {
      portfolioData.push(fondData);
      if (typeof updateFondTable === "function") {
        updateFondTable();
      }
      if (typeof updateDashboard === "function") {
        updateDashboard();
      }
      if (typeof storage !== "undefined") {
        storage.saveData(portfolioData);
      }
    };

    const undo = () => {
      const index = portfolioData.findIndex((f) => f === fondData);
      if (index > -1) {
        portfolioData.splice(index, 1);
        if (typeof updateFondTable === "function") {
          updateFondTable();
        }
        if (typeof updateDashboard === "function") {
          updateDashboard();
        }
        if (typeof storage !== "undefined") {
          storage.saveData(portfolioData);
        }
      }
    };

    super(execute, undo, `Přidán fond: ${fondData.name}`);
    this.fondData = fondData;
  }
}

class DeleteFondCommand extends Command {
  constructor(index) {
    const fondData = portfolioData[index];

    const execute = () => {
      portfolioData.splice(index, 1);
      if (typeof updateFondTable === "function") {
        updateFondTable();
      }
      if (typeof updateDashboard === "function") {
        updateDashboard();
      }
      if (typeof storage !== "undefined") {
        storage.saveData(portfolioData);
      }
    };

    const undo = () => {
      portfolioData.splice(index, 0, fondData);
      if (typeof updateFondTable === "function") {
        updateFondTable();
      }
      if (typeof updateDashboard === "function") {
        updateDashboard();
      }
      if (typeof storage !== "undefined") {
        storage.saveData(portfolioData);
      }
    };

    super(execute, undo, `Smazán fond: ${fondData.name}`);
    this.fondData = fondData;
    this.index = index;
  }
}

class EditFondCommand extends Command {
  constructor(index, oldData, newData) {
    const execute = () => {
      portfolioData[index] = { ...newData };
      if (typeof updateFondTable === "function") {
        updateFondTable();
      }
      if (typeof updateDashboard === "function") {
        updateDashboard();
      }
      if (typeof storage !== "undefined") {
        storage.saveData(portfolioData);
      }
    };

    const undo = () => {
      portfolioData[index] = { ...oldData };
      if (typeof updateFondTable === "function") {
        updateFondTable();
      }
      if (typeof updateDashboard === "function") {
        updateDashboard();
      }
      if (typeof storage !== "undefined") {
        storage.saveData(portfolioData);
      }
    };

    super(execute, undo, `Upraven fond: ${newData.name}`);
    this.index = index;
    this.oldData = oldData;
    this.newData = newData;
  }
}

class BulkDeleteCommand extends Command {
  constructor(indices) {
    const fondsToDelete = indices
      .map((i) => ({ index: i, data: portfolioData[i] }))
      .sort((a, b) => b.index - a.index); // Sort descending

    const execute = () => {
      fondsToDelete.forEach(({ index }) => {
        portfolioData.splice(index, 1);
      });
      if (typeof updateFondTable === "function") {
        updateFondTable();
      }
      if (typeof updateDashboard === "function") {
        updateDashboard();
      }
      if (typeof storage !== "undefined") {
        storage.saveData(portfolioData);
      }
    };

    const undo = () => {
      fondsToDelete.reverse().forEach(({ index, data }) => {
        portfolioData.splice(index, 0, data);
      });
      if (typeof updateFondTable === "function") {
        updateFondTable();
      }
      if (typeof updateDashboard === "function") {
        updateDashboard();
      }
      if (typeof storage !== "undefined") {
        storage.saveData(portfolioData);
      }
    };

    super(execute, undo, `Smazáno ${indices.length} fondů`);
    this.fondsToDelete = fondsToDelete;
  }
}

// Initialize command stack
window.commandStack = new CommandStack();

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl+Z or Cmd+Z - Undo
  if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
    e.preventDefault();
    window.commandStack.undo();
  }

  // Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z - Redo
  if (
    (e.ctrlKey || e.metaKey) &&
    (e.key === "y" || (e.shiftKey && e.key === "z"))
  ) {
    e.preventDefault();
    window.commandStack.redo();
  }

  // Ctrl+H - Show history
  if ((e.ctrlKey || e.metaKey) && e.key === "h" && !e.shiftKey) {
    e.preventDefault();
    toggleHistoryPanel();
  }
});

// Create undo/redo UI buttons
function createUndoRedoButtons() {
  const container = document.querySelector(".card h1");
  if (!container) {
    return;
  }

  const buttonGroup = document.createElement("div");
  buttonGroup.style.cssText = `
        display: inline-flex;
        gap: 8px;
        margin-left: 16px;
        vertical-align: middle;
    `;

  const undoBtn = document.createElement("button");
  undoBtn.id = "undoBtn";
  undoBtn.innerHTML = "↩️ Vrátit";
  undoBtn.disabled = true;
  undoBtn.style.cssText = `
        padding: 6px 12px;
        font-size: 0.875rem;
        background: #6b7280;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
    `;
  undoBtn.onclick = () => window.commandStack.undo();

  const redoBtn = document.createElement("button");
  redoBtn.id = "redoBtn";
  redoBtn.innerHTML = "↪️ Znovu";
  redoBtn.disabled = true;
  redoBtn.style.cssText = undoBtn.style.cssText;
  redoBtn.onclick = () => window.commandStack.redo();

  const historyBtn = document.createElement("button");
  historyBtn.innerHTML = "📜";
  historyBtn.title = "Zobrazit historii (Ctrl+H)";
  historyBtn.style.cssText = undoBtn.style.cssText;
  historyBtn.onclick = toggleHistoryPanel;

  buttonGroup.appendChild(undoBtn);
  buttonGroup.appendChild(redoBtn);
  buttonGroup.appendChild(historyBtn);

  container.appendChild(buttonGroup);
}

// History panel
function toggleHistoryPanel() {
  let panel = document.getElementById("historyPanel");

  if (panel) {
    panel.remove();
    return;
  }

  panel = document.createElement("div");
  panel.id = "historyPanel";
  panel.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        width: 320px;
        max-height: 500px;
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        z-index: 10000;
        overflow: hidden;
        animation: slideInRight 0.3s ease-out;
    `;

  panel.innerHTML = `
        <div style="padding: 16px; border-bottom: 1px solid #e0e0e0; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 1rem;">Historie změn</h3>
            <button class="close-history-btn"
                    style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #666;">×</button>
        </div>
        <div id="historyTimeline" style="max-height: 400px; overflow-y: auto; padding: 12px;"></div>
        <div style="padding: 12px; border-top: 1px solid #e0e0e0; display: flex; gap: 8px;">
            <button class="clear-history-btn"
                    style="flex: 1; padding: 8px; background: #dc2626; color: white; border: none; border-radius: 6px; cursor: pointer;">
                Vymazat historii
            </button>
        </div>
    `;

  document.body.appendChild(panel);

  // Add event listeners
  panel
    .querySelector(".close-history-btn")
    .addEventListener("click", () => panel.remove());
  panel.querySelector(".clear-history-btn").addEventListener("click", () => {
    window.commandStack.clear();
    panel.remove();
  });

  window.commandStack.updateHistoryTimeline();
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", createUndoRedoButtons);
} else {
  setTimeout(createUndoRedoButtons, 1000);
}

// Add history item styles
const commandStackStyle = document.createElement("style");
commandStackStyle.textContent = `
    .history-item {
        display: flex;
        gap: 12px;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
    }
    
    .history-item:hover {
        background: #f3f4f6;
    }
    
    .history-item.current {
        background: #dbeafe;
        border-left: 3px solid #2563eb;
    }
    
    .history-item.future {
        opacity: 0.5;
    }
    
    .history-icon {
        font-size: 1.2rem;
        color: #6b7280;
    }
    
    .history-item.current .history-icon {
        color: #2563eb;
    }
    
    .history-content {
        flex: 1;
    }
    
    .history-description {
        font-size: 0.875rem;
        font-weight: 500;
        color: #1f2937;
        margin-bottom: 2px;
    }
    
    .history-time {
        font-size: 0.75rem;
        color: #6b7280;
    }
`;
document.head.appendChild(commandStackStyle);
