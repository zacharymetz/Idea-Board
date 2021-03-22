import React, {  Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, ButtonGroup, Alert, FormGroup, Label, Input, FormText } from 'reactstrap';
import { withFirebase } from '../../../Components/Firebase';


export default withFirebase(class extends Component{
    constructor(props){
        super(props);
        this.state = {
            active : "signup",
            email : "",
            password : "",
            passwordConfirm : "",
            error : null
        };  
    }
    async signup(){
        const { active, email, password, passwordConfirm, error } = this.state;
        //  since we laready havec an anymouse user we need to 
        const { firebase } = this.props;;
        console.log(firebase.firebase)
        var credential = firebase.firebase.auth.EmailAuthProvider.credential(email, password);

        // 2. Links the credential to the currently signed in user
        // (the anonymous user).
        try{
            let user = await firebase.auth.currentUser.linkWithCredential(credential)
            console.log("Anonymous account successfully upgraded", user);
        }catch(error){
            console.log("Error upgrading anonymous account", error);
            this.setState({ error });
            return;
        }


        //  we are in the clear so lets make sure we toggle and do what ever we need to do lol 

         
        this.props.toggle()
         
       
        
    }
    async login(){
        const { firebase } = this.props
        const { active, email, password, passwordConfirm, error } = this.state;
        try{
            await firebase.doSignInWithEmailAndPassword(email,password);
        }catch(error){
            console.log("Error when loggining in", error);
            this.setState({ error });
            return;
        }


        //  if it was good then we can login 
        this.props.toggle()
        
    }


    async 
    onChange(event){
        var e = event;
          
        
  
          //  set the input state to this 
          this.setState({ 
              [event.target.name]: event.target.value,
          },()=>{
            //  after it has been commit ot the state then 
             
            const target = e.target;
            console.log(e.target)
          });
      }
    render(){
        const { open, toggle } = this.props;
        const { active, email, password, passwordConfirm, error } = this.state;
        var _this = this;
        let errorItem;
        
        if(error){
            debugger
            errorItem = (
                <Alert color="danger">
                    {error.message}
                </Alert>
            )
        }
        let inner = (<div style={{marginTop : "1rem", display : "flex", flexDirection : "column", alignItems : "center"}}>
            <FormGroup>
                <Label for="exampleEmail">Email</Label>
                <Input type="email" required name="email" id="exampleEmail"  value={email} onChange={(event)=>_this.onChange(event) }/>
            </FormGroup>
            <FormGroup>
                <Label for="examplePassword">Password</Label>
                <Input type="password" required name="password" id="examplePassword"  value={password} onChange={(event)=>_this.onChange(event)} />
            </FormGroup>
            <FormGroup>
                <Label for="examplePassword" > Confirm Password</Label>
                <Input type="password" required name="passwordConfirm" id="examplePassword" value={passwordConfirm} onChange={(event)=>_this.onChange(event)}/>
            </FormGroup>
            <FormGroup>
                <Button color="success" onClick={()=>{_this.signup()}}>Signup</Button>
            </FormGroup>
            
        </div>)
        if(active != "signup"){
            inner = (<div style={{marginTop : "1rem", display : "flex", flexDirection : "column", alignItems : "center"}}>
            <FormGroup>
                <Label for="exampleEmail">Email</Label>
                <Input type="email" required name="email" id="exampleEmail" value={email} onChange={(event)=>_this.onChange(event) }/>
            </FormGroup>
            <FormGroup>
                <Label for="examplePassword">Password</Label>
                <Input type="password" required name="password" id="examplePassword" value={password} onChange={(event)=>_this.onChange(event)} />
            </FormGroup>
           
            <FormGroup>
                <Button color="success" onClick={()=>{_this.login()}}>Login</Button>
            </FormGroup>
            
        </div>)
        }
        return (
             
              <Modal centered isOpen={open} toggle={toggle} >
                <ModalHeader toggle={toggle}>SignUp / Login</ModalHeader>
                <ModalBody style={{display : "flex",flexDirection : "column", alignItems: "stretch"}}>
                <Alert color="primary">
                    Sign up and save your ideas across mutiple devices
                </Alert>
                <ButtonGroup>
                    <Button onClick={()=>{
                        _this.setState({active : "signup"})
                    }}
                    color={active == "signup" ? "primary" : "secondary"}
                    >Sign Up</Button>
                    <Button
                    onClick={()=>{
                        _this.setState({active : "login"})
                    }}
                    color={active == "login" ? "primary" : "secondary"}
                    >Login</Button> 
                </ButtonGroup>
                {errorItem}
                 {inner}
                </ModalBody>
                <ModalFooter>
                  <Button 
                  
                  color="secondary" onClick={toggle}>Cancel</Button>
                </ModalFooter>
                </Modal>
               
          );
    }
})