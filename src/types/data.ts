import { z } from 'zod'

export const providerSchema = z.enum(['openai', 'anthropic'])
export const geoTypeSchema = z.enum(['country', 'us_state'])
export const geographyModeSchema = z.enum(['world', 'us'])
export const valueTypeSchema = z.enum(['index', 'share', 'percent', 'score', 'count'])

export const periodMetaSchema = z.object({
  id: z.string(),
  label: z.string(),
  publicationDate: z.string(),
})

export const colorRampSchema = z.object({
  low: z.string(),
  high: z.string(),
})

export const observationSchema = z.object({
  geoType: geoTypeSchema,
  geoId: z.string(),
  geoLabel: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  provider: providerSchema,
  metricId: z.string(),
  metricLabel: z.string(),
  periodId: z.string(),
  valueRaw: z.number(),
  valueNormalized: z.number(),
  rank: z.number().int().positive(),
  valueType: valueTypeSchema,
  unit: z.string().optional(),
  sourceUrl: z.string().url(),
  methodologyUrl: z.string().url(),
  publicationDate: z.string(),
  fetchedAt: z.string(),
  comparabilityGroup: z.string(),
  highlight: z.string().optional(),
  insight: z.string().optional(),
})

export const datasetArtifactSchema = z.object({
  provider: providerSchema,
  geoType: geoTypeSchema,
  metricId: z.string(),
  metricLabel: z.string(),
  description: z.string(),
  valueType: valueTypeSchema,
  unit: z.string().optional(),
  colorRamp: colorRampSchema,
  periods: z.array(periodMetaSchema),
  observations: z.array(observationSchema),
})

export const manifestDatasetSchema = z.object({
  provider: providerSchema,
  geoType: geoTypeSchema,
  metricId: z.string(),
  metricLabel: z.string(),
  description: z.string(),
  valueType: valueTypeSchema,
  unit: z.string().optional(),
  colorRamp: colorRampSchema,
  periods: z.array(periodMetaSchema),
  defaultPeriodId: z.string(),
  defaultSelection: z.string(),
  checksum: z.string(),
  availableGeographies: z.array(z.string()),
  comparabilityGroup: z.string(),
})

export const appManifestSchema = z.object({
  appName: z.string(),
  generatedAt: z.string(),
  lastRefresh: z.string(),
  defaultStoryId: z.string(),
  providers: z.array(
    z.object({
      id: providerSchema,
      label: z.string(),
      blurb: z.string(),
    }),
  ),
  datasets: z.array(manifestDatasetSchema),
})

export const storyPresetSchema = z.object({
  id: z.string(),
  title: z.string(),
  kicker: z.string(),
  description: z.string(),
  query: z.object({
    provider: providerSchema,
    metric: z.string(),
    period: z.string(),
    mode: geographyModeSchema,
    selection: z.string(),
  }),
})

export const storyCollectionSchema = z.array(storyPresetSchema)

export const queryStateSchema = z.object({
  provider: providerSchema,
  metric: z.string(),
  period: z.string(),
  mode: geographyModeSchema,
  selection: z.string(),
})

export type ProviderId = z.infer<typeof providerSchema>
export type GeoType = z.infer<typeof geoTypeSchema>
export type GeographyMode = z.infer<typeof geographyModeSchema>
export type ValueType = z.infer<typeof valueTypeSchema>
export type PeriodMeta = z.infer<typeof periodMetaSchema>
export type ColorRamp = z.infer<typeof colorRampSchema>
export type Observation = z.infer<typeof observationSchema>
export type DatasetArtifact = z.infer<typeof datasetArtifactSchema>
export type ManifestDataset = z.infer<typeof manifestDatasetSchema>
export type AppManifest = z.infer<typeof appManifestSchema>
export type StoryPreset = z.infer<typeof storyPresetSchema>
export type QueryState = z.infer<typeof queryStateSchema>
