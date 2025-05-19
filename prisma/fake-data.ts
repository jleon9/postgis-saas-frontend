import {  } from '@prisma/client';
import { faker } from '@faker-js/faker';
import Decimal from 'decimal.js';



export function fakeRole() {
  return {
    updatedAt: faker.date.anytime(),
    name: faker.person.fullName(),
    description: undefined,
  };
}
export function fakeRoleComplete() {
  return {
    id: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
    name: faker.person.fullName(),
    description: undefined,
  };
}
export function fakeOrganization() {
  return {
    updatedAt: faker.date.anytime(),
    name: faker.person.fullName(),
    slug: faker.lorem.words(5),
    domain: undefined,
  };
}
export function fakeOrganizationComplete() {
  return {
    id: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
    name: faker.person.fullName(),
    slug: faker.lorem.words(5),
    domain: undefined,
  };
}
export function fakeUser() {
  return {
    updatedAt: faker.date.anytime(),
    email: faker.internet.email(),
    password: faker.lorem.words(5),
    name: faker.person.fullName(),
  };
}
export function fakeUserComplete() {
  return {
    id: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
    email: faker.internet.email(),
    password: faker.lorem.words(5),
    name: faker.person.fullName(),
    roleId: faker.string.uuid(),
    organizationId: faker.string.uuid(),
  };
}
export function fakeRefreshToken() {
  return {
    updatedAt: faker.date.anytime(),
    hashedToken: faker.lorem.words(5),
    expires: faker.date.anytime(),
  };
}
export function fakeRefreshTokenComplete() {
  return {
    id: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
    hashedToken: faker.lorem.words(5),
    expires: faker.date.anytime(),
    revoked: false,
    userId: faker.string.uuid(),
  };
}
export function fakeAuthor() {
  return {
    updatedAt: faker.date.anytime(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
  };
}
export function fakeAuthorComplete() {
  return {
    id: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    organizationId: faker.string.uuid(),
  };
}
export function fakePost() {
  return {
    updatedAt: faker.date.anytime(),
    title: faker.lorem.words(5),
    content: faker.lorem.words(5),
  };
}
export function fakePostComplete() {
  return {
    id: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
    title: faker.lorem.words(5),
    content: faker.lorem.words(5),
    tags: [],
    authorId: faker.string.uuid(),
    organizationId: faker.string.uuid(),
  };
}
export function fakeProperty() {
  return {
    updatedAt: faker.date.anytime(),
    address: faker.lorem.words(5),
    price: new Decimal(faker.number.float()),
    bedrooms: faker.number.int(),
    bathrooms: faker.number.int(),
    sqft: faker.number.int(),
    location: `POINT(${faker.location.longitude()} ${faker.location.latitude()})`,
  };
}
export function fakePropertyComplete() {
  return {
    id: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
    organizationId: faker.string.uuid(),
    address: faker.lorem.words(5),
    price: new Decimal(faker.number.float()),
    bedrooms: faker.number.int(),
    bathrooms: faker.number.int(),
    sqft: faker.number.int(),
    location: `POINT(${faker.location.longitude()} ${faker.location.latitude()})`,
  };
}
export function fakePropertySimilarity() {
  return {
    updatedAt: faker.date.anytime(),
    similarity_score: faker.number.float(),
    priceScore: faker.number.float(),
    sizeScore: faker.number.float(),
    locationScore: faker.number.float(),
    amenityScore: faker.number.float(),
  };
}
export function fakePropertySimilarityComplete() {
  return {
    id: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
    propertyId: faker.string.uuid(),
    similarPropertyId: faker.string.uuid(),
    similarity_score: faker.number.float(),
    priceScore: faker.number.float(),
    sizeScore: faker.number.float(),
    locationScore: faker.number.float(),
    amenityScore: faker.number.float(),
  };
}
export function fakeAmenity() {
  return {
    updatedAt: faker.date.anytime(),
    name: faker.person.fullName(),
    type: faker.lorem.words(5),
    location: faker.lorem.words(5),
  };
}
export function fakeAmenityComplete() {
  return {
    id: faker.string.uuid(),
    createdAt: new Date(),
    updatedAt: faker.date.anytime(),
    name: faker.person.fullName(),
    type: faker.lorem.words(5),
    location: faker.lorem.words(5),
  };
}
