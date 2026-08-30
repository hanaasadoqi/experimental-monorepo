export interface SelectionSlice<TId> {
  selectedIds: ReadonlySet<TId>
  select(id: TId): void
  deselect(id: TId): void
  toggle(id: TId): void
  clearSelection(): void
}

export function createSelectionSlice<TId>(
  set: (recipe: (state: SelectionSlice<TId>) => Partial<SelectionSlice<TId>>) => void,
): SelectionSlice<TId> {
  return {
    selectedIds: new Set<TId>(),
    select: (id) => set((state) => ({ selectedIds: new Set(state.selectedIds).add(id) })),
    deselect: (id) => set((state) => { const next = new Set(state.selectedIds); next.delete(id); return { selectedIds: next } }),
    toggle: (id) => set((state) => { const next = new Set(state.selectedIds); next.has(id) ? next.delete(id) : next.add(id); return { selectedIds: next } }),
    clearSelection: () => set(() => ({ selectedIds: new Set<TId>() })),
  }
}
