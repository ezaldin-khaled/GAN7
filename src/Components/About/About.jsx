import React from 'react'
import '../About/About.css'
import about_img from '../../assets/ewew/about.png'
// import play_icon from '../../assets/play-icon.png'

const About = () => {
    return (
    <div className='about'>
        <div className="about-left">
            <img src={about_img} alt="" className='about-img'/>
            {/* <img src={play_icon} alt="" className='play-icon'/> */}
        </div>
        <div className="about-right">
            <h3>ABOUT GAN</h3>
            <h2>The Global Artists Network (GAN)</h2>
            <p>We are the bridge that connects creativity with opportunities—a pioneering digital platform uniting artists from around the world under one roof, empowering them to connect with production companies and organizers seeking exceptional talent.  

At GAN, we believe every artist has a story waiting to be told, and every creative project needs the right face to bring its vision to life. That’s why we strive to be the world’s leading casting network, bringing together diverse talents from every corner of the globe and matching them with opportunities in the global entertainment industry.  
</p>
            <p>From silver-screen stars to fresh faces, from background actors to athletes, from beauty queens to children, from radio voices to TV hosts and presenters—even adventurers—we give every artist the chance to showcase their talent and take part in projects that inspire the world.  

We partner with Hollywood, Bollywood, and the Arab entertainment industry to find the talents that complete their creative visions. Whether you’re searching for a fresh face for a global film, a distinctive voice for a commercial, or a unique personality for a TV series, GAN is your gateway to a world of limitless possibilities.  
</p>
            <p>Our Vision: To become the world’s premier platform connecting diverse talent with the entertainment industry, creating together works that inspire the world and transform the creative landscape.  

GAN Where talent meets opportunity, and dreams become reality.</p>
        </div>
    </div>
    )
}

export default About
