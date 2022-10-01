import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FaCalendar, FaUser } from 'react-icons/fa';
import { useState } from 'react';

import { getPrismicClient } from '../services/prismic';

// import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface postsPagination {
  
    next_page: string;
    results: Post[];
  
}

interface HomeProps {
  postsPagination: postsPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  // TODO

  // console.log(postsPagination.postsResponse);

  const [posts, setPosts] = useState(postsPagination);


  const handleLoadNextPage = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();


    const response = await fetch(posts.next_page).then(response =>
      response.json()
    );
    // console.log(response);

    // console.table(posts);

    const postsResponseResults = response.results.map(post => ({
      ...post,
      first_publication_date: post.first_publication_date,
    }));

    // console.log(posts);
    // console.log(postsResponseResults);

    // setPosts(posts, [...posts.postsResponse.results, response.results ]);

    // const results = ;

    let newPosts

    console.log(response.next_page)

    if(response.next_page){

      setPosts({
        next_page: response.next_page,
        results: [...posts.results, ...postsResponseResults],
      })
      return
    }


    setPosts({
      next_page: null,
      results: [...posts.results, ...postsResponseResults],
    });



  
    // console.log(results);
    // console.log(newPosts);

    // postsPagination = newPosts

    // setPosts( newPosts );
    // console.log(posts);
  };

  return (
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>

      <main className={styles.main}>
        <img src="/logo-spacetraveling.svg" alt="spacetraveling logo" />

        <div className={styles.posts}>
          {posts.results.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a className={styles.post}>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>

                <time>
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </time>
                <span>
                  <FaUser />
                  {post.data.author}
                </span>
              </a>
            </Link>
          ))}
        </div>

        {posts.next_page && (
          <button
            onClick={handleLoadNextPage}
            className={styles.btnLoadMorePosts}
          >
            Carregar mais posts
          </button>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const response = await prismic.getByType('posts', { pageSize: 1 });
  // const oi = 'ds'

  // console.log(postsResponse);

  const posts = response.results?.map(post => {
    return {
      // next_page: response.next_page,

      uid: post?.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  const postsResponse = {
    next_page: response.next_page,
    results: posts,
  };

  // }
  // console.log('oi');
  // console.log(postsResponses);
  // console.log(postsPagination);

  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: posts,
      },
    },
    revalidate: 1, // 1s
  };

  // TODO
};
