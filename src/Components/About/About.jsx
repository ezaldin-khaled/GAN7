import React from 'react'
import { useTranslation } from 'react-i18next';
import '../About/About.css'
import about_img from '../../assets/ewew/about.png'
// import play_icon from '../../assets/play-icon.png'

const About = () => {
    const { t } = useTranslation();
    
    return (
    <div className='about'>
        <div className="about-left">
            <img src={about_img} alt="" className='about-img'/>
            {/* <img src={play_icon} alt="" className='play-icon'/> */}
        </div>
        <div className="about-right">
            <h3>{t('about.subtitle')}</h3>
            <h2>{t('about.title')}</h2>
            <p>{t('about.paragraph1')}</p>
            <p>{t('about.paragraph2')}</p>
            <p>{t('about.paragraph3')}</p>
        </div>
    </div>
    )
}

export default About
