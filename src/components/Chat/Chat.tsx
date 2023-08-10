import React, { useEffect, useState } from 'react';
import useStore from '@store/store';

import ChatContent from './ChatContent';
import MobileBar from '../MobileBar';
import StopGeneratingButton from '@components/StopGeneratingButton/StopGeneratingButton';

import { TbTextSize } from 'react-icons/tb';
import { BsImage, BsMusicNoteList } from 'react-icons/bs'

import './chat.css';

const Chat = () => {
  const hideSideMenu = useStore((state) => state.hideSideMenu);
  const typeAI = useStore((state) => state.typeAI);
  const setTypeAI = useStore((state) => state.setTypeAI);

  const handleFunction = (num: any) => {
    setTypeAI(num);
  }

  return (
    <div
      className={`flex h-full flex-1 flex-col ${
        hideSideMenu ? 'md:pl-0' : 'md:pl-[260px]'
      }`}
    >
      <MobileBar />
      <main className='relative h-full w-full transition-width flex flex-col overflow-hidden items-stretch flex-1'>
        <ChatContent />
        <StopGeneratingButton />
      </main>
      <div className='ai-type-overlay'>
        <div className={typeAI == 0 ? 'active' : ''} onClick={() => handleFunction(0)}>
          <TbTextSize />
        </div>
        <div className={typeAI == 1 ? 'active' : ''} onClick={() => handleFunction(1)}>
          <BsImage />
        </div>
        {/* <div className={typeAI == 2 ? 'active' : ''} onClick={() => handleFunction(2)}>
          <BsMusicNoteList />
        </div> */}
      </div>
    </div>
  );
};

export default Chat;
