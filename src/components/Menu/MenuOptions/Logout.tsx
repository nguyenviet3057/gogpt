import React from 'react';
import LogoutIcon from '@icon/LogoutIcon';
import { load } from 'react-cookies';

import { AppConfig } from '@constants/config';

const Logout = (props: any) => {
  const { setIsLogged } = props;

  const handleLogout = () => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    var urlencoded = new URLSearchParams();
    urlencoded.append("Authorization", `Bearer ${load("access_token")}`);

    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: urlencoded
    };
    fetch(AppConfig.BASE_URL + AppConfig.LOGOUT, requestOptions)
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
