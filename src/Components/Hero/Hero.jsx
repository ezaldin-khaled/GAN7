import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import '../Hero/Hero.css'
import dark_arrow from '../../assets/dark-arrow.png'

const Hero = () => {
    const { t } = useTranslation();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    
    useEffect(() => {
        // Preload the appropriate hero image based on screen size
        const preloadHeroImage = () => {
            const img = new Image();
            let imageSrc = '/src/assets/ewew/optimized/hero-mobile.webp';
            
            if (window.innerWidth >= 1920) {
                imageSrc = '/src/assets/ewew/optimized/hero-desktop.webp';
            } else if (window.innerWidth >= 768) {
                imageSrc = '/src/assets/ewew/optimized/hero-tablet.webp';
            }
            
            img.onload = () => setImageLoaded(true);
            img.src = imageSrc;
        };
        
        preloadHeroImage();
        
        // Trigger animation after component mounts
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);
    
    const scrollToServices = () => {
        const servicesSection = document.getElementById('services') || 
                              document.querySelector('.services-section') ||
                              document.querySelector('.main-content');
        
        if (servicesSection) {
            servicesSection.scrollIntoView({ 
                behavior: 'smooth'
            });
        } else {
            // If no services section found, scroll down a bit
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        }
    };

    return (
    <div className={`hero container ${imageLoaded ? 'image-loaded' : ''} ${isVisible ? 'visible' : ''}`}>
        <div className="hero-txt">
            <h1>
                {t('hero.title')}
            </h1>
            <p>{t('hero.subtitle')}</p>
            
            <div className="hero-actions">
                <button className="hero-btn primary" onClick={scrollToServices}>
                    Discover More
                    <img src={dark_arrow} alt="arrow" className="hero-arrow" />
                </button>
                <button className="hero-btn secondary">
                    Join Now
                </button>
            </div>
        </div>
        
        <div className="scroll-indicator">
            <div className="scroll-arrow"></div>
        </div>
    </div>
    )
}

export default Hero
