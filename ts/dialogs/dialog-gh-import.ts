/**
 * The DialogGhExport class for navigating GitHub and writing a file.
 */

import { App } from '../app.js';
import { Dialog } from './dialog.js';
import { GitHubManager } from '../utils/github-manager.js';
import { appendDivTo } from '../utils/functions.js';

interface ItemDataset {
    name?: string,
    login?: string,
    type?: string
}

export class DialogGhImport extends Dialog {
    protected data: string | ArrayBuffer | Blob;
    protected filename: string;
    protected readonly githubManager: GitHubManager;

    private readonly iconsBranch: string;
    private readonly iconsInstitution: string;
    private readonly iconsFile: string;
    private readonly iconsFolder: string;
    private readonly iconsRepo: string;
    private readonly iconsUser: string;

    private readonly tabs: HTMLDivElement;
    private readonly tabUser: HTMLDivElement;
    private readonly tabRepo: HTMLDivElement;
    private readonly tabBranch: HTMLDivElement;
    private readonly tabFile: HTMLDivElement;
    private readonly loading: HTMLDivElement;
    private readonly list: HTMLDivElement;
    private readonly selection: HTMLDivElement;
    private readonly breadCrumbs: HTMLDivElement;

    constructor(div: HTMLDivElement, app: App, title: string, options: Dialog.Options, githubManager: GitHubManager) {
        super(div, app, title, options);

        this.iconsBranch = `${app.host}/icons/dialog/branch.png`;
        this.iconsInstitution = `${app.host}/icons/dialog/institution.png`;
        this.iconsFile = `${app.host}/icons/dialog/file.png`;
        this.iconsFolder = `${app.host}/icons/dialog/folder.png`;
        this.iconsRepo = `${app.host}/icons/dialog/repo.png`;
        this.iconsUser = `${app.host}/icons/dialog/user.png`;

        // output members
        this.data = null;
        this.filename = '';

        this.githubManager = githubManager;

        let tabGroup = appendDivTo(this.content, { class: `vrv-tab-group` });
        this.tabs = appendDivTo(tabGroup, { class: `vrv-tab-selectors` });

        this.tabUser = appendDivTo(this.tabs, { class: `vrv-tab-selector active`, dataset: { tab: `user` } });
        this.tabUser.textContent = 'User / Organizations';
        this.eventManager.bind(this.tabUser, 'click', this.selectTab);

        this.tabRepo = appendDivTo(this.tabs, { class: `vrv-tab-selector`, dataset: { tab: `rep` } });
        this.tabRepo.textContent = 'Repositories';
        this.eventManager.bind(this.tabRepo, 'click', this.selectTab);

        this.tabBranch = appendDivTo(this.tabs, { class: `vrv-tab-selector`, dataset: { tab: `branch` } });
        this.tabBranch.textContent = 'Branches';
        this.eventManager.bind(this.tabBranch, 'click', this.selectTab);

        this.tabFile = appendDivTo(this.tabs, { class: `vrv-tab-selector`, dataset: { tab: `file` } });
        this.tabFile.textContent = 'Files';
        this.eventManager.bind(this.tabFile, 'click', this.selectTab);

        this.loading = appendDivTo(this.content, { class: `vrv-dialog-gh-loading` });
        this.list = appendDivTo(this.content, { class: `vrv-dialog-gh-list` });
        this.selection = appendDivTo(this.content, { class: `vrv-dialog-gh-selection` });
        this.breadCrumbs = appendDivTo(this.content, { class: `vrv-path-breadcrumbs` });

        // Hide the OK button because the selection is done by clicking on a file
        this.okBtn.style.display = 'none';

        if (this.githubManager.getSelectedBranchName() !== '') {
            this.listFiles();
        }
        else {
            this.listRepos();
        }
    }


    ////////////////////////////////////////////////////////////////////////
    // Getters and setters
    ////////////////////////////////////////////////////////////////////////

    public getData(): string | ArrayBuffer | Blob { return this.data; }

    public getFilename(): string { return this.filename; }

    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////

