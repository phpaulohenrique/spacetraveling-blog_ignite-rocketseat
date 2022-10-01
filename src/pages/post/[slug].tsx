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

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
      // alt: string;
    };
    author: string;
    // content: {
    //   heading: string;
    //   body: {
    //     text: Record<string, unknown>[];
    //   }[];
    // }[];

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
  // TODO

  // console.log(nextPost)
  console.log(previousPost);
  console.log(post);

  const router = useRouter();

  // const a = post.data.content;
  // console.log(a);

  // const opa = post.data.content

  // console.log(opa[0].body)

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
        <main className={styles.main}>
          {post.data.banner.url && (
            <img
              className={styles.imgBanner}
              src={post.data.banner?.url}
              // alt={post.data.banner?.alt}
              alt="dasdasd"
            />
          )}

          <article>
            <header>
              <h1>{post.data.title}</h1>

              <div className={styles.postInfo}>
                <span className={styles.infoIcon}>
                  <FiCalendar />
                </span>
                <time>{
                  format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )
                  }
                  
                </time>
                <span>
                  <FaUser /> {post.data.author}
                </span>
                <span>
                  <FaClock />
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
            {previousPost && (
              <div>
                <span>{previousPost.data.title}</span>
                <Link href="/">
                  <a>Post anterior</a>
                </Link>
              </div>
            )}

            {nextPost && (
              <div>
                <span>{nextPost.data.title}</span>
                <Link href="/">
                  <a>Próximo Post</a>
                </Link>
              </div>
            )}
          </aside>
        </main>
      )}
    </>
  );
}

// function verifyNeighborhoodPost(post, slug): NeighborhoodPost | null {
//   return slug === post.results[0].uid
//     ? null
//     : {
//       title: post.results[0]?.data?.title,
//       uid: post.results[0]?.uid,
//     };
// }

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('posts');

  // console.log(posts);

  const twoPosts = posts.results.slice(0, 2);

  // console.log(twoPosts);

  const paths = twoPosts.map(post => ({
    params: { slug: post.uid },
  }));
  console.log(paths);

  // TODO

  return {
    paths: paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // console.log(params.slug);

  const { slug } = params;

  if (slug === 'favicon.png') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const prismic = getPrismicClient({});

  const response = await prismic.getByUID('posts', String(params.slug));
  // console.log(response);

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
  // console.log('eiiiiiiiiiiiiiiiita')
  // console.log(responsePreviousPost)

  // console.log('asdasdas');

  // const previousPost =
  //   responsePreviousPost.results.length !== 0
  //     ? {
  //         title: responsePreviousPost.results[0].data.title,
  //         uid: responsePreviousPost.results[0].uid,
  //       }
  //     : null;

  // // console.log('----------------')
  // // console.log(responseNextPost);

  // const nextPost = responseNextPost.results.length !== 0 ? {
  //   title: responseNextPost.results[0].data.title,
  //   uid: responseNextPost.results[0].uid,
  // } : null;

  // console.log(previousPost)

  // const nextPost = verifyNeighborhoodPost(responseNextPost, slug);

  // const previousPost = verifyNeighborhoodPost(responsePreviousPost, slug);

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: response.data,
  };

  // console.log('post');
  // console.log(post);

  // const res = await prismic.getByType('posts', { pageSize: 1 });

  console.log(responsePreviousPost.results);
  console.log('aquiiiiiiiiiiiiiiiiiii');

  // post.data.



  return {
    props: {
      post,
      previousPost: responsePreviousPost?.results[0] ?? null,
      nextPost: responseNextPost?.results[0] ?? null,
      // previousPost: null,
      // nextPost: null
    },
  };

  // TODO
};
