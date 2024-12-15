import { formateDate } from '@/lib/utils';
import { client } from '@/sanity/lib/client';
import { PLAYLIST_BY_SLUG_QUERY, STARTUP_BY_ID_QUERY } from '@/sanity/lib/queries';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React, { Suspense } from 'react'
import markdownIt from 'markdown-it';
import { Skeleton } from '@/components/ui/skeleton';
import View from '@/components/View';
import StartupCard, { StartupTypeCard } from '@/components/StartupCard';

export const experimental_ppr = true;

const md = markdownIt()

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;

  const [post, { select: editorPosts }] = await Promise.all([
    client.fetch(STARTUP_BY_ID_QUERY, { id }),
    client.fetch(PLAYLIST_BY_SLUG_QUERY, {
      slug: "editor-picks-new",
    }),
  ]);

  if (!post) return notFound()

  const { title, description, _createdAt, image, author, category, pitch } = post;

  const parsedPitch = md.render(pitch ??
    ''
  )

  return (
    <>
      <section className="pink_container !min-h-[230px]">
        <p className="tag">
          {formateDate(_createdAt)}
        </p>

        <h1 className="heading">{title}</h1>
        <p className="sub-heading !max-w-5xl">{description}</p>
      </section>

      <section className="section_container">
        <img src={image} alt="thumbnail" className="w-full h-auto rounded-xl" />


        <div className="space-y-5 mt-10 max-w-4xl mx-auto">
          <div className="flex-between gap-5">
            <Link href={`/user/${author?._id}`} className="flex gap-2 items-center mb-3">
              <Image src={author?.image} alt='avatar' objectFit="cover" width={64} height={64} className='rounded-full drop-shadow-lg object-cover aspect-square' />


              <div>
                <p className="text-20-medium">{author?.name}</p>
                <p className="text-16-medium !text-black-300">{author?.username}</p>
              </div>
            </Link>

            <p className="category-tag">
              {category}
            </p>
          </div>

          <h3 className="text-30-bold">
            Pitch Details
          </h3>

          {parsedPitch ? (
            <article className='prose max-w-4xl font-work-sand break-all' dangerouslySetInnerHTML={{ __html: parsedPitch }} />

          ) : (
            <p className="no-result">No details provided</p>
          )}


        </div>

        <hr className="divider" />

        {editorPosts?.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <p className="text-30-semibold">Editor Picks</p>

            <ul className="mt-7 card_grid-sm">
              {editorPosts.map((post: StartupTypeCard, i: number) => (
                <StartupCard key={i} post={post} />
              ))}
            </ul>
          </div>
        )}

        <Suspense fallback={<Skeleton className='view_skeleton' />}>
          <View id={id} />
        </Suspense>
      </section>
    </>
  )
}

export default page