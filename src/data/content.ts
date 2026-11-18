import { getCollection, type CollectionEntry } from 'astro:content';

type Media = NonNullable<CollectionEntry<'projects'>['data']['media']>[number];
export type { Media };

export const visible = (media: Media[] = []) => media.filter((item) => item.public);

const byOrder = <T extends { data: { order: number } }>(items: T[]) => items.sort((a, b) => a.data.order - b.data.order);

export const getResearch = async () => byOrder(await getCollection('research'));
export const getProjects = async () => byOrder(await getCollection('projects'));
export const getExperience = async () => byOrder(await getCollection('experience'));
export const getTeaching = async () => byOrder(await getCollection('teaching'));

export const statusLabel = { published: 'Published', 'in-progress': 'In progress' } as const;
