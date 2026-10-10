// Real UniCoach student video stories (owner-supplied files). Shared by the homepage
// testimonials row and the Digest page.
import videoAyyaz from '@/assets/testimonial/video_ayyaz.mp4';
import videoNamrita from '@/assets/testimonial/video_namrita.mp4';
import videoAkshat from '@/assets/testimonial/video_akshat.mp4';
import videoAnurag from '@/assets/testimonial/video_anurag.mp4';
import videoHardik from '@/assets/testimonial/video_hardik.mp4';
import videoPreeti from '@/assets/testimonial/video_preeti.mp4';

import thumbAyyaz from '@/assets/testimonial/thumb_ayyaz.webp';
import thumbNamrita from '@/assets/testimonial/thumb_namrita.webp';
import thumbAkshat from '@/assets/testimonial/thumb_akshat.webp';
import thumbAnurag from '@/assets/testimonial/thumb_anurag.webp';
import thumbHardik from '@/assets/testimonial/thumb_hardik.webp';
import thumbPreeti from '@/assets/testimonial/thumb_preeti.webp';

import avatarAyyaz from '@/assets/testimonial/avatar_ayyaz.webp';
import avatarNamrita from '@/assets/testimonial/avatar_namrita.webp';
import avatarAkshat from '@/assets/testimonial/avatar_akshat.webp';
import avatarAnurag from '@/assets/testimonial/avatar_anurag.webp';
import avatarHardik from '@/assets/testimonial/avatar_hardik.webp';
import avatarPreeti from '@/assets/testimonial/avatar_preeti.webp';

const student = (name, videoUrl, thumbnail, avatar) => ({
  id: `video-${name.toLowerCase()}`,
  name,
  role: 'UniCoach Student',
  tag: 'Success Story',
  videoUrl,
  thumbnail,
  avatar,
});

// Real UniCoach students, named as in the owner's video files. Each video is listed once:
// the row below loops, so nothing has to be repeated here.
// Display order: Preeti opens the row; Namrita and Ayyaz come last
export const STUDENT_VIDEOS = [
  student('Preeti', videoPreeti, thumbPreeti, avatarPreeti),
  student('Akshat', videoAkshat, thumbAkshat, avatarAkshat),
  student('Anurag', videoAnurag, thumbAnurag, avatarAnurag),
  student('Hardik', videoHardik, thumbHardik, avatarHardik),
  student('Namrita', videoNamrita, thumbNamrita, avatarNamrita),
  student('Ayyaz', videoAyyaz, thumbAyyaz, avatarAyyaz),
];
