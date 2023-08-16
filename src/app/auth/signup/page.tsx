'use client'
import React, { useState, FormEvent, useEffect, useMemo } from "react";
import signUp from "@/firebase/auth/signup";
import { useRouter } from 'next/navigation'
import Link from "next/link";
import styles from '../auth.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { authMessages } from '@/utils/messages';


function Page() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);

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
            setMessage((value) => authMessages.validEmail);
            return;
        }
        if (passwordLengthCheck && message != "") {
            setMessage((value) => "")
        } else if (!passwordLengthCheck) {
            setMessage((value) => authMessages.passwordLength);
            return;
        }
        if (passwordCharacterCheck && message != "") {
            setMessage((value) => "")
        } else if (!passwordCharacterCheck) {
            setMessage((value) => authMessages.passwordContent);
            return;
        }
        if (confirmPasswordCheck && message != "") {
            setMessage((value) => "")
        } else if (!confirmPasswordCheck) {
            setMessage((value) => authMessages.confirmPassword);
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
                    setMessage(authMessages.emailAlreadyUsed);
                    break;
            }
            return;
        }

        return router.push("/")
    }

    return (
        <div className={styles.authBox}>
            <h1 className={styles.title}>Sign up</h1>
            <form className={styles.form} onSubmit={handleForm}>
                <div className={styles.inputBar}>
                    <label htmlFor="email">EMAIL</label>
                    <input onChange={(e) => setEmail(e.target.value)} autoComplete="email" required type="email" name="email" id="email" placeholder="example@mail.com" />
                </div>
                <div className={styles.inputBar}>
                    <label htmlFor="pasword">PASSWORD
                        <button type="button" onClick={() => setShowPassword((value) => !value)} className={styles.passwordToggle}>{showPassword ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}</button>
                    </label>
                    <input onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required type={showPassword ? "text" : "password"} name="password" id="password" placeholder="password" />
                </div>
                <div className={styles.inputBar}>
                    <label htmlFor="confirmPassword">CONFIRM PASSWORD
                        <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className={styles.passwordToggle}>{showConfirmPassword ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}</button>
                    </label>
                    <input onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" required type={showConfirmPassword ? "text" : "password"} name="confirmPassword" id="confirmPassword" placeholder="confirm password" />
                </div>
                <div className={styles.message}>
                    {message != "" && <p>{message}</p>}
                </div>
                <div className={styles.submitButton}>
                    <button type="submit" disabled={!checkForm()}>Sign up</button>
                    <div className={styles.alternateOption}><Link href="/auth/signin">Already have an account? Sign in</Link></div>
                </div>
            </form>
        </div >);
}

export default Page;