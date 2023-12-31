import type {User} from 'firebase/auth';
import { Dispatch, SetStateAction } from 'react';

// Utils

export interface _Res {
    status: number,
    message: string,
    content?: _Friend
}

// Context

export interface _AuthContext {
    user: User | null,
    dbUser: _DbUser | null,
}

export interface _CurrentPageContext {
    title: string,
    setTitle: Dispatch<SetStateAction<string>> | null,
}

// Users

export interface _Friend {
    id: string,
    displayName: string
}

export interface _DbUser {
    displayName: string | null,
    username: string,
    email: string,
    friends?: string[],
    friendRequests?: string[],
    sentFriendRequests?: string[],
}

// Items

export interface _Message {
    type: 'text' | 'image',
    content: string,
    author: string,
    timestamp: number,
}