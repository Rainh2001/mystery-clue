import React from 'react';
import { useHistory } from 'react-router';
import { useUserState } from '../../Services/AuthProvider';

export default function Dashboard(props) {

    const user = useUserState();
    console.log(user);

    const history = useHistory();

    if(!user) history.push("login");

    return (
        <div>
            { user?.username } says hello!
        </div>
    );
}
