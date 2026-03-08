import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { appManifestSchema, refreshConfigSchema, type AppManifest, type ProviderId, type RefreshConfig } from '../src/types/data.ts'
import { writeArtifacts } from './build-data.ts'

type RefreshDecision = {
  provider: ProviderId
  enabled: boolean
  due: boolean
  reason: string
}

type RefreshPlan = {
  decisions: RefreshDecision[]
  shouldRefresh: boolean
}

async function readJsonIfPresent<T>(filePath: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(filePath, 'utf8')) as T
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null
    }

    throw error
  }
}

export function evaluateRefreshPlan(
  config: RefreshConfig,
  manifest: AppManifest | null,
  now: Date,
  force = false,
): RefreshPlan {
  const lastRefreshTime = manifest ? Date.parse(manifest.lastRefresh) : Number.NaN

  const decisions = Object.entries(config.providers).map(([provider, providerConfig]) => {
    if (!providerConfig.enabled) {
      return {
        provider: provider as ProviderId,
        enabled: false,
        due: false,
        reason: 'disabled',
      }
    }

    if (force) {
      return {
        provider: provider as ProviderId,
        enabled: true,
        due: true,
        reason: 'forced',
      }
    }

    if (!manifest || Number.isNaN(lastRefreshTime)) {
      return {
        provider: provider as ProviderId,
        enabled: true,
        due: true,
        reason: 'missing manifest refresh timestamp',
      }
    }

    const elapsedHours = (now.getTime() - lastRefreshTime) / (1000 * 60 * 60)
    const cadenceHours = providerConfig.cadenceHours ?? config.defaultCadenceHours

    return {
      provider: provider as ProviderId,
      enabled: true,
      due: elapsedHours >= cadenceHours,
      reason: elapsedHours >= cadenceHours ? 'cadence elapsed' : `fresh for ${Math.floor(cadenceHours - elapsedHours)}h`,
    }
  })

  return {
    decisions,
    shouldRefresh: decisions.some((decision) => decision.enabled && decision.due),
  }
}

export async function runRefresh({
  configPath,
  outputRoot,
  now,
  force,
}: {
  configPath: string
  outputRoot: string
  now: Date
  force: boolean
}): Promise<RefreshPlan> {
  const [rawConfig, rawManifest] = await Promise.all([
    readJsonIfPresent<RefreshConfig>(configPath),
    readJsonIfPresent<AppManifest>(path.join(outputRoot, 'data', 'manifest.json')),
  ])

  const config = refreshConfigSchema.parse(rawConfig)
  const manifest = rawManifest ? appManifestSchema.parse(rawManifest) : null
  const plan = evaluateRefreshPlan(config, manifest, now, force)

  if (plan.shouldRefresh) {
    await writeArtifacts(outputRoot, now.toISOString())
  }

  return plan
}

async function main() {
  const scriptDir = path.dirname(fileURLToPath(import.meta.url))
  const repoRoot = path.resolve(scriptDir, '..')
  const force = process.argv.includes('--force') || process.env.FORCE_REFRESH === 'true'
  const now = new Date()
  const plan = await runRefresh({
    configPath: path.join(repoRoot, 'config', 'data-refresh.json'),
    outputRoot: path.join(repoRoot, 'public'),
    now,
    force,
  })

  for (const decision of plan.decisions) {
    console.log(`${decision.provider}: ${decision.due ? 'refresh' : 'skip'} (${decision.reason})`)
  }

  console.log(plan.shouldRefresh ? 'artifacts updated' : 'artifacts unchanged')
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  void main()
}