    protected updateSelectionAndBreadcrumbs(): void {
        this.selection.style.display = 'none';
        this.selection.textContent = '';
        this.selection.style.display = 'none';
        this.breadCrumbs.textContent = '';
        const icon: string = (this.githubManager.getSelectedOrganization() !== null) ? this.iconsInstitution : this.iconsUser;
        if (!this.addSelection(this.githubManager.getSelectedAccountName(), icon)) return;
        if (!this.addSelection(this.githubManager.getSelectedRepoName(), this.iconsRepo)) return;
        if (!this.addSelection(this.githubManager.getSelectedBranchName(), this.iconsBranch)) return;
        const path: Array<string> = this.githubManager.getSelectedPath();
        if (path.length < 2) return;
        this.breadCrumbs.style.display = 'flex';
        for (let i = 0; i < path.length; i++) this.addCrumb(path[i], i + 1);
    }

    private loadingStart(tab: HTMLDivElement): void {
        Array.from(this.tabs.querySelectorAll('.vrv-tab-selector')).forEach(node => {
            node.classList.remove("selected");
        });
        tab.classList.add("selected");

        this.list.textContent = "";
        this.list.style.display = 'none';
        this.loading.style.display = 'block';
    }

    private loadingEnd(): void {
        this.list.textContent = "";
        this.list.style.display = 'flex';
        this.loading.style.display = 'none';
    }

    private addItemToList(name: string, icon: string, dataset: ItemDataset, checked: boolean, bind: Function): void {
        const item: HTMLDivElement = appendDivTo(this.list, { class: `vrv-dialog-gh-item`, style: { backgroundImage: `url(${icon})` }, 'data-before': `${name}` });
        const keys = Object.keys(dataset);
        for (let i = 0; i < keys.length; i++) {
            item.dataset[keys[i]] = dataset[keys[i]];
        }
        if (checked) item.classList.add("checked");
        this.eventManager.bind(item, 'click', bind);
    }

    private addSelection(name: string, icon: string): boolean {
        if (name === '') return false;
        this.selection.style.display = 'flex';
        const selection: HTMLDivElement = appendDivTo(this.selection, { class: `vrv-dialog-gh-selection-item`, style: { backgroundImage: `url(${icon})` } });
        selection.textContent = name;
        return true;
    }

    private addCrumb(name: string, value: number): void {
        const crumb: HTMLDivElement = appendDivTo(this.breadCrumbs, { class: `vrv-path-breadcrumbs` });
        crumb.textContent = name;
        crumb.dataset.value = value.toString();
        this.eventManager.bind(crumb, 'click', this.selectCrumb);
    }

    ////////////////////////////////////////////////////////////////////////
    // Async network methods
    ////////////////////////////////////////////////////////////////////////

    protected async selectFile(e: MouseEvent): Promise<any> {
        const element: HTMLElement = e.target as HTMLElement;
        if (element.dataset.type === 'dir') {
            if (element.dataset.name === '..') {
                this.githubManager.selectedPathPop();
            }
            else {
                this.githubManager.appendToPath(element.dataset.name);
            }
            await this.listFiles();
        }
        else {
            const branch = this.githubManager.getSelectedBranchName();
            const filename = this.githubManager.getPathString() + '/' + element.dataset.name;
            const contents = await this.githubManager.getSelectedRepo().getContents(branch, filename, true);
            this.data = contents.data;
            this.filename = element.dataset.name;
            this.ok();
        }
    }

    protected async listFiles(): Promise<any> {
        if (this.githubManager.getSelectedRepo() === null) {
            this.app.showNotification("Select a repository first");
            return;
        }

        this.loadingStart(this.tabFile);
        const branch = this.githubManager.getSelectedBranchName();
        const path = this.githubManager.getPathString();
        const contents = await this.githubManager.getSelectedRepo().getContents(branch, path);
        contents.data.sort((a, b) => (a.type > b.type) ? 1 : -1)
        this.loadingEnd();

        if (this.githubManager.getSelectedPath().length > 1) {
            this.addItemToList('..', this.iconsFolder, { name: '..', type: 'dir' }, false, this.selectFile);
        }

        for (let i = 0; i < contents.data.length; i++) {
            const name = contents.data[i].name;
            const type = contents.data[i].type;
            const icon = (type === 'dir') ? this.iconsFolder : this.iconsFile;
            this.addItemToList(name, icon, { name: name, type: type }, false, this.selectFile);
        }

        this.updateSelectionAndBreadcrumbs();
    }

