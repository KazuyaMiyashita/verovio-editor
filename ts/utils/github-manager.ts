/**
 * The GitHubManager class managing a connection to GitHub through the GitHub API.
 */

import { App } from "../app.js";

declare global {
  const GitHub;
}

export class GitHubManager {
  private name: string;
  private login: string;
  private user: any; // GitHub::User object
  private selectedUser: any; // GitHub::User object
  private selectedOrganization: any; // GitHub::Organization object
  private selectedAccountName: string;
  private selectedBranchName: string;
  private selectedRepo: any; // GitHub::Repository object
  private selectedRepoName: string;
  private selectedPath: Array<string>;

  private gh: any; // GitHub object

  private readonly app: App;

  constructor(app: App) {
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

  public getName(): string {
    return this.name;
  }

  public getLogin(): string {
    return this.login;
  }

  public getUser(): any {
    return this.user;
  }

  public getSelectedUser(): any {
    return this.selectedUser;
  }

  public getSelectedOrganization(): any {
    return this.selectedOrganization;
  }

  public getSelectedAccountName(): string {
    return this.selectedAccountName;
  }

  public getSelectedBranchName(): string {
    return this.selectedBranchName;
  }

  public getSelectedRepo(): any {
    return this.selectedRepo;
  }

  public getSelectedRepoName(): string {
    return this.selectedRepoName;
  }

  public getSelectedPath(): Array<string> {
    return this.selectedPath;
  }
  public selectedPathPop(): void {
    this.selectedPath.pop();
  }

  ////////////////////////////////////////////////////////////////////////
  // Class-specific methods
  ////////////////////////////////////////////////////////////////////////

  public getPathString(): string {
    return this.selectedPath.join("/");
  }

  public appendToPath(dir: string): void {
    this.selectedPath.push(dir);
    this.storeSelection();
  }

  public slicePathTo(value: number) {
    this.selectedPath = this.selectedPath.slice(0, value);
    this.storeSelection();
  }

  public isLoggedIn(): boolean {
    return this.gh !== null;
  }

  private getSessionCookie(name: string): string {
    let v: Array<string> = document.cookie.match(
      "(^|;) ?" + name + "=([^;]*)(;|$)",
    );
    return v ? v[2] : null;
  }

  private storeSelection(): void {
    this.app.options.github = {
      login: this.login,
      account: this.selectedAccountName,
      repo: this.selectedRepoName,
      branch: this.selectedBranchName,
      path: this.selectedPath,
    };
  }

  private resetSelectedPath(): void {
    this.selectedPath = ["."];
  }

  ////////////////////////////////////////////////////////////////////////
  // Async network methods
  ////////////////////////////////////////////////////////////////////////

  public async writeFile(filename: string, commitMsg: string): Promise<any> {
    try {
      let mei = this.app.verovio.getMEI({});
      await this.selectedRepo.writeFile(
        this.selectedBranchName,
        filename,
        mei,
        commitMsg,
        {},
      );
      this.app.showNotification("File was successfully pushed to GitHub");
    } catch (err) {
      console.error(err);
      this.app.showNotification("Something went wrong when pushing to GitHub");
    }
  }

  public async selectAccount(login: string): Promise<any> {
    if (login === this.login) {
      this.selectedOrganization = null;
      this.selectedUser = this.gh.getUser();
    } else {
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

  public async selectBranch(name: string): Promise<any> {
    if (name === "") return;

    // Only need to check the name, but make sure it exists?
    this.selectedBranchName = name;
    this.resetSelectedPath();
    this.storeSelection();
  }

  public async selectRepo(name: string): Promise<any> {
    if (name === "") return;

    try {
      this.selectedRepo = this.gh.getRepo(this.selectedAccountName, name);
      const getDetails = await this.selectedRepo.getDetails();
      this.selectedBranchName = getDetails.data.default_branch;
      this.selectedRepoName = name;
      this.resetSelectedPath();
      this.storeSelection();
    } catch (err) {
      console.error(err);
    }
  }

  private async initUser(): Promise<any> {
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

////////////////////////////////////////////////////////////////////////
// Merged namespace
////////////////////////////////////////////////////////////////////////

export namespace GitHubManager {
  export interface Options {
    login: string;
    account: string;
    repo: string;
    branch: string;
    path: Array<string>;
  }
}
