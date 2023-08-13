'use client'
import React, { useState, FormEvent, useEffect, useMemo } from "react";
import signUp from "@/firebase/auth/signup";
import { useRouter } from 'next/navigation'
import Link from "next/link";

function Page() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    const [message, setMessage] = useState<string>('');

    const router = useRouter()

    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;

    let emailCheck: boolean = useMemo(() => emailRegex.test(email.toLowerCase()), [email]);
    let passwordLengthCheck: boolean = useMemo(() => password.length >= 8 && password.length <= 20, [password]);
    let passwordCharacterCheck: boolean = useMemo(() => passwordRegex.test(password), [password]);
    let confirmPasswordCheck: boolean = useMemo(() => password === confirmPassword, [password === confirmPassword]);

    const checkForm: () => boolean = () => {
        return emailCheck === true && passwordLengthCheck === true && passwordCharacterCheck === true && confirmPasswordCheck === true;
    }

    useEffect(() => {
        if (emailCheck && message != "") {
            setMessage((value) => "");
        } else if (!emailCheck) {
            setMessage((value) => "Please enter a valid email address");
            return;
        }
        if (passwordLengthCheck && message != "") {
            setMessage((value) => "")
        } else if (!passwordLengthCheck) {
            setMessage((value) => "Your password must be between 8 and 20 characters long");
            return;
        }
        if (passwordCharacterCheck && message != "") {
            setMessage((value) => "")
        } else if (!passwordCharacterCheck) {
            setMessage((value) => "Please include at least one uppercase letter, one number, and one special character");
            return;
        }
        if (confirmPasswordCheck && message != "") {
            setMessage((value) => "")
        } else if (!confirmPasswordCheck) {
            setMessage((value) => "Password and Confirm Password don't match");
            return;
        }
    }, [email, password, confirmPassword])

    const handleForm = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (!checkForm()) return;

        const { result, error } = await signUp(email, password);

        if (error) {
            switch (error.code) {
                case "auth/email-already-in-use":
                    setMessage("Email already in use")
            }
            return;
        }

        return router.push("/")
    }

    return (<div>
        <h1>Sign up</h1>
        <form onSubmit={handleForm}>
            <label htmlFor="email">
                <p>Email</p>
                <input onChange={(e) => setEmail(e.target.value)} autoComplete="email" required type="email" name="email" id="email" placeholder="example@mail.com" />
            </label>
            <label htmlFor="password">
                <p>Password</p>
                <input onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required type="password" name="password" id="password" placeholder="password" />
            </label>
            <label htmlFor="confirmPassword">
                <p>Confirm Password</p>
                <input onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required type="password" name="confirmPassword" id="confirmPassword" placeholder="confirm password" />
            </label>
            {message != "" && message}
            <button type="submit" disabled={!checkForm()}>Sign up</button>
        </form>
        <Link href="/signin">Sign In</Link>
    </div>);
}

export default Page;