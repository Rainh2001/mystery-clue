import { useQuery, gql, useApolloClient } from '@apollo/client';
import React, { useContext, useEffect, useState } from 'react';


export const UserState = React.createContext();
export const UserDispatch = React.createContext();

export function useUserState() {
    return useContext(UserState);
}

export function useUserDispatch() {
    return useContext(UserDispatch);
}

const ACCESS_TOKEN_MINUTES = 10;

const getCurrentUser = gql`
query {
    currentUser {
        username,
        accountType
    }
}`

export default function AuthProvider({ children }) {

    // const { loading, error, data } = useQuery(TEST_QUERY);

    const client = useApolloClient();

    const [user, setUser] = useState(null);


    const register = async (username, password, code) => {
        return fetch("/auth/register", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({ username, password, code })
        })
        .then(res => res.json());
    }
    
    const login = async (username, password) => {
        return fetch("/auth/login", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({ username, password })
        })
        .then(res => res.json())
        .then(async res => {
            if(res?.message){
                let data = await client.query({ 
                    query: getCurrentUser 
                });
    
                if(data?.data?.currentUser){
                    setUser(() => data.data.currentUser);
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        });
    }

    const logout = async () => {
        setUser(null);
        fetch("/auth/logout", {
            method: "DELETE"
        });
    }

    // Get new access token just before current access token expires
    useEffect(() => {
        if(!user) return;

        getAccessToken();

        const accessInterval = setInterval(() => {
            getAccessToken();
        }, (ACCESS_TOKEN_MINUTES - 0.1) * 60000);

        return () => { clearInterval(accessInterval) }

    }, [user]);

    const getAccessToken = async () => {
        return fetch("/auth/token", {
            method: "GET" 
        }).then(res => res.json());
    }

    return (
        <UserState.Provider value={user}>
            <UserDispatch.Provider value={{register, login, logout}}>
                { children }
            </UserDispatch.Provider>
        </UserState.Provider>
    );
}
