import { LoginSocialFacebook } from 'reactjs-social-login';
import { FacebookLoginButton } from 'react-social-login-buttons';
import { TypeAnimation } from 'react-type-animation';

import './facebook.css';
import { AppConfig } from '@constants/config';
import { save } from 'react-cookies';

export default function facebook(props: any) {
    const { checkedAuth, setIsLogged } = props;

    const loginSuccess = (response: any) => {
        // console.log(response.data.userID);
        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        var urlencoded = new URLSearchParams();
        urlencoded.append("userID", response.data.userID);
        urlencoded.append("email", response.data.email);
        urlencoded.append("name", response.data.name);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded
        };

        fetch("https://planx-dev.000webhostapp.com/api/login/facebook", requestOptions)
            .then(response => {
                // console.log(response);
                if (response.status == 200) setIsLogged(true);
                return response.json()
            })
            .then(result => {
                // console.log('Response:', result);
                save("access_token", result.token, {});
            })
            .catch(error => console.log('error', error));
    }

    return (
        <div className="login-container">
            <div>
                <a href="https://www.facebook.com/planxdev/">
                    <img src="/logo_planx.jpg" alt="PlanX" className='logo-front' />
                </a>
            </div>
            <div className="login-box">
                <div className='txt-animation'>
                    <TypeAnimation
                        sequence={[
                            // Same substring at the start will only be typed out once, initially
                            '// Welcome to PlanX //',
                            3000, // wait 1s before replacing "Mice" with "Hamsters"
                            'We do it for you',
                            3000
                        ]}
                        wrapper="h2"
                        speed={50}
                        style={{ fontSize: 'x-large', display: 'block', color: 'white' }}
                        repeat={Infinity}
                        cursor={false}
                    />
                    <TypeAnimation
                        sequence={[
                            // Same substring at the start will only be typed out once, initially
                            '// Welcome to PlanX //',
                            3000, // wait 1s before replacing "Mice" with "Hamsters"
                            'We do it for you',
                            3000
                        ]}
                        wrapper="h3"
                        speed={50}
                        style={{ fontSize: 'medium', display: 'block', color: 'gray' }}
                        repeat={Infinity}
                        cursor={false}
                    />
                </div>
                {checkedAuth ?
                    <LoginSocialFacebook
                        appId='959812971924470'
                        onResolve={(response) => loginSuccess(response)}
                        onReject={(error) => {
                            // console.log(error);
                        }}
                    >
                        <FacebookLoginButton style={{ width: '240px' }} />
                    </LoginSocialFacebook>
                    :
                    <></>
                }
            </div>
        </div>
    )
}
