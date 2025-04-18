/**
 * The DialogGhImport class for navigating GitHub and selecting a file.
 */
import { DialogGhImport } from './dialog-gh-import.js';
import { appendDivTo, appendInputTo, appendTextAreaTo } from '../utils/functions.js';
export class DialogGhExport extends DialogGhImport {
    constructor(div, app, title, options, githubManager) {
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
    async selectFile(e) {
        const element = e.target;
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
    isValid() {
        return (this.inputFile.value !== '' && this.inputMessage.value !== '');
    }
    ////////////////////////////////////////////////////////////////////////
    // Overriding methods
    ////////////////////////////////////////////////////////////////////////
    updateSelectionAndBreadcrumbs() {
        super.updateSelectionAndBreadcrumbs();
        if (this.githubManager.getSelectedBranchName() === '') {
            this.fields.style.display = 'none';
        }
        else {
            this.fields.style.display = 'grid';
        }
    }
    ok() {
        if (!this.isValid())
            return;
        const filename = this.githubManager.getPathString() + '/' + this.inputFile.value;
        const commitMsg = this.inputMessage.value;
        this.githubManager.writeFile(filename, commitMsg);
        super.ok();
    }
    ////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////
    enableOk(e) {
        this.okBtn.classList.toggle('disabled', !this.isValid());
    }
}
//# sourceMappingURL=dialog-gh-export.js.map