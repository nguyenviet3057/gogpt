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
        let data = {
            userID: response.data.userID,
            email: response.data.email,
            name: response.data.name
        }
        fetch(AppConfig.BASE_URL + AppConfig.LOGIN_FACEBOOK, {
            method: 'POST',
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                // console.log(response);
                if (response.status == 200) setIsLogged(true);
                return response.json()
            })
            .then(result => {
                // console.log('Response:', result);
                save("access_token", result.token, {});
            })
            .catch(error => {
                console.error('Error:', error);
            });
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
