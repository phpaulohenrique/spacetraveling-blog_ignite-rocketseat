import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { FaUser  } from 'react-icons/fa';
import {  AiOutlineCalendar, AiOutlineUser } from 'react-icons/ai';
import { useState } from 'react';

import { getPrismicClient } from '../services/prismic';

// import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';

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

  const [posts, setPosts] = useState(postsPagination);


  const handleLoadNextPage = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();


    const response = await fetch(posts.next_page).then(response =>
      response.json()
    );


    const postsResponseResults = response.results.map(post => ({
      ...post,
      first_publication_date: post.first_publication_date,
    }));


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




  };

  return (
    <>
      <Head>
        <title>Home | spacetraveling</title>
      </Head>

      <Header/>

      <main className={styles.main}>

        <div className={styles.posts}>
          {posts.results.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a className={styles.post}>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>

                
                <time>
                  <AiOutlineCalendar/>
                  {format(
                    new Date(post.first_publication_date),
                    'dd MMM yyyy',
                    {
                      locale: ptBR,
                    }
                  )}
                </time>
                <span>
                  <AiOutlineUser />
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
  const prismic = getPrismicClient();
  const response = await prismic.getByType('posts', { pageSize: 1 });


  const posts = response.results?.map(post => {
    return {


      uid: post?.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });


  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: posts,
      },
    },
    revalidate: 1, // 1s
  };

};
