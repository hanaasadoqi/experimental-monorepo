export interface Serializer<T> {
  serialize(value: T): string
  deserialize(serialized: string): T
}

export type UnknownParser<T> = (value: unknown) => T
