import React from 'react'
import '../Footer/Footer.css'
import msg_icon from '../../assets/msg-icon.png'
import mail_icon from '../../assets/ewew/icons-mail.png'
import phone_icon from '../../assets/ewew/icons-phone.png'
import location_icon from '../../assets/ewew/icons-location.png'
import white_arrow from '../../assets/white-arrow.png'


const Footer = () => {

    const [result, setResult] = React.useState("");

const onSubmit = async (event) => {
    event.preventDefault();
    setResult("Sending....");
    const formData = new FormData(event.target);

    formData.append("access_key", "570fcacc-c5ef-49ba-be40-4732cb188ad5");

    const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    body: formData
    });

    const data = await response.json();

    if (data.success) {
    setResult("Form Submitted Successfully");
    event.target.reset();
    } else {
    console.log("Error", data);
    setResult(data.message);
    }
};


    return (
    <div>
        <div className="footer">
            <div className="contact-col">
                <h3>Send us a message <img src={msg_icon} alt="" /></h3>
                <p>
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                    Ratione, maxime, sunt tempora non,
                    quae ullam perferendis perspiciatis est temporibus facere magnam? Obcaecati,
                    perspiciatis voluptatum? In, 
                    natus reiciendis? Itaque, aperiam ullam?
                </p>
                <ul>
                    <li><img src={mail_icon} alt="" />General@Gan.com</li>
                    <li><img src={phone_icon} alt="" />+971 912223333</li>
                    <li><img src={location_icon} alt="" />55 street ave, location <br /> ad 007777, unaited emarits  </li>
                </ul>
            </div>
            <div className="contact-col">
                <form onSubmit={onSubmit}>
                    <label>Your name</label>
                    <input type="text" name='name' placeholder='Enter Your name' required/>
                    <label>Phone Number</label>
                    <input type="tel" name='phone' placeholder='Enter Your mobile number' required/>
                    <label>Write Your masseges here</label>
                    <textarea name="message" rows="6" placeholder='Enter Your message' required></textarea>
                    <button type='submit' className='btn dark-btn'>Submit now <img src={white_arrow} alt="" /></button>
                </form>
                <span>{result}</span>
            </div>
        </div>
    </div>
    )
}

export default Footer
