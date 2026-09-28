import axios from 'axios'

// Client HTTP de l'application : c'est ici qu'on utilise la dépendance axios
// (version volontairement obsolète dans package.json pour la démo Dependabot).
export function createGithubClient(baseURL = 'https://api.github.com') {
  return axios.create({ baseURL, timeout: 5000 })
}

export interface RepoInfo {
  fullName: string
  stars: number
  openIssues: number
}

export async function getRepoInfo(
  owner: string,
  repo: string,
  client = createGithubClient(),
): Promise<RepoInfo> {
  const { data } = await client.get(`/repos/${owner}/${repo}`)
  return {
    fullName: data.full_name,
    stars: data.stargazers_count,
    openIssues: data.open_issues_count,
  }
}
