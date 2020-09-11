import React , { Component } from 'react';
import { Container, Button } from 'reactstrap'
import './index.css'
import { withFirebase } from '../Firebase';

export default withFirebase( class extends Component{
  constructor(props){
    super(props);
    this.state = {
      user : null
    }
    var _this = this;
    this.props.firebase.auth.onAuthStateChanged((user)=>{
       
      if(!user.isAnonymous){
        console.log(user)
        _this.setState({ user : user.email })
      }
    });
  }
  async logout(){
    await this.props.firebase.auth.signOut();


    //  reload the page 
    window.location.reload();


  }
  render(){
    const { toggleModal } = this.props;
    const { user } = this.state;
    var _this = this;
    let button = (<Button onClick={toggleModal} size="sm">Signup / Login</Button>);
    if(user){
      button = (<Button onClick={()=>{_this.logout()}} size="sm">Sign Out</Button>);
    }
    return (
    <div
      className="nav-wrapper"
    >
      <div style={{flexGrow : 1, display : "flex", alignItems : "center"}}>
         <div className="logo-icon" /> Idea Book
      </div>
      {button}
    </div>
    )
  }
})