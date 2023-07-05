import React from 'react';
import LogoutIcon from '@icon/LogoutIcon';
import { load } from 'react-cookies';

import { AppConfig } from '@constants/config';

const Logout = (props: any) => {
  const { setIsLogged } = props;

  const handleLogout = () => {
    fetch(AppConfig.BASE_URL + AppConfig.LOGOUT, {
      method: 'POST',
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Bearer " + load('access_token')
      },
      body: null
    })
      .then(response => response.status)
      .then(result => {
        // console.log('Response:', result);
        if (result == 200) setIsLogged(false);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  return (
    <a onClick={handleLogout} className='flex py-2 px-2 items-center gap-3 rounded-md hover:bg-gray-500/10 transition-colors duration-200 text-white cursor-pointer text-sm'>
      <LogoutIcon />
      Log out
    </a>
  );
};

export default Logout;
