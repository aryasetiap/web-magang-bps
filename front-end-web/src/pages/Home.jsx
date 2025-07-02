import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero'
import About from '../components/About';
import Faq from '../components/Faq';
import Contact from '../components/Contact';
import Footer from '../components/Footer';



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