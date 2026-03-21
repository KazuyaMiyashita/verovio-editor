/**
 * The GitHubManager class managing a connection to GitHub through the GitHub API.
 */
export class GitHubManager {
    name;
    login;
    user;
    selectedUser;
    selectedOrganization;
    selectedAccountName;
    selectedBranchName;
    selectedRepo;
    selectedRepoName;
    selectedPath;
    gh;
    app;
    constructor(app) {
        this.app = app;
        this.name = "GitHub";
        this.login = "unknown";
        this.user = null;
        this.selectedUser = null;
        this.selectedOrganization = null;
        this.selectedAccountName = "";
        this.selectedBranchName = "";
        this.selectedRepo = null;
        this.selectedRepoName = "";
        this.selectedPath = ["."];
        this.gh = null;
        let tk = this.getSessionCookie("ghtoken");
        if (tk) {
            tk = JSON.parse(atob(tk)).ghtoken;
        }
        if (tk !== null) {
            this.gh = new GitHub({ token: tk });
            this.initUser();
        }
    }
    ////////////////////////////////////////////////////////////////////////
    // Getters and setters
    ////////////////////////////////////////////////////////////////////////
    getName() {
        return this.name;
    }
    getLogin() {
        return this.login;
    }
    getUser() {
        return this.user;
    }
    getSelectedUser() {
        return this.selectedUser;
    }
    getSelectedOrganization() {
        return this.selectedOrganization;
    }
    getSelectedRepo() {
        return this.selectedRepo;
    }
    getSelectedBranchName() {
        return this.selectedBranchName;
    }
    getSelectedAccountName() {
        return this.selectedAccountName;
    }
    getSelectedRepoName() {
        return this.selectedRepoName;
    }
    getSelectedPath() {
        return this.selectedPath;
    }
    selectedPathPop() {
        this.selectedPath.pop();
    }
    ////////////////////////////////////////////////////////////////////////
    // Class-specific methods
    ////////////////////////////////////////////////////////////////////////
    getPathString() {
        return this.selectedPath.join("/");
    }
    appendToPath(dir) {
        this.selectedPath.push(dir);
        this.storeSelection();
    }
    slicePathTo(value) {
        this.selectedPath = this.selectedPath.slice(0, value);
        this.storeSelection();
    }
    isLoggedIn() {
        return this.gh !== null;
    }
    getSessionCookie(name) {
        let v = document.cookie.match("(^|;) ?" + name + "=([^;]*)(;|$)");
        return v ? v[2] : null;
    }
    storeSelection() {
        this.app.options.github = {
            login: this.login,
            account: this.selectedAccountName,
            repo: this.selectedRepoName,
            branch: this.selectedBranchName,
            path: this.selectedPath,
        };
    }
    resetSelectedPath() {
        this.selectedPath = ["."];
    }
    ////////////////////////////////////////////////////////////////////////
    // Async network methods
    ////////////////////////////////////////////////////////////////////////
    async writeFile(filename, commitMsg) {
        try {
            let mei = await this.app.verovio.getMEI({});
            await this.selectedRepo.writeFile(this.selectedBranchName, filename, mei, commitMsg, {});
            this.app.showNotification("File was successfully pushed to GitHub");
        }
        catch (err) {
            console.error(err);
            this.app.showNotification("Something went wrong when pushing to GitHub");
        }
    }
    async selectAccount(login) {
        if (login === this.login) {
            this.selectedOrganization = null;
            this.selectedUser = this.gh.getUser();
        }
        else {
            this.selectedUser = null;
            this.selectedOrganization = this.gh.getOrganization(login);
        }
        this.selectedAccountName = login;
        this.selectedBranchName = "";
        this.selectedRepo = null;
        this.selectedRepoName = "";
        this.resetSelectedPath();
        this.storeSelection();
    }
    async selectBranch(name) {
        if (name === "")
            return;
        // Only need to check the name, but make sure it exists?
        this.selectedBranchName = name;
        this.resetSelectedPath();
        this.storeSelection();
    }
    async selectRepo(name) {
        if (name === "")
            return;
        try {
            this.selectedRepo = this.gh.getRepo(this.selectedAccountName, name);
            const getDetails = await this.selectedRepo.getDetails();
            this.selectedBranchName = getDetails.data.default_branch;
            this.selectedRepoName = name;
            this.resetSelectedPath();
            this.storeSelection();
        }
        catch (err) {
            console.error(err);
        }
    }
    async initUser() {
        this.user = this.gh.getUser();
        const profile = await this.user.getProfile();
        this.login = profile.data.login;
        this.name =
            profile.data.name !== null ? profile.data.name : profile.data.login;
        // also use it as default account
        this.selectedUser = this.user;
        this.selectedAccountName = this.login;
        let options = this.app.options.github;
        if (options && options.login === this.login) {
            await this.selectAccount(options.account);
            await this.selectRepo(options.repo);
            await this.selectBranch(options.branch);
            this.selectedPath = options.path;
        }
    }
}
//# sourceMappingURL=github-manager.js.map