import React from 'react';
import { useTranslation } from 'react-i18next';

import HeartIcon from '@icon/HeartIcon';
import { BsHeartPulseFill } from 'react-icons/bs'

const Me = () => {
  const { t } = useTranslation();
  return (
    <>
      <a
        className='flex py-2 px-2 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm'
        href='https://github.com/ztjhz/BetterChatGPT'
        target='_blank'
      >
        <HeartIcon />
        {/* {t('author')} */}
        ChatGPT by Jing Hua
      </a>
      <a
        className='flex py-2 px-2 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm'
        href='https://www.facebook.com/nguyenviet3057/'
        target='_blank'>
          <BsHeartPulseFill />
          AI Art by nguyenviet3057
        </a>
    </>
  );
};

export default Me;
