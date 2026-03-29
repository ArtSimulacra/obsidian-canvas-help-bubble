import { App, Editor, MarkdownView, Modal, Plugin, Setting, TextAreaComponent } from 'obsidian';

export default class HelpBubblePlugin extends Plugin {
    async onload() {
        // 1. Добавляем иконку на боковую панель (для порядка)
        this.addRibbonIcon('book', 'Создать справку', () => {
            this.openHelpModal();
        });

        // 2. РЕГИСТРИРУЕМ КОМАНДУ (Это позволит добавить кнопку на панель над клавиатурой в iPad)
        this.addCommand({
            id: 'insert-help-bubble',
            name: 'Вставить розовую справку',
            editorCallback: (editor: Editor) => {
                this.openHelpModal();
            }
        });
    }

    openHelpModal() {
        new HelpBubbleModal(this.app, (result) => {
            this.insertHelpBubble(result);
        }).open();
    }

    insertHelpBubble(text: string) {
        const activeView = this.app.workspace.getActiveViewOfType(MarkdownView);
        if (!activeView) return;

        const editor = activeView.editor;
        
        // Наш "Золотой стандарт" HTML (одной строкой для стабильности в Safari)
        // Заменяем переносы строк на <br>, чтобы текст внутри бабла не слипался
        const formattedText = text.replace(/\n/g, '<br>');

        const htmlTemplate = `<div class="help-wrapper" contenteditable="false"><details><summary><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="help-icon"><path fill="currentColor" d="M96 0C43 0 0 43 0 96V416c0 53 43 96 96 96H384h32c17.7 0 32-14.3 32-32s-14.3-32-32-32V384c17.7 0 32-14.3 32-32V32c0-17.7-14.3-32-32-32H384 96zm0 384H352v64H96c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16zm16 48H336c8.8 0 16 7.2 16 16s-7.2 16-16 16H144c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/></svg><span class="help-title">Справка</span><span class="help-close">×</span></summary><div class="help-content">${formattedText}</div></details></div>`;

        // Вставляем всё это добро прямо там, где стоит курсор
        editor.replaceSelection(htmlTemplate);
    }
}

// ОКНО ВВОДА (MODAL)
class HelpBubbleModal extends Modal {
    result: string = "";
    onSubmit: (result: string) => void;

    constructor(app: App, onSubmit: (result: string) => void) {
        super(app);
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl("h2", { text: "Текст справки" });

        const textInput = new TextAreaComponent(contentEl)
            .setPlaceholder("Введите содержание подсказки...")
            .onChange((value) => {
                this.result = value;
            });
        
        // Делаем поле удобным для iPad
        textInput.inputEl.style.width = "100%";
        textInput.inputEl.style.height = "150px";
        textInput.inputEl.style.fontSize = "16px"; // Чтобы iOS не увеличивала экран при вводе

        new Setting(contentEl)
            .addButton((btn) =>
                btn
                    .setButtonText("Вставить")
                    .setCta()
                    .onClick(() => {
                        this.close();
                        this.onSubmit(this.result);
                    }));
    }

    onClose() {
        this.contentEl.empty();
    }
}
