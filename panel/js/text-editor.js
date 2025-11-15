/**
 * Rich Text Editor Toolbar
 * Adds markup buttons for formatting content
 */

class TextEditor {
    constructor(textareaId) {
        this.textarea = document.getElementById(textareaId);
        if (!this.textarea) {
            console.error('TextEditor: Textarea not found');
            return;
        }

        this.init();
    }

    init() {
        this.createToolbar();
        this.addStyles();
    }

    createToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'text-editor-toolbar';
        toolbar.innerHTML = `
            <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-action="bold" title="Bold (Ctrl+B)">
                    <i class="fa-solid fa-bold"></i>
                </button>
                <button type="button" class="toolbar-btn" data-action="italic" title="Italic (Ctrl+I)">
                    <i class="fa-solid fa-italic"></i>
                </button>
                <button type="button" class="toolbar-btn" data-action="underline" title="Underline (Ctrl+U)">
                    <i class="fa-solid fa-underline"></i>
                </button>
            </div>

            <div class="toolbar-divider"></div>

            <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-action="h1" title="Heading 1">
                    <strong>H1</strong>
                </button>
                <button type="button" class="toolbar-btn" data-action="h2" title="Heading 2">
                    <strong>H2</strong>
                </button>
                <button type="button" class="toolbar-btn" data-action="h3" title="Heading 3">
                    <strong>H3</strong>
                </button>
                <button type="button" class="toolbar-btn" data-action="paragraph" title="Paragraph">
                    <i class="fa-solid fa-paragraph"></i>
                </button>
            </div>

            <div class="toolbar-divider"></div>

            <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-action="ul" title="Unordered List">
                    <i class="fa-solid fa-list-ul"></i>
                </button>
                <button type="button" class="toolbar-btn" data-action="ol" title="Ordered List">
                    <i class="fa-solid fa-list-ol"></i>
                </button>
            </div>

            <div class="toolbar-divider"></div>

            <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-action="link" title="Insert Link">
                    <i class="fa-solid fa-link"></i>
                </button>
                <button type="button" class="toolbar-btn" data-action="image" title="Insert Image">
                    <i class="fa-solid fa-image"></i>
                </button>
                <button type="button" class="toolbar-btn" data-action="blockquote" title="Blockquote">
                    <i class="fa-solid fa-quote-left"></i>
                </button>
                <button type="button" class="toolbar-btn" data-action="hr" title="Horizontal Rule">
                    <i class="fa-solid fa-minus"></i>
                </button>
            </div>

            <div class="toolbar-divider"></div>

            <div class="toolbar-group">
                <button type="button" class="toolbar-btn" data-action="table" title="Insert Table">
                    <i class="fa-solid fa-table"></i>
                </button>
                <button type="button" class="toolbar-btn" data-action="code" title="Code Block">
                    <i class="fa-solid fa-code"></i>
                </button>
            </div>
        `;

        // Insert toolbar before textarea
        this.textarea.parentNode.insertBefore(toolbar, this.textarea);

