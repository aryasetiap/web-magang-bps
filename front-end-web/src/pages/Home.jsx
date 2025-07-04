import React from 'react';
import Header from '../components/landing/Header';
import Hero from '../components/landing/Hero'
import About from '../components/landing/About';
import Faq from '../components/landing/Faq';
import Contact from '../components/landing/Contact';
import Footer from '../components/landing/Footer';



function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <Header />
      <main className="flex-grow">
        <Hero />
        <About />
        <Faq />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default Home;