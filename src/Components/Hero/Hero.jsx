import React from 'react'
import { useTranslation } from 'react-i18next';
import '../Hero/Hero.css'
import dark_arrow from '../../assets/dark-arrow.png'

const Hero = () => {
    const { t } = useTranslation();
    
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
    <div className='hero container'>
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
