import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { useUserDispatch, useUserState } from '../../Services/AuthProvider';
import "./Register.scss";


export default function Register(props) {

    const history = useHistory();

    const user = useUserState();
    const { register } = useUserDispatch();

    const[username, setUsername] = useState(() => null);
    const[password, setPassword] = useState(() => null);
    const[code, setCode] = useState(() => null);

    const [fail, setFail] = useState(() => false);
    const [incorrect, setIncorrect] = useState(() => false);

    const login = () => {
        history.push("login");
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        setFail(() => false);
        setIncorrect(() => false);

        register(username, password, code)
            .then(res => {
                if(res?.message){
                    return login();
                } else {
                    if(res?.error === "invalid code"){
                        setIncorrect(() => true);
                    } else {
                        setFail(() => true);
                    }
                }
            });
    }

    return (
        <div className="wrapper-100vh flex flex-col flex-center background-gradient">

            <h1 className="register__title">Hello, I'm glad you made it</h1>

            <div className="register">

                <form className="form register__form" action="#" onSubmit={handleSubmit}>
                    <label className="form__label" htmlFor="username">Username</label>
                    <input className="form__input" type="text" id="username" name="username" autoComplete="username"
                    onChange={(e) => setUsername(() => e.target.value)}
                    />

                    <label className="form__label" htmlFor="password">Password</label>
                    <input className="form__input" type="password" id="password" name="password" autoComplete="new-password"
                    onChange={(e) => setPassword(() => e.target.value)}
                    />

                    <label className="form__label" htmlFor="code">Code</label>
                    <input className="form__input" type="password" id="code" name="code" autoComplete="current-password"
                    onChange={(e) => setCode(() => e.target.value)}
                    />

                    <input type="submit" className="btn" value="Register"/>
                    { fail && <p className="error">That username is already taken...</p> }
                    { incorrect && <p className="error">Invalid code...</p> }
                </form>
            </div>
            <button className="btn--text"
            onClick={() => login()}>
                Already have an account?
            </button>
        </div>
    );
}
