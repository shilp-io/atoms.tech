import HomeLoading from './loading';

// This page component will never actually be rendered
// because the route handler will redirect before this component is rendered
export default function HomePage() {
  return <HomeLoading />;
}
