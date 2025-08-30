import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../Navbar/Navbar';
import Home from '../Hero/Hero';
import Services from '../Serv/Serv';
import About from '../About/About';
import Contact from '../Footer/Footer';
import Foot from '../Foot/Foot'
import Title from '../Title/Title'
import Gallery from '../Gallery/Gallery'

const MainPage = () => {
    const { t } = useTranslation();
    const location = useLocation();

    useEffect(() => {
        // Handle scroll navigation when coming from other pages
        if (location.state?.scrollTo) {
            const element = document.getElementById(location.state.scrollTo);
            if (element) {
                // Add a small delay to ensure the page is fully loaded
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [location.state]);

    return (
    <div className="main-page">
      <Navbar /> {/* Navbar is only on the main page */}
      <Home id="hero" /> {/* Home section */}
      
      <div className="main-content">
        <section className="services-section">
          <div className="container">
            <Title subTitle={t('main.servicesSubtitle')} title={t('main.servicesTitle')}/>
            <Services id="serv" /> {/* Services section */}
          </div>
        </section>
        
        <section className="about-section">
          <div className="container">
            <About id="about" /> {/* About section */}
          </div>
        </section>
        
        <section className="gallery-section">
          <div className="container">
            <Title subTitle={t('main.gallerySubtitle')} title={t('main.galleryTitle')}/>
            <Gallery id="gallery" /> {/* Gallery section */}
          </div>
        </section>
        
        <Foot/>
      </div>
    </div>
    );
};

export default MainPage;