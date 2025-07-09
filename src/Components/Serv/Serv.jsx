import React, { useState } from 'react'
import { useTranslation } from 'react-i18next';
import '../Serv/Serv.css'
import Loader from '../common/Loader'
import srv_1 from '../../assets/ewew/13g.jpeg'
import srv_2 from '../../assets/ewew/14g.jpg'
import srv_3 from '../../assets/ewew/15g.jpg'

import srv_inicon1 from '../../assets/ewew/2.png'
import srv_inicon2 from '../../assets/ewew/1.png'
import srv_inicon3 from '../../assets/ewew/3.png'

import srv_icon_1 from '../../assets/ewew/1.png'
import srv_icon_2 from '../../assets/ewew/2.png'
import srv_icon_3 from '../../assets/ewew/3.png'


const Serv = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedService, setSelectedService] = useState(null)
    const [loading, setLoading] = useState(false)
    const { t } = useTranslation();

    const serviceDescriptions = {
        1: {
            icon: srv_inicon1,
            title: t('services.talentTitle'),
            description: t('services.talentDescription'),
            features: t('features.talent', { returnObjects: true })
        },
        2: {
            icon: srv_inicon2,
            title: t('services.bandsTitle'),
            description: t('services.bandsDescription'),
            features: t('features.bands', { returnObjects: true })
        },
        3: {
            icon: srv_inicon3,
            title: t('services.assetsTitle'),
            description: t('services.assetsDescription'),
            features: t('features.assets', { returnObjects: true })
        }
    }

    const handleLearnMore = async (serviceId) => {
        setLoading(true)
        setSelectedService(serviceId)
        // Simulate loading for demo purposes
        await new Promise(resolve => setTimeout(resolve, 1000))
        setLoading(false)
        setIsOpen(true)
    }

    const closeModal = () => {
        setIsOpen(false)
        setSelectedService(null)
    }

    return (
    <div className='serv'>
        {isOpen && selectedService && (
            <div className='modal-overlay'>
                <div className='modal-content'>
                    {loading ? (
                        <Loader />
                    ) : (
                        <>
                            <button className="modal-close" onClick={closeModal}>×</button>
                            <div className="modal-icon">
                                <img src={serviceDescriptions[selectedService].icon} alt="" />
                            </div>
                            <h2>{serviceDescriptions[selectedService].title}</h2>
                            <p>{serviceDescriptions[selectedService].description}</p>
                            
                            {/* Features Section */}
                            <div className="modal-features">
                                <h3>{t('services.keyFeatures')}</h3>
                                <ul className="features-list">
                                    {serviceDescriptions[selectedService].features.map((feature, index) => (
                                        <li key={index} className="feature-item">
                                            <span className="feature-text">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            
                            <button className='btn serv-btn' onClick={closeModal}>{t('common.ok')}</button>
                        </>
                    )}
                </div>
            </div>
        )}
        <div className="srv">
            <img src={srv_1} alt="" />
            <div className="caption">
                <img src={srv_icon_1} alt="" />
                <p>{t('services.talent')}</p>
                <br />
                <button className='btn serv-btn' onClick={() => handleLearnMore(1)}>{t('services.learnMore')}</button>
            </div>
        </div>
        <div className="srv">
            <img src={srv_2} alt="" />
            <div className="caption">
                <img src={srv_icon_2} alt="" />
                <p>{t('services.bandsGroups')}</p>
                <br />
                <button className='btn serv-btn' onClick={() => handleLearnMore(2)}>{t('services.learnMore')}</button>               
            </div>
        </div>
        <div className="srv">
            <img src={srv_3} alt="" />
            <div className="caption">
                <img src={srv_icon_3} alt="" />
                <p>{t('services.productionAssets')}</p>
                <br />
                <button className='btn serv-btn' onClick={() => handleLearnMore(3)}>{t('services.learnMore')}</button>
            </div>
        </div>
    </div>
    )
}

export default Serv