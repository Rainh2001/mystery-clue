import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { useUserDispatch, useUserState } from '../../Services/AuthProvider';
import "../Register/Register.scss";
import "./Login.scss";

export default function Login(props) {

    const history = useHistory();

    const user = useUserState();
    const { login } = useUserDispatch();

    const [username, setUsername] = useState(() => null);
    const [password, setPassword] = useState(() => null);

    const [incorrect, setIncorrect] = useState(() => false);

    const register = () => {
        history.push("register");
    }

    const handleSubmit = (e) => {
        setIncorrect(() => false);
        e.preventDefault();
        login(username, password).then(res => {
            res ? history.push("dashboard") : setIncorrect(() => true);
        });
    }

    return (
        <div className="wrapper-100vh flex flex-col flex-center background-gradient">

            <h1 className="register__title">Welcome, please login</h1>

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

                    <input type="submit" className="btn" value="Login"/>
                    { incorrect && <p className="error">Invalid login details...</p> }
                </form>
            </div>
            <button className="btn--text"
            onClick={() => register()}>
                Don't have an account?
            </button>
        </div>
    );
}
