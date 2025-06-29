import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Gallery.css'
import photo_1 from '../../assets/gallery-1.png'
import photo_2 from '../../assets/gallery-2.png'
import photo_3 from '../../assets/gallery-3.png'
import photo_4 from '../../assets/gallery-4.png'
import white_arrow from '../../assets/white-arrow.png'

const Gallery = () => {
    const navigate = useNavigate();

    const handleSeeMore = () => {
        navigate('/gallery');
    };

    return (
    <div className='gallery'>
        <div className="photos">
            <img src={photo_1} alt="" />
            <img src={photo_2} alt="" />
            <img src={photo_3} alt="" />
            <img src={photo_4} alt="" />
        </div>
        <button className='btn dark-btn' onClick={handleSeeMore}>See more <img src={white_arrow} alt="" /></button>
    </div>
    )
}

export default Gallery
