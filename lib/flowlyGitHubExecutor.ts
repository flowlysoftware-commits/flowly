import crypto from "crypto";

export type GitHubExecutorConfig = {
  owner: string;
  repo: string;
  defaultBranch?: string;
  authMode: "github_app" | "token" | "missing";
  hasCredentials: boolean;
  missing: string[];
};

export type ExecutorFileChange = {
  path: string;
  content: string;
  message?: string;
};

export type ExecutorPullRequestInput = {
  title: string;
  body: string;
  branchName?: string;
  files: ExecutorFileChange[];
};

export type ExecutorPullRequestResult = {
  ok: boolean;
  branch?: string;
  pullRequestUrl?: string;
  pullRequestNumber?: number;
  files?: string[];
  error?: string;
  mode?: GitHubExecutorConfig["authMode"];
};

function normalizePrivateKey(value: string) {
  return value.replace(/\\n/g, "\n").trim();
}

function base64url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function createGitHubAppJwt(appId: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iat: now - 60,
    exp: now + 9 * 60,
    iss: appId,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(data)
    .sign(normalizePrivateKey(privateKey));

  return `${data}.${base64url(signature)}`;
}

export function getGitHubExecutorConfig(): GitHubExecutorConfig {
  const owner = process.env.GITHUB_REPOSITORY_OWNER || process.env.GITHUB_OWNER || "";
  const repo = process.env.GITHUB_REPOSITORY_NAME || process.env.GITHUB_REPO || "";
  const defaultBranch = process.env.GITHUB_DEFAULT_BRANCH || "main";
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_PAT || "";
  const appId = process.env.GITHUB_APP_ID || "";
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY || "";
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID || "";

  const missingBase = [
    !owner ? "GITHUB_REPOSITORY_OWNER" : "",
    !repo ? "GITHUB_REPOSITORY_NAME" : "",
  ].filter(Boolean);

  if (appId && privateKey && installationId && owner && repo) {
    return { owner, repo, defaultBranch, authMode: "github_app", hasCredentials: true, missing: [] };
  }

  if (token && owner && repo) {
    return { owner, repo, defaultBranch, authMode: "token", hasCredentials: true, missing: [] };
  }

  const missingApp = [
    !appId ? "GITHUB_APP_ID" : "",
    !privateKey ? "GITHUB_APP_PRIVATE_KEY" : "",
    !installationId ? "GITHUB_APP_INSTALLATION_ID" : "",
  ].filter(Boolean);
  const missingToken = !token ? ["GITHUB_TOKEN"] : [];

  return {
    owner,
    repo,
    defaultBranch,
    authMode: "missing",
    hasCredentials: false,
    missing: [...missingBase, `Opción GitHub App: ${missingApp.join(", ")}`, `Opción token: ${missingToken.join(", ")}`].filter(Boolean),
  };
}

async function getInstallationToken() {
  const appId = process.env.GITHUB_APP_ID!;
  const privateKey = process.env.GITHUB_APP_PRIVATE_KEY!;
  const installationId = process.env.GITHUB_APP_INSTALLATION_ID!;
  const jwt = createGitHubAppJwt(appId, privateKey);

  const response = await fetch(`https://api.github.com/app/installations/${installationId}/access_tokens`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Flowly-Executor",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`No se pudo crear installation token: ${response.status} ${text}`);
  }

  const data = (await response.json()) as { token: string };
  return data.token;
}

async function getAuthToken(config: GitHubExecutorConfig) {
  if (config.authMode === "github_app") return getInstallationToken();
  if (config.authMode === "token") return process.env.GITHUB_TOKEN || process.env.GITHUB_PAT || "";
  throw new Error(`GitHub Executor no está configurado. Faltan: ${config.missing.join(" | ")}`);
}

async function githubFetch<T>(path: string, init: RequestInit = {}) {
  const config = getGitHubExecutorConfig();
  const token = await getAuthToken(config);
  const response = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Flowly-Executor",
      ...(init.headers || {}),
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`GitHub API error ${response.status}: ${text}`);
  }
  return data as T;
}

export async function getGitHubRepositoryStatus() {
  const config = getGitHubExecutorConfig();
  if (!config.hasCredentials) {
    return {
      configured: false,
      config,
      repository: null,
      message: "Faltan variables de entorno para conectar GitHub.",
    };
  }

  const repository = await githubFetch<{
    full_name: string;
    default_branch: string;
    html_url: string;
    private: boolean;
    pushed_at: string;
  }>(`/repos/${config.owner}/${config.repo}`);

  return {
    configured: true,
    config: { ...config, defaultBranch: repository.default_branch || config.defaultBranch },
    repository,
    message: `Conectado a ${repository.full_name}`,
  };
}

