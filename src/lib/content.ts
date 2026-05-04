import { insforge } from './insforge';
import { placeholderContent, placeholderCourses } from '../data/placeholders';

export type Course = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  objective: string;
  contents: string[];
  audience: string;
  modality: string;
  priceClp: number;
  durationHours: number;
  moodleCourseUrl?: string;
};

export type SiteContent = {
  brandName: string;
  logoText: string;
  eyebrow: string;
  heroTitle: string;
  heroBody: string;
  primaryCta: string;
  secondaryCta: string;
  aboutTitle: string;
  aboutBody: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  moodleUrl: string;
};

type DbCourse = {
  id: string;
  slug: string;
  title: string;
  short_description: string;
  description: string;
  objective: string;
  contents: string[];
  audience: string;
  modality: string;
  price_clp: number;
  duration_hours: number;
  moodle_course_url?: string;
};

const mapCourse = (course: DbCourse): Course => ({
  id: course.id,
  slug: course.slug,
  title: course.title,
  shortDescription: course.short_description,
  description: course.description,
  objective: course.objective,
  contents: course.contents ?? [],
  audience: course.audience,
  modality: course.modality,
  priceClp: course.price_clp,
  durationHours: course.duration_hours,
  moodleCourseUrl: course.moodle_course_url,
});

export async function getPublishedCourses(): Promise<Course[]> {
  if (!insforge) return placeholderCourses;

  try {
    const { data, error } = await insforge.database
      .from('courses')
      .select('*')
      .eq('status', 'published')
      .order('display_order', { ascending: true });

    if (error || !data?.length) return placeholderCourses;
    return data.map(mapCourse);
  } catch {
    return placeholderCourses;
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  if (!insforge) return placeholderContent;

  try {
    const { data, error } = await insforge.database
      .from('site_settings')
      .select('value')
      .eq('key', 'public_site')
      .single();

    if (error || !data?.value) return placeholderContent;
    return { ...placeholderContent, ...data.value };
  } catch {
    return placeholderContent;
  }
}

export async function createContactMessage(input: {
  name: string;
  email: string;
  message: string;
  phone?: string;
}) {
  if (!insforge) {
    console.info('InsForge no configurado. Mensaje local:', input);
    return { ok: true };
  }

  const { error } = await insforge.database.from('contact_messages').insert([
    {
      full_name: input.name,
      email: input.email,
      phone: input.phone,
      message: input.message,
      source: 'public_site',
    },
  ]);

  if (error) throw new Error(error.message ?? 'No se pudo enviar el mensaje');
  return { ok: true };
}