    private async listUsers(): Promise<any> {
        this.loadingStart(this.tabUser);
        const orgs = await this.githubManager.getUser().listOrgs();
        this.loadingEnd();

        const userChecked = (this.githubManager.getSelectedAccountName() === this.githubManager.getLogin());
        this.addItemToList(this.githubManager.getLogin(), this.iconsUser, { login: this.githubManager.getLogin() }, userChecked, this.selectUser);
        for (let i = 0; i < orgs.data.length; i++) {
            const login = orgs.data[i].login;
            const checked = (this.githubManager.getSelectedAccountName() === login)
            this.addItemToList(login, this.iconsInstitution, { login: login }, checked, this.selectUser);
        }

        this.updateSelectionAndBreadcrumbs();
    }

    private async listRepos(): Promise<any> {
        this.loadingStart(this.tabRepo);
        let repos: any;
        if (this.githubManager.getSelectedOrganization() !== null) {
            repos = await this.githubManager.getSelectedOrganization().getRepos();
        }
        else {
            repos = await this.githubManager.getSelectedUser().listRepos({ type: 'owner' });
        }
        repos.data.sort((a, b) => (a.name > b.name) ? 1 : -1)
        this.loadingEnd();
        for (let i = 0; i < repos.data.length; i++) {
            const name = repos.data[i].name;
            const checked = (this.githubManager.getSelectedRepoName() === name);
            this.addItemToList(name, this.iconsRepo, { name: name }, checked, this.selectRepo);
        }

        this.updateSelectionAndBreadcrumbs();
    }

    private async listBranches(): Promise<any> {
        if (this.githubManager.getSelectedRepo() === null) {
            this.app.showNotification("Select a repository first");
            return;
        }

        this.loadingStart(this.tabBranch);
        const branches = await this.githubManager.getSelectedRepo().listBranches();
        branches.data.sort((a, b) => (a.name > b.name) ? 1 : -1)
        this.loadingEnd();
        for (let i = 0; i < branches.data.length; i++) {
            const name = branches.data[i].name;
            const checked = (this.githubManager.getSelectedBranchName() === name);
            this.addItemToList(name, this.iconsBranch, { name: name }, checked, this.selectBranch);
        }

        this.updateSelectionAndBreadcrumbs();
    }

    private async selectUser(e: MouseEvent): Promise<any> {
        const element: HTMLElement = e.target as HTMLElement;
        await this.githubManager.selectAccount(element.dataset.login);
        this.listRepos();
    }

    private async selectRepo(e: MouseEvent): Promise<any> {
        const element: HTMLElement = e.target as HTMLElement;
        await this.githubManager.selectRepo(element.dataset.name);
        this.listBranches();
    }

    private async selectBranch(e: MouseEvent): Promise<any> {
        const element: HTMLElement = e.target as HTMLElement;
        await this.githubManager.selectBranch(element.dataset.name);
        this.listFiles();
    }

    ////////////////////////////////////////////////////////////////////////
    // Event methods
    ////////////////////////////////////////////////////////////////////////

    selectCrumb(e: MouseEvent): void {
        const element: HTMLElement = e.target as HTMLElement;
        this.githubManager.slicePathTo(Number(element.dataset.value));
        this.listFiles();
    }

    selectTab(e: MouseEvent): void {
        const element: HTMLElement = e.target as HTMLElement;
        switch (element.dataset.tab) {
            case ('user'): this.listUsers(); break;
            case ('repo'): this.listRepos(); break;
            case ('branch'): this.listBranches(); break;
            case ('file'): this.listFiles(); break;
        }
    }
}