async function getBranchSha(owner: string, repo: string, branch: string) {
  const ref = await githubFetch<{ object: { sha: string } }>(`/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`);
  return ref.object.sha;
}

async function createBranch(owner: string, repo: string, branch: string, fromSha: string) {
  return githubFetch(`/repos/${owner}/${repo}/git/refs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: fromSha }),
  });
}

async function getFileSha(owner: string, repo: string, path: string, branch: string) {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  try {
    const file = await githubFetch<{ sha: string }>(`/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`);
    return file.sha;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("404")) return undefined;
    throw error;
  }
}

async function upsertFile(owner: string, repo: string, branch: string, file: ExecutorFileChange, fallbackMessage: string) {
  const sha = await getFileSha(owner, repo, file.path, branch);
  const encodedPath = file.path.split("/").map(encodeURIComponent).join("/");
  return githubFetch(`/repos/${owner}/${repo}/contents/${encodedPath}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: file.message || fallbackMessage,
      content: Buffer.from(file.content, "utf8").toString("base64"),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
}

async function createPullRequest(owner: string, repo: string, title: string, body: string, head: string, base: string) {
  return githubFetch<{ html_url: string; number: number }>(`/repos/${owner}/${repo}/pulls`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, body, head, base }),
  });
}



export type GitHubTreeItem = {
  path: string;
  mode: string;
  type: "blob" | "tree" | string;
  sha: string;
  size?: number;
  url: string;
};

export async function listRepositoryTree(branch?: string) {
  const config = getGitHubExecutorConfig();
  if (!config.hasCredentials) {
    throw new Error(`GitHub Executor no configurado. Faltan: ${config.missing.join(" | ")}`);
  }
  const owner = config.owner;
  const repo = config.repo;
  const targetBranch = branch || config.defaultBranch || "main";
  const sha = await getBranchSha(owner, repo, targetBranch);
  const tree = await githubFetch<{ tree: GitHubTreeItem[]; truncated: boolean }>(`/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`);
  return {
    owner,
    repo,
    branch: targetBranch,
    truncated: tree.truncated,
    items: tree.tree || [],
  };
}

export async function readRepositoryFile(path: string, branch?: string) {
  const config = getGitHubExecutorConfig();
  if (!config.hasCredentials) {
    throw new Error(`GitHub Executor no configurado. Faltan: ${config.missing.join(" | ")}`);
  }
  const owner = config.owner;
  const repo = config.repo;
  const targetBranch = branch || config.defaultBranch || "main";
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const file = await githubFetch<{ content?: string; encoding?: string; sha: string; size: number; path: string }>(`/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(targetBranch)}`);
  const rawContent = file.content || "";
  const content = file.encoding === "base64" ? Buffer.from(rawContent.replace(/\n/g, ""), "base64").toString("utf8") : rawContent;
  return {
    path: file.path || path,
    sha: file.sha,
    size: file.size,
    content,
  };
}

function slugifyBranch(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 52) || "flowly-change";
}

export async function createExecutorPullRequest(input: ExecutorPullRequestInput): Promise<ExecutorPullRequestResult> {
  const config = getGitHubExecutorConfig();
  if (!config.hasCredentials) {
    return { ok: false, error: `GitHub Executor no configurado. Faltan: ${config.missing.join(" | ")}`, mode: config.authMode };
  }

  const owner = config.owner;
  const repo = config.repo;
  const baseBranch = config.defaultBranch || "main";
  const suffix = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const branch = input.branchName || `flowly/${slugifyBranch(input.title)}-${suffix}`;

  try {
    const baseSha = await getBranchSha(owner, repo, baseBranch);
    await createBranch(owner, repo, branch, baseSha);

    for (const file of input.files) {
      await upsertFile(owner, repo, branch, file, input.title);
    }

    const pr = await createPullRequest(owner, repo, input.title, input.body, branch, baseBranch);
    return {
      ok: true,
      branch,
      pullRequestUrl: pr.html_url,
      pullRequestNumber: pr.number,
      files: input.files.map((file) => file.path),
      mode: config.authMode,
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error), branch, mode: config.authMode };
  }
}

export function buildExecutorTestFile(instruction: string) {
  const now = new Date().toISOString();
  return {
    path: `docs/executor/flowly-executor-test-${now.replace(/[:.]/g, "-")}.md`,
    content: `# Flowly Executor Test\n\nFecha: ${now}\n\n## Instrucción\n\n${instruction || "Prueba de conexión entre Flowly Brain y GitHub."}\n\n## Resultado esperado\n\nEste archivo fue creado en una rama nueva por Flowly Executor. Si ves este archivo dentro de un Pull Request, la conexión con GitHub funciona.\n`,
  };
}
