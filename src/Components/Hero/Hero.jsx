import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';
import '../Hero/Hero.css'
import dark_arrow from '../../assets/dark-arrow.png'

const Hero = () => {
    const { t } = useTranslation();
    const [imageLoaded, setImageLoaded] = useState(false);
    
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
    }, []);
    
    const scrollToFooter = () => {
        // Try to find the contact section or footer
        const contactSection = document.getElementById('contact') || 
                              document.querySelector('.contact-section') ||
                              document.querySelector('footer');
        
        if (contactSection) {
            // Simple smooth scroll
            contactSection.scrollIntoView({ 
                behavior: 'smooth'
            });
        } else {
            // If no contact section found, scroll to bottom
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    return (
    <div className={`hero container ${imageLoaded ? 'image-loaded' : ''}`}>
        <div className="hero-txt">
            <h1>
            {t('hero.title')}
            </h1>
            <p>{t('hero.subtitle')}</p>
            
        </div>
    </div>
    )
}

export default Hero
