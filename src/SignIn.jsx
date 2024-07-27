import {auth} from './main';
import { useNavigate } from 'react';
import {signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { FaGoogle } from 'react-icons/fa';
import { FaUserSecret } from 'react-icons/fa';
import signup from './assets/images/signup.svg';


async function SignInWithGoogle()
{
    try
    {
        await signInWithPopup(auth, new GoogleAuthProvider());
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
    }
    catch(error)
    {
        console.log(error);
    }
}

function ProceedAsAnonymous()
{
    const navigateTo = useNavigate();
    navigateTo('/');
}

export default function SignIn()
{

    return (
        <div className='auth'>
            <div className='card'>
                <div id = "imageContainer" className='container' style={{ position: 'relative' }}>
                    <img className = "image" src={signup} />
                    <p className='p'>Designed by <a className = 'a' href='https://www.freepik.com/'>Freepik</a></p>
                </div>
                <div className='container'>
                    <h1 className='h1'>Hiya, Welcome !</h1>
                    <div className='actionsDialog'>
                        <button onClick={SignInWithGoogle} className='customBtn'>
                            <FaGoogle />
                            Sign In With Google
                        </button>
                        <button onClick={ProceedAsAnonymous} className='customBtn'>
                            <FaUserSecret />
                            Proceed Anonymously
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
