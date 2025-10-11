import React from 'react'
import { useTranslation } from 'react-i18next';
import '../Foot/Foot.css'

const Foot = () => {
  const { t } = useTranslation();
  
  return (
    <div className='foot'>
        <p>{t('foot.copyright')}</p>
        <ul>
            <li>{t('foot.termsOfServices')}</li>
            <li>{t('foot.privacyPolicy')}</li>
        </ul>
      
    </div>
  )
}

export default Foot
