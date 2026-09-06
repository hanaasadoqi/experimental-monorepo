import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"

const repositoryRoot = process.cwd()
const errors = []

function walk(directory, predicate) {
  const files = []

  for (const entry of readdirSync(directory)) {
    if (
      [".git", ".next", ".turbo", "coverage", "dist", "node_modules"].includes(
        entry
      )
    ) {
      continue
    }

    const path = join(directory, entry)
    const metadata = statSync(path)

    if (metadata.isDirectory()) files.push(...walk(path, predicate))
    else if (predicate(path)) files.push(path)
  }

  return files
}

const packageManifests = walk(join(repositoryRoot, "packages"), (path) =>
  path.endsWith("package.json")
)

for (const manifestPath of packageManifests) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"))
  const packageDirectory = dirname(manifestPath)

  for (const [exportName, targetValue] of Object.entries(
    manifest.exports ?? {}
  )) {
    const targets = Array.isArray(targetValue) ? targetValue : [targetValue]

    for (const target of targets) {
      if (typeof target !== "string" || target.includes("*")) continue
      if (!existsSync(resolve(packageDirectory, target))) {
        errors.push(
          `${relative(repositoryRoot, manifestPath)}: export ${exportName} targets missing ${target}`
        )
      }
    }
  }

  if (
    !relative(join(repositoryRoot, "packages/domain"), manifestPath).startsWith(
      ".."
    )
  ) {
    const dependencies = Object.keys(manifest.dependencies ?? {})
    const forbiddenDependency = dependencies.find((dependency) =>
      /^@repo\/(features|runtime|ui|adapters|services)-/.test(dependency)
    )

    if (forbiddenDependency) {
      errors.push(
        `${relative(repositoryRoot, manifestPath)}: domain package depends on ${forbiddenDependency}`
      )
    }
  }
}

const domainSources = walk(join(repositoryRoot, "packages/domain"), (path) =>
  /\.(ts|tsx)$/.test(path)
)

for (const sourcePath of domainSources) {
  const source = readFileSync(sourcePath, "utf8")
  const sourceName = relative(repositoryRoot, sourcePath)

  if (/from\s+["'](?:react|react-dom|next(?:\/|["'])|zustand)/.test(source)) {
    errors.push(
      `${sourceName}: domain source imports a runtime/framework dependency`
    )
  }

  if (
    /\b(?:document|window|localStorage|sessionStorage|navigator)\s*\./.test(
      source
    )
  ) {
    errors.push(`${sourceName}: domain source accesses a browser global`)
  }
}

if (errors.length > 0) {
  console.error("Architecture boundary violations:\n")
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log("Architecture boundary checks passed")
}
