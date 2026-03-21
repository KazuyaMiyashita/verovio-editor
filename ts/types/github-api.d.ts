declare namespace GitHubApi {
  interface User {
    getProfile(): Promise<{ data: UserProfile }>;
    listOrgs(): Promise<{ data: Array<{ login: string }> }>;
    listRepos(options?: object): Promise<{ data: Array<any> }>;
  }

  interface UserProfile {
    login: string;
    name: string | null;
  }

  interface Organization {
    [key: string]: any;
  }

  interface Repository {
    getDetails(): Promise<{ data: RepositoryDetails }>;
    writeFile(
      branch: string,
      path: string,
      content: string,
      message: string,
      options: object
    ): Promise<any>;
    listBranches(): Promise<{ data: Array<{ name: string }> }>;
    getContents(
      branch: string,
      path: string,
      raw?: boolean
    ): Promise<{ data: any }>;
  }

  interface RepositoryDetails {
    default_branch: string;
  }

  interface GitHub {
    getUser(): User;
    getOrganization(login: string): Organization;
    getRepo(user: string, repo: string): Repository;
  }

  interface ConstructorOptions {
    token?: string;
    username?: string;
    password?: string;
  }
}

declare const GitHub: {
  new (options: GitHubApi.ConstructorOptions): GitHubApi.GitHub;
};
