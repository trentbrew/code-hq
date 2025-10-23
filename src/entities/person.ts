/**
 * Person entity schema
 */

export interface Person {
  '@id': string;
  '@type': 'Person';
  name: string;
  email?: string;
  role?: string;
  avatar?: string; // URL
  github?: string;
  timezone?: string;
}

export function createPerson(data: Partial<Person> & { name: string }): Person {
  const id = data['@id'] || `person:${data.name.toLowerCase().replace(/\s+/g, '-')}`;
  
  return {
    '@id': id,
    '@type': 'Person',
    name: data.name,
    email: data.email,
    role: data.role,
    avatar: data.avatar,
    github: data.github,
    timezone: data.timezone,
  };
}
