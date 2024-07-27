import Navbar from "./ui/Navbar.jsx";
import { FaVideo } from "react-icons/fa";
import { IoChatboxEllipses } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

export default function ChatSetup()
{   
    const navigateTo = useNavigate();

    function getLocation(event)
    {
        if(event.target.checked)
        {
            if (navigator.geolocation) 
            {
                navigator.geolocation.getCurrentPosition((position)=>
                {
                    alert('long' + position.coords.longitude + " " + 'lat' + position.coords.latitude);
                }, (error)=> 
                {
                    switch(error.code) 
                    {
                        case error.PERMISSION_DENIED:
                          alert("Please allow the geolocation request");
                          break;
                        case error.POSITION_UNAVAILABLE:
                          console.log("Location information not found");
                          break;
                        case error.TIMEOUT:
                          console.log("Request timed out");
                          break;
                        case error.UNKNOWN_ERROR:
                          console.log("Something went wrong while accessing location");
                          break;
                      }
                });
            }
            else
            {
                alert('Your browser does not support location access');
            }
        }
    }

    function VideoTextChat()
    {
        navigateTo('/video-text-chat');
    }
    function TextChat()
    {
        alert('This feature has not been implemented yet');
    }

    return(
        <>
            <Navbar/>
            <div className="chatSetup">
                <div className="card padding10" style={{flexDirection:'column'}}>
                    <h2 className="h1 textAlignCenter">Select Your Preferences</h2>
                    <p className="subheading" style={{color:'white'}}>Chose your interest</p>
                    <select className="optionField" id="interests">
                        <option value="I0">Prefer not to say</option>
                        <option value="I1">Music</option>
                        <option value="I2">Movies</option>
                        <option value="I3">Books</option>
                        <option value="I4">Sports</option>
                        <option value="I5">Travel</option>
                        <option value="I6">Gaming</option>
                        <option value="I7">Food</option>
                        <option value="art">Art</option>
                        <option value="pets">Pets</option>
                    </select>
                    <div className="locationCheckbox">
                        <p className="subheading" style={{color:'white'}}>Find nearest friend</p>
                        <input className = "boolField" type="checkbox" onClick={getLocation}/>
                    </div>
                    <button className="ActionBtn" onClick={VideoTextChat} style={{backgroundColor:'#343c50',backgroundImage:'none',minWidth:'225px',margin:'5px',justifyContent:'center'}}>
                        <FaVideo style={{marginRight:'15px'}}/>
                        <strong>Video Chat</strong>
                    </button>
                    <button className="ActionBtn" onClick={TextChat} style={{backgroundColor:'#343c50',backgroundImage:'none',minWidth:'225px',margin:'5px',justifyContent:'center'}}>
                        <IoChatboxEllipses style={{marginRight:'15px'}}/>
                        <strong>Text Chat</strong>
                    </button>
                </div>
            </div>
        </>
    );
}