import React from 'react'
import '../Hero/Hero.css'
import dark_arrow from '../../assets/dark-arrow.png'

const Hero = () => {
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
                Global Artist Network
            </h1>
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque voluptatum quo exercitationem at, dolorum ipsa?</p>
            
        </div>
    </div>
    )
}

export default Hero
