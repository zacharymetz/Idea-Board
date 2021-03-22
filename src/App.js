import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import IdeaBoardComponent from './helpers/Components/IdeaBoardComponent';
import NavBar from './helpers/Components/Navbar'
import AuthModal from './helpers/Components/AuthenticationModal'
import { withFirebase } from './Components/Firebase'
function App(props) {
  const [loginModalOpen, setloginModalOpen] = useState(false);
  const [appReady, setappReady] = useState(false);
  props.firebase.auth.onAuthStateChanged((user)=>{
         
    setappReady(true)
    if(user.isAnonymous){
      setloginModalOpen(true)
    }
  });

  return <Router>
          <div>
            <NavBar toggleModal={()=>setloginModalOpen(!loginModalOpen)} />
            {appReady ?   
            <>
              <Route path="/">
                <IdeaBoardComponent personal={true} />
              </Route>
              <Route path="/board/:id">
                <IdeaBoardComponent personal={false} />
              </Route>
            </> : 
            <div>
              loading
            </div>
            }
            < AuthModal  open={loginModalOpen} toggle={()=>setloginModalOpen(!loginModalOpen)}/>
          </div>
        </Router>
  
  
  
}

export default withFirebase(App);
