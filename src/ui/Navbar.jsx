import { FaBars } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';

export default function Navbar(props)
{
    return (
        <nav className='nav'>
            <h2>LOGO</h2>
            <div className='navtoolbar'>
                {props.showMenuBtn && <FaBars className='actionIcons'/>}
                {props.showProfile && <FaUser className='actionIcons'/>}
            </div>
        </nav>
    );
}