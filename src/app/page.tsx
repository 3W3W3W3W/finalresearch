import { getMainContent, getIdleImage } from '@/lib/content';
import Hero from '@/components/Hero';
import IdleImage from '@/components/IdleImage';
import AnimatedText from '@/components/AnimatedText';

export default async function Home() {
  const content = await getMainContent();
  const idleImage = await getIdleImage();

  return (
    <main className="w-full">
      <Hero text={content.heroText} image={content.heroImage} />

      <section className="py-20 px-4 max-w-4xl mx-auto">
        {content.contact && (
          <AnimatedText text={content.contact.content || ''} />
        )}
      </section>

      <IdleImage image={idleImage} />
    </main>
  );
}
