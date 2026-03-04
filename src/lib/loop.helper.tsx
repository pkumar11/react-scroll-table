import { faker } from "@faker-js/faker";

// Generate `count` fake rows starting from `start` index.
export const processData = (start: number, count: number) => {
  const data = [];
  for (let i = start; i < start + count; i++) {
    data.push({
      id: i,
      name: faker.internet.username(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zip: faker.location.zipCode(),
      country: faker.location.country(),
      website: faker.internet.url(),
    });
  }
  return data;
};