import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Head from 'next/head';
import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link';
import { RichText } from 'prismic-dom';
import * as prismic from '@prismicio/client';

import { FaCalendar, FaUser, FaClock } from 'react-icons/fa';
import { FiCalendar } from 'react-icons/fi';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

// import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';
import { AiOutlineCalendar, AiOutlineClockCircle, AiOutlineUser } from 'react-icons/ai';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;

    content: {
      heading: string;
      body: Record<string, unknown>[];
    }[];
  };
}

interface NeighborhoodPost {
  // title: string;
  uid: string;
  data: {
    title: string;
  };
}

interface PostProps {
  post: Post;
  // preview: boolean;
  previousPost?: NeighborhoodPost | null;
  nextPost?: NeighborhoodPost | null;
}

export default function Post({ post, previousPost, nextPost }: PostProps) {
 


  const router = useRouter();



  const amountWordsOfBody = RichText.asText(
    post.data.content.reduce((acc, data) => [...acc, ...data.body], [])
  ).split(' ').length;

  const amountWordsOfHeading = post.data.content.reduce((acc, data) => {
    if (data.heading) {
      return [...acc, ...data.heading.split(' ')];
    }

    return [...acc];
  }, []).length;

  const readPerMinute = 200;

  const readingTime = Math.ceil(
    (amountWordsOfBody + amountWordsOfHeading) / readPerMinute
  );

  console.log(readingTime);

  if (router.isFallback) {
    return <span className={styles.loading}>Carregando...</span>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>

      <Header />

      {post && (
        <>
        {post.data?.banner?.url && (
            <img
              className={styles.imgBanner}
              src={post.data.banner?.url}
              // alt={post.data.banner?.alt}
              alt=""
              title={post.data.title}
            />
          )}

        <main className={styles.main}>
          

          <article>
            <header>
              <h1>{post.data.title}</h1>

              <div className={styles.postInfo}>

                <time>
                  <AiOutlineCalendar />

                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </time>
                <span>
                  <AiOutlineUser /> {post.data.author}
                </span>
                <span>
                  <AiOutlineClockCircle />
                  {readingTime} min
                </span>
              </div>
            </header>

            <div className={styles.content}>
              {post.data.content.map(postContent => {
                return (
                  <div
                    key={postContent.heading}
                    className={styles.paragraphContent}
                  >
                    <h2>{postContent.heading}</h2>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: RichText.asHtml(postContent.body),
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </article>
          <hr />

          <aside className={styles.footer}>
            <div>
              {previousPost && (
                  <>
                  <span>{previousPost.data.title}</span>
                  <Link href={`/post/${previousPost.uid}`}>
                    <a>Post anterior</a>
                  </Link>
                  </>
                
              )}
            </div>

            <div>

              {nextPost && (
                <>
                  <span>{nextPost.data.title}</span>
                  <Link href={`/post/${nextPost.uid}`}>
                    <a>Próximo Post</a>
                  </Link>
                </>
              )}

            </div>

          </aside>
        </main>
        </>
      )}
    </>
  );
}


export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const posts = await prismic.getByType('posts');


  const paths = posts.results.map(post => ({
    params: { slug: post.uid },
  }));


  return {
    paths: paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {

  const { slug } = params;

  if (slug === 'favicon.png') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(params.slug));


  const responsePreviousPost = await prismic.getByType('posts', {
    // predicates: [],
    orderings: {
      field: 'document.first_publication_date',
      direction: 'desc',
    },
    after: String(response.id),
    pageSize: 1,
  });

  const responseNextPost = await prismic.getByType('posts', {
    // predicates: [],
    orderings: {
      field: 'document.first_publication_date',
      direction: 'asc',
    },
    after: String(response.id),
    pageSize: 1,
  });


  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: response?.data,
  };


  return {
    props: {
      post,
      previousPost: responsePreviousPost?.results[0] ?? null,
      nextPost: responseNextPost?.results[0] ?? null,

    },
  };

};
