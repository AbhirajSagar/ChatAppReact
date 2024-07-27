import robot from './assets/images/robot.mp4';
import maskImage from './assets/images/blobmask.svg';
import { useNavigate } from 'react-router-dom';
import Navbar from './ui/Navbar.jsx';


export default function Home()
{
    const navigateTo = useNavigate();
    
    function chatSetup()
    {
        navigateTo('/setup');
    }
    return (
        <div className='home'>
            <Navbar/>
            <div className='horizontalContainer'>
                <div className='textSlide'>
                    <h2 className='h1' style={{marginBottom:'15px'}}>Meet new <strong>people</strong> !</h2>
                    <p className='subheading noMargin'>Explore exciting conversations and make new friends with our random video and text chat platform.<br></br>Connect now and start chatting for free!</p>
                    <button className='ActionBtn' onClick={chatSetup}>Start Chatting Now !</button>
                </div>
                <div style={{position:'relative'}}>
                    <img className = "videoEffects" src={maskImage}/>
                    <video className = "video" src={robot} autoPlay muted loop/>
                </div>
            </div>
        </div>
    );
}