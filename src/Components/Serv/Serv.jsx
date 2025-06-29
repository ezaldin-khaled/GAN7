import React, { useState } from 'react'
import '../Serv/Serv.css'
import Loader from '../common/Loader'
import srv_1 from '../../assets/ewew/13g.jpeg'
import srv_2 from '../../assets/ewew/14g.jpg'
import srv_3 from '../../assets/ewew/15g.jpg'

import srv_inicon1 from '../../assets/ewew/2.png'
import srv_inicon2 from '../../assets/ewew/1.png'
import srv_inicon3 from '../../assets/ewew/3.png'

import srv_icon_1 from '../../assets/ewew/05.png'
import srv_icon_2 from '../../assets/ewew/icons-people.png'
import srv_icon_3 from '../../assets/ewew/06.png'


const Serv = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedService, setSelectedService] = useState(null)
    const [loading, setLoading] = useState(false)

    const serviceDescriptions = {
        1: {
            icon: srv_inicon1,
            title: 'Photography Services',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.lorem15 Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.lorem15 Professional photography services for all your needs. From portraits to events, we capture your special moments with expertise and artistry.'
        },
        2: {
            icon: srv_inicon2,
            title: 'Event Management',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.lorem15 Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.lorem15 Expert event planning and management services to make your special occasions unforgettable. We handle every detail so you can relax and enjoy.'
        },
        3: {
            icon: srv_inicon3,
            title: 'Audio Production',
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.lorem15 Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.lorem15 High-quality audio production services including recording, mixing, and mastering. Perfect for musicians, podcasters, and content creators.'
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
                            <button className='btn serv-btn' onClick={closeModal}>That's fine!</button>
                        </>
                    )}
                </div>
            </div>
        )}
        <div className="srv">
            <img src={srv_1} alt="" />
            <div className="caption">
                <img src={srv_icon_1} alt="" />
                <p>Lorem ipsum dolor sit amet.</p>
                <br />
                <button className='btn serv-btn' onClick={() => handleLearnMore(1)}>learn more</button>
            </div>
        </div>
        <div className="srv">
            <img src={srv_2} alt="" />
            <div className="caption">
                <img src={srv_icon_2} alt="" />
                <p>Lorem ipsum dolor sit amet.</p>
                <br />
                <button className='btn serv-btn' onClick={() => handleLearnMore(2)}>learn more</button>               
            </div>
        </div>
        <div className="srv">
            <img src={srv_3} alt="" />
            <div className="caption">
                <img src={srv_icon_3} alt="" />
                <p>Lorem ipsum dolor sit amet.</p>
                <br />
                <button className='btn serv-btn' onClick={() => handleLearnMore(3)}>learn more</button>
            </div>
        </div>
    </div>
    )
}

export default Serv