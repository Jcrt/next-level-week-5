import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';

export default function Episode(){

  const router = useRouter();

  return(
    <h1>{router.query.slug}</h1>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}, 
    revalidate: 60 * 60 * 24
  }
}