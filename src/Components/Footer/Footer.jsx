import React from 'react'
import { useTranslation } from 'react-i18next';
import '../Footer/Footer.css'
import msg_icon from '../../assets/msg-icon.png'
import mail_icon from '../../assets/ewew/icons-mail.png'
import phone_icon from '../../assets/ewew/icons-phone.png'
import location_icon from '../../assets/ewew/icons-location.png'
import white_arrow from '../../assets/white-arrow.png'


const Footer = () => {
    const { t } = useTranslation();
    const [result, setResult] = React.useState("");

const onSubmit = async (event) => {
    event.preventDefault();
        setResult(t('footer.sending'));
    const formData = new FormData(event.target);

    formData.append("access_key", "570fcacc-c5ef-49ba-be40-4732cb188ad5");

    const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    body: formData
    });

    const data = await response.json();

    if (data.success) {
        setResult(t('footer.success'));
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
                <h3>{t('footer.sendMessage')} <img src={msg_icon} alt="" /></h3>
                <p>
                    {t('footer.description')}
                </p>
                <ul>
                    <li><img src={mail_icon} alt="" />General@Gan.com</li>
                    <li><img src={phone_icon} alt="" />+971 912223333</li>
                    <li><img src={location_icon} alt="" />{t('footer.address')}</li>
                </ul>
            </div>
            <div className="contact-col">
                <form onSubmit={onSubmit}>
                    <label>{t('footer.yourName')}</label>
                    <input type="text" name='name' placeholder={t('footer.enterName')} required/>
                    <label>{t('footer.phoneNumber')}</label>
                    <input type="tel" name='phone' placeholder={t('footer.enterPhone')} required/>
                    <label>{t('footer.writeMessage')}</label>
                    <textarea name="message" rows="6" placeholder={t('footer.enterMessage')} required></textarea>
                    <button type='submit' className='btn dark-btn'>{t('footer.submit')} <img src={white_arrow} alt="" /></button>
                </form>
                <span>{result}</span>
            </div>
        </div>
    </div>
    )
}

export default Footer