        // Add event listeners
        toolbar.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.executeAction(action);
            });
        });

        // Add keyboard shortcuts
        this.textarea.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault();
                        this.executeAction('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.executeAction('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        this.executeAction('underline');
                        break;
                }
            }
        });
    }

    executeAction(action) {
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;
        const selectedText = this.textarea.value.substring(start, end);
        const beforeText = this.textarea.value.substring(0, start);
        const afterText = this.textarea.value.substring(end);

        let newText = '';
        let cursorPos = start;

        switch(action) {
            case 'bold':
                newText = `<b>${selectedText || 'bold text'}</b>`;
                cursorPos = start + 3;
                break;

            case 'italic':
                newText = `<i>${selectedText || 'italic text'}</i>`;
                cursorPos = start + 3;
                break;

            case 'underline':
                newText = `<u>${selectedText || 'underlined text'}</u>`;
                cursorPos = start + 3;
                break;

            case 'h1':
                newText = `<h1>${selectedText || 'Heading 1'}</h1>\n\n`;
                cursorPos = start + 4;
                break;

            case 'h2':
                newText = `<h2>${selectedText || 'Heading 2'}</h2>\n\n`;
                cursorPos = start + 4;
                break;

            case 'h3':
                newText = `<h3>${selectedText || 'Heading 3'}</h3>\n\n`;
                cursorPos = start + 4;
                break;

            case 'paragraph':
                newText = `<p>${selectedText || 'Paragraph text here...'}</p>\n\n`;
                cursorPos = start + 3;
                break;

            case 'ul':
                newText = `<ul>\n    <li>${selectedText || 'List item 1'}</li>\n    <li>List item 2</li>\n    <li>List item 3</li>\n</ul>\n\n`;
                cursorPos = start + 13;
                break;

            case 'ol':
                newText = `<ol>\n    <li>${selectedText || 'List item 1'}</li>\n    <li>List item 2</li>\n    <li>List item 3</li>\n</ol>\n\n`;
                cursorPos = start + 13;
                break;

            case 'link':
                const url = prompt('Enter URL:', 'https://');
                if (url) {
                    newText = `<a href="${url}">${selectedText || 'link text'}</a>`;
                    cursorPos = start + newText.length;
                } else {
                    return;
                }
                break;

            case 'image':
                const imgUrl = prompt('Enter image URL:', 'https://');
                if (imgUrl) {
                    const altText = prompt('Enter alt text (optional):', 'Image description');
                    newText = `<img src="${imgUrl}" alt="${altText || ''}">\n\n`;
                    cursorPos = start + newText.length;
                } else {
                    return;
                }
                break;

            case 'blockquote':
                newText = `<blockquote>\n    ${selectedText || 'Quote text here...'}\n</blockquote>\n\n`;
                cursorPos = start + 17;
                break;

            case 'hr':
                newText = `<hr>\n\n`;
                cursorPos = start + newText.length;
                break;

            case 'table':
                newText = `<table>\n    <thead>\n        <tr>\n            <th>Header 1</th>\n            <th>Header 2</th>\n            <th>Header 3</th>\n        </tr>\n    </thead>\n    <tbody>\n        <tr>\n            <td>Row 1, Col 1</td>\n            <td>Row 1, Col 2</td>\n            <td>Row 1, Col 3</td>\n        </tr>\n        <tr>\n            <td>Row 2, Col 1</td>\n            <td>Row 2, Col 2</td>\n            <td>Row 2, Col 3</td>\n        </tr>\n    </tbody>\n</table>\n\n`;
                cursorPos = start + newText.length;
                break;

            case 'code':
                newText = `<pre><code>\n${selectedText || 'Your code here...'}\n</code></pre>\n\n`;
                cursorPos = start + 12;
                break;

            default:
                return;
        }

        // Insert the new text
        this.textarea.value = beforeText + newText + afterText;

        // Set cursor position
        this.textarea.focus();
        this.textarea.setSelectionRange(cursorPos, cursorPos);

        // Trigger input event for auto-save and word count
        this.textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }

    addStyles() {
        if (document.getElementById('text-editor-styles')) return;

        const style = document.createElement('style');
        style.id = 'text-editor-styles';
        style.textContent = `
            .text-editor-toolbar {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                padding: 1rem;
                background: linear-gradient(135deg, #2a2a2e 0%, #25252a 100%);
                border: 1px solid #3a3a3e;
                border-radius: 0.8rem 0.8rem 0 0;
                margin-bottom: 0;
            }

            .toolbar-group {
                display: flex;
                gap: 0.3rem;
            }

            .toolbar-divider {
                width: 1px;
                background-color: #3a3a3e;
                margin: 0 0.5rem;
            }

            .toolbar-btn {
                padding: 0.8rem 1rem;
                background-color: #1a1a1d;
                color: #e0e0e0;
                border: 1px solid #3a3a3e;
                border-radius: 0.5rem;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 1.4rem;
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 3.6rem;
                height: 3.6rem;
            }

            .toolbar-btn:hover {
                background-color: #4CAF50;
                border-color: #4CAF50;
                color: white;
                transform: translateY(-1px);
            }

            .toolbar-btn:active {
                transform: translateY(0);
            }

            .toolbar-btn i {
                font-size: 1.4rem;
            }

            .toolbar-btn strong {
                font-size: 1.2rem;
                font-weight: 700;
            }

            /* Update textarea to connect with toolbar */
            .text-editor-toolbar + textarea,
            .text-editor-toolbar + #content {
                border-radius: 0 0 0.8rem 0.8rem !important;
                border-top: none !important;
            }

            @media screen and (max-width: 768px) {
                .text-editor-toolbar {
                    gap: 0.4rem;
                    padding: 0.8rem;
                }

                .toolbar-btn {
                    padding: 0.6rem 0.8rem;
                    min-width: 3.2rem;
                    height: 3.2rem;
                    font-size: 1.3rem;
                }

                .toolbar-btn i {
                    font-size: 1.3rem;
                }

                .toolbar-btn strong {
                    font-size: 1.1rem;
                }

                .toolbar-divider {
                    display: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Export for use in other scripts
window.TextEditor = TextEditor;
