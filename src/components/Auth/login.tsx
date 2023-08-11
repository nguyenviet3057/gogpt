import { LoginSocialFacebook } from 'reactjs-social-login';
import { FacebookLoginButton, createButton } from 'react-social-login-buttons';
import { TypeAnimation } from 'react-type-animation';

import './login.scss';
// import 'bootstrap/dist/css/bootstrap.min.css';
import { AppConfig } from '@constants/config';
import { save } from 'react-cookies';
import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { t } from 'i18next';
import { useTranslation } from 'react-i18next';

export default function login(props: any) {
    const { checkedAuth, setIsLogged } = props;

    const { t } = useTranslation();
    const [isRegister, setIsRegister] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cfPwd, setCfPwd] = useState('');
    const [validated, setValidated] = useState(false);
    const [emailConfirm, setEmailConfirm] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [isExisted, setIsExisted] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const config = {
        text: "Log in with Email",
        icon: "email",
        iconFormat: (name: any) => `fa fa-${name}`,
        style: { background: "#08851B" },
        activeStyle: { background: "#066A15" }
    };
    const EmailLoginButton = createButton(config);

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

        fetch(AppConfig.BASE_URL + AppConfig.LOGIN_FACEBOOK, requestOptions)
            .then(response => {
                // console.log(response);
                return response.json()
            })
            .then(result => {
                // console.log('Response:', result);
                save("access_token", result.token, {});
                setIsLogged(true);
            })
            .catch(error => console.log('error', error));
    }



    const handleSubmitLogin = (event: any) => {
        const form = event.currentTarget;
        event.preventDefault();
        if (form.checkValidity() === false || password != cfPwd) {
            event.stopPropagation();
        }

        setValidated(true);

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        var urlencoded = new URLSearchParams();
        urlencoded.append("email", email);
        urlencoded.append("password", password);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded
        };

        fetch(AppConfig.BASE_URL + AppConfig.LOGIN_EMAIL, requestOptions)
            .then(response => {
                // console.log(response);
                return response.json()
            })
            .then(result => {
                // console.log('Response:', result);
                if (result.status == 1) {
                    save("access_token", result.token, {});
                    setIsLogged(true);
                }
                if (result.status == 0) alert(t("accountNotFound"));
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    const handleRegister = (isReg: boolean) => {
        setIsRegister(isReg);
    }

    const handleName = (event: any) => {
        setName(event.target.value);
    };
    const handleEmail = (event: any) => {
        setIsExisted(false);
        setEmail(event.target.value);
    };
    const handlePassword = (event: any) => {
        setPassword(event.target.value);
    };
    const handleCfPwd = (event: any) => {
        setCfPwd(event.target.value);
    };

    const handleLogin = () => {
        setIsLogin(true);
        setValidated(false);
        setEmail("");
        setPassword("");
        setName("");
        setCfPwd("");
    }
    const handleExitLogin = () => {
        setIsLogin(false);
        setValidated(false);
        setEmail("");
        setPassword("");
        setName("");
        setCfPwd("");
    }

    const handleSubmitRegister = (event: any) => {
        setIsProcessing(true);
        const form = event.currentTarget;
        event.preventDefault();
        if (form.checkValidity() === false || password != cfPwd) {
            setIsProcessing(false);
            event.stopPropagation();
            return;
        }

        var myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

        var urlencoded = new URLSearchParams();
        urlencoded.append("name", name);
        urlencoded.append("email", email);
        urlencoded.append("password", password);
        urlencoded.append("password_confirmation", cfPwd);

        var requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded
        };

        fetch(AppConfig.BASE_URL + AppConfig.REGISTER_EMAIL, requestOptions)
            .then(response => {
                setValidated(true);
                // console.log(response);
                return response.json()
            })
            .then(result => {
                if (result.status == 0) {
                    setIsExisted(true);
                    setEmail("");
                }
                else setEmailConfirm(true);
                setIsProcessing(false);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    return (
        <div className="login-container">
            <div style={(isRegister || isLogin) ? { display: 'none' } : { display: 'inherit' }}>
                <a href="https://www.facebook.com/planxdev/">
                    <img src="logo_planx.jpg" alt="PlanX" className='logo-front' />
                </a>
            </div>
            <div className='auth-box'>
                <div className='txt-animation' style={(isRegister || isLogin) ? { display: 'none' } : { display: 'inherit' }}>
                    <TypeAnimation
                        sequence={[
                            // Same substring at the start will only be typed out once, initially
                            'Welcome to PlanX\n// we do it for you //',
                            4000, // wait 1s before replacing "Mice" with "Hamsters"
                            'Be yourself\n// to feel free //',
                            3000,
                            'Follow your dream\n// to have motivation //',
                            3000,
                            'Make your life better\n// to live more //',
                            3000
                        ]}
                        wrapper="h2"
                        speed={50}
                        style={{ whiteSpace: 'pre-line', fontSize: 'x-large', display: 'block', color: 'white' }}
                        repeat={Infinity}
                        cursor={false}
                    />
                </div>
                {isRegister ?
                    <>
                        <Form noValidate validated={validated} onSubmit={handleSubmitRegister}>
                            <Form.Group className="mb-3">
                                <Form.Label>Name:</Form.Label>
                                <Form.Control type="text" placeholder="Your name" value={name} onChange={handleName} required readOnly={emailConfirm} />
                                <Form.Control.Feedback type="invalid">
                                    Please provide your name.
                                </Form.Control.Feedback>
                            </Form.Group>
                            {isExisted ?
                                <Form.Group className="mb-3">
                                    <Form.Label>Email:</Form.Label>
                                    <Form.Control type="email" placeholder="Your email" value={email} onChange={handleEmail} required readOnly={emailConfirm} />
                                    <Form.Control.Feedback type="invalid">
                                        Email exists. Please provide a different email !
                                    </Form.Control.Feedback>
                                </Form.Group>
                                :
                                <Form.Group className="mb-3">
                                    <Form.Label>Email:</Form.Label>
                                    <Form.Control type="email" placeholder="Your email" value={email} onChange={handleEmail} required readOnly={emailConfirm} />
                                    <Form.Control.Feedback type="invalid">
                                        Please provide a valid email.
                                    </Form.Control.Feedback>
                                </Form.Group>
                            }
                            <Form.Group className="mb-3">
                                <Form.Label>Password:</Form.Label>
                                <Form.Control type="password" placeholder="********" minLength={8} value={password} onChange={handlePassword} required readOnly={emailConfirm} autoComplete='new-password' />
                                <Form.Control.Feedback type="invalid">
                                    Password must be at least 8 characters.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Confirm Password:</Form.Label>
                                <Form.Control type="password" placeholder="********" minLength={8} value={cfPwd} onChange={handleCfPwd} required readOnly={emailConfirm} isInvalid={password != cfPwd} />
                                <Form.Control.Feedback type="invalid">
                                    Password confirmation doesn't match.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <div className='before-submit'>
                                <Button type='submit' disabled={isProcessing || emailConfirm}>
                                    {isProcessing ?
                                        <TypeAnimation
                                            sequence={[
                                                '.',
                                                200,
                                                '..',
                                                200,
                                                '...',
                                                200,
                                                '..',
                                                200
                                            ]}
                                            wrapper="span"
                                            speed={50}
                                            style={{ whiteSpace: 'pre-line', fontSize: 'x-large', display: 'block', color: 'white', width: "56px" }}
                                            repeat={Infinity}
                                            cursor={false}
                                        />
                                        :
                                        emailConfirm ?
                                            <span style={{ width: "56px" }}>Done</span>
                                            :
                                            <span style={{ width: "56px" }}>Register</span>

                                    }
                                </Button>
                                <span onClick={() => handleRegister(false)}><small>Already have an account ?</small></span>
                            </div>
                        </Form>
                        <span style={(emailConfirm && !isExisted) ? { visibility: 'visible', whiteSpace: 'pre-line', width: '360px', textAlign: 'center' } : { visibility: 'hidden' }} className='email-confirm'>{t("emailConfirmation")}</span>
                    </>
                    :
                    isLogin ?
                        <Form noValidate validated={validated} onSubmit={handleSubmitLogin}>
                            <Form.Group className="mb-3">
                                <Form.Label>Email:</Form.Label>
                                <Form.Control type="email" placeholder="Your email" value={email} onChange={handleEmail} required />
                                <Form.Control.Feedback type="invalid">
                                    Please provide a valid email.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Password:</Form.Label>
                                <Form.Control type="password" placeholder="********" minLength={8} value={password} onChange={handlePassword} required />
                                <Form.Control.Feedback type="invalid">
                                    Password must be at least 8 characters.
                                </Form.Control.Feedback>
                            </Form.Group>
                            <div className='before-submit' style={{ justifyContent: 'space-evenly' }}>
                                <Button type='submit'>
                                    Login
                                </Button>
                                <Button onClick={handleExitLogin}>
                                    Back
                                </Button>
                            </div>
                        </Form>
                        :
                        checkedAuth ?
                            <>
                                {/* <LoginSocialFacebook
                                    appId='971391800706097'
                                    onResolve={(response) => loginSuccess(response)}
                                    onReject={(error) => {
                                        // console.log(error);
                                    }}
                                >
                                    <FacebookLoginButton style={{ width: '240px' }} />
                                </LoginSocialFacebook> */}
                                <EmailLoginButton style={{ width: '240px' }} icon={"envelope"} onClick={handleLogin} />
                                <div className='register-email'><span onClick={() => handleRegister(true)}>Register with email ?</span></div>
                            </>
                            :
                            <></>
                }
            </div>
        </div>
    )
}
