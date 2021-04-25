import { GetStaticProps } from 'next';
import Image from 'next/image';
import { api } from '../services/api';
import { HomeProps } from '../types/HomeProps';
import { format, parseISO } from 'date-fns';
import convertDurationToTimeString from '../utils/convertDurationToTimeString';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import styles from './home.module.scss';

export default function Home(props: HomeProps) {
  //[SPA] dispara uma vez no carregamento
  // useEffect(() => {
  //   fetch('http://localhost:3333/episodes')
  //     .then(response => response.json())
  //     .then(response => console.log(response));
  // }, [])

  return (
    <div className={styles.homePage}>
      <section className={styles.latestEpisodes}>
        <h2>Últimos Lançamentos</h2>
        <ul>
          {props.latestEpisodes.map(ep => {
            return(
              <li key={ep.id}>
                <Image width={192} height={192} src={ep.thumbnail} alt={ep.title} objectFit='cover' />
                <div className={styles.episodeDetails}>
                  <Link href={`/episodes/${ep.id}`}>{ep.title}</Link>
                  <p>{ep.members}</p>
                  <span>{ep.publishedAt}</span>
                  <span>{ep.durationAsString}</span>
                </div>

                <button>
                  <Image width={192} height={192} src='/play-green.svg' alt="Tocar episódio" objectFit='cover' />
                </button>
              </li>
            )
          })}
        </ul>
      </section>
      <section className={styles.allEpisodes}>
        <h2>Todos os episódios</h2>
        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {props.allEpisodes.map(ep => {
              return(
                <tr key={ep.id}>
                  <td style={{width:72}}>
                    <Image width={120} height={120} src={ep.thumbnail} alt={ep.title} objectFit='cover' />
                  </td>
                  <td><Link href={`/episodes/${ep.id}`}>{ep.title}</Link></td>
                  <td>{ep.members}</td>
                  <td style={{ width: 100 }}>{ep.publishedAt}</td>
                  <td>{ep.durationAsString}</td>
                  <td>
                    <button type='button'>
                      <img src='/play-green.svg' alt='Tocar episódio' />
                    </button>
                  </td>
                  
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}

//[SSR] Renderiza do lado do servidor
// export async function getServerSideProps(){
//   const response = await fetch('http://localhost:3333/episodes');
//   const data = await response.json();

//   return {
//     props: {
//       episodes: data
//     }
//   };
// }

//[SSG] Static site generation (salva uma página estática no server e retorna ela toda hora)
export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12, 
      _sort: 'published_at',
      _order: 'desc'
    }
  });

  const episodes = data.map(ep => {
    return {
      id: ep.id,
      title: ep.title,
      thumbnail: ep.thumbnail, 
      members: ep.members, 
      publishedAt: format(parseISO(ep.published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(ep.file.duration), 
      description: ep.description, 
      durationAsString: convertDurationToTimeString(Number(ep.file.duration)), 
      url: ep.file.url
    }
  })

  const allEpisodes = episodes.slice(2, episodes.length);
  const latestEpisodes = episodes.slice(0, 2);

  return {
    props: {
      allEpisodes: episodes, 
      latestEpisodes: latestEpisodes
    }, 
    revalidate: 60 * 60 * 8
  };
}