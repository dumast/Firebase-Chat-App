'use client'
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import signIn from "@/firebase/auth/signin";
import { useRouter } from 'next/navigation'
import Link from 'next/link';

function Page() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const [message, setMessage] = useState<string>('');

    const router = useRouter();

    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

    let emailCheck: boolean = useMemo(() => emailRegex.test(email.toLowerCase()), [email]);
    let passwordCheck: boolean = useMemo(() => password != "", [password]);

    const checkForm: () => boolean = () => {
        return emailCheck === true && passwordCheck === true;
    }

    const handleForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!checkForm()) return;

        const { result, error } = await signIn(email, password);

        if (error) {
            switch (error.code) {
                case "auth/user-not-found":
                case "auth/wrong-password":
                    setMessage("email and password don't match");
                case "auth/too-many-requests":
                    setMessage("Too many requests. Try again later");
                default:
                    setMessage("Unknown Error");
            }
            return
        }

        return router.push("/")
    }

    useEffect(() => {
        if (emailCheck && message != "") {
            setMessage((value) => "");
        } else if (!emailCheck) {
            setMessage((value) => "Please enter a valid email address");
            return;
        }
        if (passwordCheck && message != "") {
            setMessage((value) => "")
        } else if (!passwordCheck) {
            setMessage((value) => "Please enter a valid password");
            return;
        }
    }, [email, password])
    return (<div>
        <div>
            <h1>Sign in</h1>
            <form onSubmit={handleForm}>
                <label htmlFor="email">
                    <p>Email</p>
                    <input onChange={(e) => setEmail(e.target.value)} autoComplete="email" required type="email" name="email" id="email" placeholder="example@mail.com" />
                </label>
                <label htmlFor="password">
                    <p>Password</p>
                    <input onChange={(e) => setPassword(e.target.value)} autoComplete="password" required type="password" name="password" id="password" placeholder="password" />
                </label>
                {message != "" && message}
                <button type="submit" disabled={!checkForm()}>Sign in</button>
            </form>
            <Link href="/signup">Create New Account</Link>
        </div>

    </div>);
}

export default Page;