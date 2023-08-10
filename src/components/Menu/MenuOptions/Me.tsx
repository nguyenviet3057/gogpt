import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import HeartIcon from '@icon/HeartIcon';
import { BsHeartPulseFill } from 'react-icons/bs'
import PopupModal from '@components/PopupModal/PopupModal';

const Me = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleAboutUs = () => {
    setIsModalOpen(true);
  }

  return (
    <>
      {/* <a
        className='flex py-2 px-2 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm'
        href='https://github.com/ztjhz/BetterChatGPT'
        target='_blank'
      >
        <HeartIcon />
        ChatGPT by Jing Hua
      </a>
      <a
        className='flex py-2 px-2 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm'
        href='https://www.facebook.com/nguyenviet3057/'
        target='_blank'>
        <BsHeartPulseFill />
        AI Art by nguyenviet3057
      </a> */}
      <a
        className='flex py-2 px-2 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm'
        onClick={handleAboutUs}
      >
        <BsHeartPulseFill />
        {t("aboutUs")}
      </a>
      {isModalOpen && (
        <PopupModal
          setIsModalOpen={setIsModalOpen}
          title={t('aboutUs') as string}
          message={t('informationAboutUs') as string}
          cancelButton={false}
        >
          <div className='support-donate flex flex-col items-center'>
            <h2 className='whitespace-pre-wrap min-w-fit text-gray-900 dark:text-gray-300 mt-4 flex flex-row items-center gap-1'><b>{t("donate")}</b> <HeartIcon /></h2>
            <div className='flex justify-center gap-12'>
              <div className='zalo-play flex flex-col items-center'>
                <p className='whitespace-pre-wrap min-w-fit text-gray-900 dark:text-gray-300 text-sm mt-4 mb-2'><b>VN Pay</b></p>
                <img src='./vn_pay.png' width={150} height={150} className='rounded' />
                <p className='whitespace-pre-wrap min-w-fit text-gray-900 dark:text-gray-300 text-sm mt-2 mb-2'>NGUYEN QUOC VIET</p>
              </div>
              <div className='zalo-play flex flex-col items-center'>
                <p className='whitespace-pre-wrap min-w-fit text-gray-900 dark:text-gray-300 text-sm mt-4 mb-2'><b>Zalo Pay</b></p>
                <img src='./zalo_pay.png' width={150} height={150} className='rounded' />
                <p className='whitespace-pre-wrap min-w-fit text-gray-900 dark:text-gray-300 text-sm mt-2 mb-2'>NGUYEN QUOC VIET</p>
              </div>
            </div>
          </div>
        </PopupModal>
      )}
    </>
  );
};

export default Me;
