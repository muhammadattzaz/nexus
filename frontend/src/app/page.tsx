import Navbar from '@/components/layout/Navbar';
import HeroSection from '@/components/landing/HeroSection';
import HeroSearchCard from '@/components/landing/HeroSearchCard';
import SuggestedQuestions from '@/components/landing/SuggestedQuestions';
import ActionGrid from '@/components/landing/ActionGrid';
import StatsBar from '@/components/landing/StatsBar';
import FeaturedModels from '@/components/landing/FeaturedModels';
import FeatureCards from '@/components/landing/FeatureCards';
import LabsBrowser from '@/components/landing/LabsBrowser';
import ModelComparisonTable from '@/components/landing/ModelComparisonTable';
import TrendingFeed from '@/components/landing/TrendingFeed';
import Newsletter from '@/components/landing/Newsletter';
import Footer from '@/components/layout/Footer';
import ModelDetailModal from '@/components/chathub/ModelDetailModal';

export default function LandingPage() {
  return (
    <main style={{ background: 'var(--bg)' }}>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <HeroSection />
        <HeroSearchCard />
        <SuggestedQuestions />
        <ActionGrid />
        <StatsBar />
        <FeaturedModels />
        <FeatureCards />
        <LabsBrowser />
        <ModelComparisonTable />
        <TrendingFeed />
        <Newsletter />
      </div>
      <Footer />
      <ModelDetailModal />
    </main>
  );
}
