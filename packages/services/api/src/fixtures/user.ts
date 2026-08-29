import { faker } from "@faker-js/faker"

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  createdAt: Date
}

export const generateUser = (): User => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  avatar: faker.image.avatar(),
  createdAt: faker.date.past(),
})

export const generateUsers = (count: number = 10): User[] => {
  return Array.from({ length: count }, () => generateUser())
}
