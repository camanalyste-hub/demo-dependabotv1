// Tests lancés par le pipeline CI sur chaque pull request (y compris celles de Dependabot).
// Ils vérifient que notre code qui utilise axios fonctionne toujours après une mise à jour.
import { test, before, after } from 'node:test'
import assert from 'node:assert/strict'
import http from 'node:http'
import { createGithubClient, getRepoInfo } from '../src/api/github.ts'

let server
let baseURL

// Faux serveur « API GitHub » local : aucun appel réseau réel pendant les tests.
before(async () => {
  server = http.createServer((req, res) => {
    if (req.url === '/repos/demo/app') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ full_name: 'demo/app', stargazers_count: 42, open_issues_count: 7 }))
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ message: 'Not Found' }))
    }
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  baseURL = `http://127.0.0.1:${server.address().port}`
})

after(() => {
  server.closeAllConnections()
  server.close()
})

test('getRepoInfo renvoie les informations du dépôt', async () => {
  const info = await getRepoInfo('demo', 'app', createGithubClient(baseURL))
  assert.deepEqual(info, { fullName: 'demo/app', stars: 42, openIssues: 7 })
})

test('getRepoInfo échoue si le dépôt n\'existe pas (HTTP 404)', async () => {
  await assert.rejects(getRepoInfo('demo', 'inconnu', createGithubClient(baseURL)))
})
