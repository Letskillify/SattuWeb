import React from 'react';
import Hero from '../Sattu/Hero';
import BenefitsStrip from '../Sattu/BenefitsStrip';
import Bestsellers from '../Sattu/Bestsellers';
import FlavorsSection from '../Sattu/FlavorsSection';
import WhyChooseSection from '../Sattu/WhyChooseSection';
import HowToMake from '../Sattu/HowToMake';
import Testimonials from '../Sattu/Testimonials';
import OfferBanner from '../Sattu/OfferBanner';

const Home = () => {
  return (
    <main className="bg-brand-cream min-h-screen">
      <Hero />
      <Bestsellers />
      <BenefitsStrip />
      {/* <FlavorsSection /> */}
      {/* <WhyChooseSection /> */}
      <HowToMake />
      {/* <OfferBanner /> */}
      <Testimonials />
    </main>
  );
};

export default Home;
