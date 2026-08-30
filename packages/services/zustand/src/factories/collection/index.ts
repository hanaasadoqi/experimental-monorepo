export interface EntityCollection<TId, TEntity> {
  entities: Readonly<Record<string, TEntity>>
  ids: readonly TId[]
}
