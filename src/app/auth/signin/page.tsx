'use client'
import React, { FormEvent, useEffect, useMemo, useState } from "react";
import signIn from "@/firebase/auth/signin";
import { useRouter } from 'next/navigation'
import Link from 'next/link';
import styles from '../auth.module.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { authMessages, globalMessages } from '@/utils/messages';

function Page() {
    const router = useRouter();

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const [showPassword, setShowPassword] = useState<boolean>(false);

    const [message, setMessage] = useState<string>('');


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
                    setMessage(authMessages.invalidCredits);
                    break;
                case "auth/too-many-requests":
                    setMessage(globalMessages.tooManyRequests);
                    break;
                default:
                    setMessage(globalMessages.unknownError);
                    break;
            }
            return;
        }

        return router.push("/");
    }

    useEffect(() => {
        if (emailCheck && message != "") {
            setMessage((value) => "");
        } else if (!emailCheck) {
            setMessage((value) => authMessages.validEmail);
            return;
        }
        if (passwordCheck && message != "") {
            setMessage((value) => "")
        } else if (!passwordCheck) {
            setMessage((value) => authMessages.validPassword);
            return;
        }
    }, [email, password])
    return (
        <div className={styles.container}>
            <div className={styles.authBox}>
                <h1 className={styles.title}>Sign in</h1>
                <form className={styles.form} onSubmit={handleForm}>
                    <div className={styles.inputBar}>
                        <label htmlFor="email">EMAIL</label>
                        <input onChange={(e) => setEmail(e.target.value)} autoComplete="email" required type="email" name="email" id="email" placeholder="example@mail.com" />
                    </div>
                    <div className={styles.inputBar}>
                        <label htmlFor="password">PASSWORD
                            <button type="button" onClick={() => setShowPassword((value) => !value)} className={styles.passwordToggle}>{showPassword ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}</button>
                        </label>
                        <input onChange={(e) => setPassword(e.target.value)} autoComplete="password" required type={showPassword ? "text" : "password"} name="password" id="password" placeholder="password"></input>
                    </div>
                    <div className={styles.message}>
                        {message != "" && <p>{message}</p>}
                    </div>
                    <div className={styles.submitButton}>
                        <button type="submit" disabled={!checkForm()}>Sign in</button>
                        <div className={styles.alternateOption}><Link href="/auth/signup">Create new account</Link></div>
                    </div>
                </form>
            </div>
        </div>);
}

export default Page;