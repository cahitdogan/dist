/**
 * Auto-save functionality for article forms
 * Automatically saves form data to localStorage every 30 seconds
 */

class AutoSave {
    constructor(formId, storageKey, interval = 30000) {
        this.form = document.getElementById(formId);
        this.storageKey = storageKey;
        this.interval = interval;
        this.saveTimer = null;
        this.lastSaveTime = null;
        this.statusElement = null;

        if (!this.form) {
            console.error('AutoSave: Form not found');
            return;
        }

        this.init();
    }

    init() {
        // Create status indicator
        this.createStatusIndicator();

        // Load saved data on page load
        this.loadSavedData();

        // Start auto-save timer
        this.startAutoSave();

        // Save on form input
        this.form.addEventListener('input', () => {
            this.updateStatus('unsaved');
        });

        // Save before leaving page
        window.addEventListener('beforeunload', (e) => {
            this.saveFormData();
        });

        // Clear auto-save on successful form submission
        this.form.addEventListener('submit', () => {
            setTimeout(() => {
                this.clearSavedData();
            }, 1000);
        });
    }

    createStatusIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'autosave-status';
        indicator.innerHTML = `
            <i class="fa-solid fa-circle"></i>
            <span>Auto-save active</span>
        `;

        // Insert before form
        this.form.parentNode.insertBefore(indicator, this.form);
        this.statusElement = indicator;

        // Add styles
        if (!document.getElementById('autosave-styles')) {
            const style = document.createElement('style');
            style.id = 'autosave-styles';
            style.textContent = `
                #autosave-status {
                    display: flex;
                    align-items: center;
                    gap: 0.8rem;
                    padding: 1rem 1.5rem;
                    background-color: rgba(40, 167, 69, 0.1);
                    border-left: 3px solid #28a745;
                    border-radius: 0.5rem;
                    margin-bottom: 2rem;
                    font-size: 1.4rem;
                    color: #e0e0e0;
                    transition: all 0.3s ease;
                }

                #autosave-status i {
                    font-size: 1rem;
                    color: #28a745;
                }

                #autosave-status.saving {
                    background-color: rgba(255, 193, 7, 0.1);
                    border-left-color: #ffc107;
                }

                #autosave-status.saving i {
                    color: #ffc107;
                    animation: pulse-dot 1s ease-in-out infinite;
                }

                #autosave-status.unsaved {
                    background-color: rgba(220, 53, 69, 0.1);
                    border-left-color: #dc3545;
                }

                #autosave-status.unsaved i {
                    color: #dc3545;
                }

                @keyframes pulse-dot {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.3;
                    }
                }

                #autosave-restore {
                    display: none;
                    padding: 1.5rem;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 0.8rem;
                    margin-bottom: 2rem;
                    color: white;
                }

                #autosave-restore.show {
                    display: block;
                }

                #autosave-restore p {
                    margin: 0 0 1rem 0;
                    font-size: 1.5rem;
                    font-weight: 600;
                }

                #autosave-restore small {
                    display: block;
                    margin-bottom: 1.5rem;
                    opacity: 0.9;
                    font-size: 1.3rem;
                }

                #autosave-restore .restore-actions {
                    display: flex;
                    gap: 1rem;
                }

                #autosave-restore button {
                    padding: 0.8rem 1.5rem;
                    border: none;
                    border-radius: 0.5rem;
                    font-size: 1.4rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                #autosave-restore .btn-restore {
                    background-color: white;
                    color: #667eea;
                }

                #autosave-restore .btn-restore:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
                }

                #autosave-restore .btn-dismiss {
                    background-color: rgba(255, 255, 255, 0.2);
                    color: white;
                }

                #autosave-restore .btn-dismiss:hover {
                    background-color: rgba(255, 255, 255, 0.3);
                }
            `;
            document.head.appendChild(style);
        }
    }

    updateStatus(status) {
        if (!this.statusElement) return;

        this.statusElement.className = '';

        switch(status) {
            case 'saving':
                this.statusElement.classList.add('saving');
                this.statusElement.querySelector('span').textContent = 'Saving draft...';
                break;
            case 'saved':
                this.statusElement.querySelector('span').textContent = 'Draft saved at ' + this.formatTime(new Date());
                break;
            case 'unsaved':
                this.statusElement.classList.add('unsaved');
                this.statusElement.querySelector('span').textContent = 'Unsaved changes';
                break;
            default:
                this.statusElement.querySelector('span').textContent = 'Auto-save active';
        }
    }

    formatTime(date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    startAutoSave() {
        this.saveTimer = setInterval(() => {
            this.saveFormData();
        }, this.interval);
    }

    saveFormData() {
        this.updateStatus('saving');

        const formData = new FormData(this.form);
        const data = {};

        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            // Skip file inputs
            if (value instanceof File) continue;
            data[key] = value;
        }

        // Add timestamp
        data._autoSaveTimestamp = new Date().toISOString();

        // Save to localStorage
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            this.lastSaveTime = new Date();
            this.updateStatus('saved');
        } catch (error) {
            console.error('AutoSave: Failed to save', error);
        }
    }

    loadSavedData() {
        try {
            const savedData = localStorage.getItem(this.storageKey);

            if (!savedData) return;

            const data = JSON.parse(savedData);
            const timestamp = new Date(data._autoSaveTimestamp);

            // Check if saved data is less than 24 hours old
            const hoursDiff = (new Date() - timestamp) / (1000 * 60 * 60);

            if (hoursDiff > 24) {
                // Data too old, clear it
                this.clearSavedData();
                return;
            }

            // Show restore prompt
            this.showRestorePrompt(data, timestamp);

        } catch (error) {
            console.error('AutoSave: Failed to load saved data', error);
        }
    }

    showRestorePrompt(data, timestamp) {
        const restoreDiv = document.createElement('div');
        restoreDiv.id = 'autosave-restore';
        restoreDiv.className = 'show';
        restoreDiv.innerHTML = `
            <p><i class="fa-solid fa-clock-rotate-left"></i> Unsaved draft found</p>
            <small>Last saved: ${timestamp.toLocaleString()}</small>
            <div class="restore-actions">
                <button type="button" class="btn-restore">
                    <i class="fa-solid fa-rotate-left"></i> Restore Draft
                </button>
                <button type="button" class="btn-dismiss">
                    <i class="fa-solid fa-xmark"></i> Dismiss
                </button>
            </div>
        `;

        this.form.parentNode.insertBefore(restoreDiv, this.form);

        // Restore button
        restoreDiv.querySelector('.btn-restore').addEventListener('click', () => {
            this.restoreFormData(data);
            restoreDiv.remove();
        });

        // Dismiss button
        restoreDiv.querySelector('.btn-dismiss').addEventListener('click', () => {
            this.clearSavedData();
            restoreDiv.remove();
        });
    }

    restoreFormData(data) {
        // Populate form fields
        for (let [key, value] of Object.entries(data)) {
            if (key.startsWith('_')) continue; // Skip metadata fields

            const field = this.form.elements[key];
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = value === 'on' || value === true;
                } else if (field.type === 'radio') {
                    const radio = this.form.querySelector(`input[name="${key}"][value="${value}"]`);
                    if (radio) radio.checked = true;
                } else {
                    field.value = value;
                }

                // Trigger change event for any listeners
                field.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }

        this.updateStatus('saved');
    }

    clearSavedData() {
        localStorage.removeItem(this.storageKey);
    }

    destroy() {
        if (this.saveTimer) {
            clearInterval(this.saveTimer);
        }
    }
}

// Export for use in other scripts
window.AutoSave = AutoSave;
