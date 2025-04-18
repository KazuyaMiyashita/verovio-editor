/**
 * The DialogGhImport class for navigating GitHub and selecting a file.
 */

import { App } from '../app.js';
import { Dialog } from './dialog.js';
import { DialogGhImport } from './dialog-gh-import.js';
import { GitHubManager } from '../utils/github-manager.js';

import { appendDivTo, appendInputTo, appendTextAreaTo } from '../utils/functions.js';

export class DialogGhExport extends DialogGhImport {
    protected readonly fields: HTMLDivElement;
    protected readonly inputFile: HTMLInputElement;
    protected readonly inputMessage: HTMLTextAreaElement;

    constructor(div: HTMLDivElement, app: App, title: string, options: Dialog.Options, githubManager: GitHubManager) {
        options.okLabel = 'Commit and push';

        super(div, app, title, options, githubManager);

        this.okBtn.style.display = 'flex';
        this.okBtn.classList.add('disabled');

        this.fields = appendDivTo(this.content, { class: `vrv-dialog-form`, style: { 'display': `none` } });

        const labelFile = appendDivTo(this.fields, { class: `vrv-dialog-label` });
        labelFile.innerHTML = "Filename";
        this.inputFile = appendInputTo(this.fields, { class: `vrv-dialog-input` });
        this.inputFile.placeholder = "Name of an existing or of a new file";
        this.eventManager.bind(this.inputFile, 'input', this.enableOk);

        const labelMessage = appendDivTo(this.fields, { class: `vrv-dialog-label` });
        labelMessage.innerHTML = "Commit message";
        this.inputMessage = appendTextAreaTo(this.fields, { class: `vrv-dialog-input` });
        this.inputMessage.placeholder = "The commit message to be sent to GitHub";
        this.eventManager.bind(this.inputMessage, 'input', this.enableOk);
    }

    ////////////////////////////////////////////////////////////////////////
    // Async network methods
    ////////////////////////////////////////////////////////////////////////

    async selectFile(e: MouseEvent): Promise<any> {
        const element: HTMLElement = e.target as HTMLElement;
        if (element.dataset.type === 'dir') {
            if (element.dataset.name === '..') {
                this.githubManager.selectedPathPop();
            }
            else {
                this.githubManager.appendToPath(element.dataset.name);
            }
            this.listFiles();
        }
        else {
            this.inputFile.value = element.dataset.name;
        }
    }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    private isValid(): boolean {
        return (this.inputFile.value !== '' && this.inputMessage.value !== '');
    }

    ////////////////////////////////////////////////////////////////////////
    // Overriding methods
    ////////////////////////////////////////////////////////////////////////

    override updateSelectionAndBreadcrumbs(): void {
        super.updateSelectionAndBreadcrumbs();
        if (this.githubManager.getSelectedBranchName() === '') {
            this.fields.style.display = 'none';
        }
        else {
            this.fields.style.display = 'grid';
        }

    }

    override ok(): void {
        if (!this.isValid()) return;

        const filename: string = this.githubManager.getPathString() + '/' + this.inputFile.value;
        const commitMsg: string = this.inputMessage.value;

        this.githubManager.writeFile(filename, commitMsg);

        super.ok();
    }

    ////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////

    enableOk(e: MouseEvent): void {
        this.okBtn.classList.toggle('disabled', !this.isValid());
    }
}
