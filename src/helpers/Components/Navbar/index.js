import React , { Component, useState } from 'react';
import { Input, Modal,Form, ModalHeader, ModalBody,ModalFooter, Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Button } from 'reactstrap'
import './index.css'
import { withFirebase } from '../../../Components/Firebase';

export default withFirebase( class extends Component{
  constructor(props){
    super(props);
    this.state = {
      user : null,
      dropdownOpen : false,
      newSharedBoardModalOpen : false,
      sharedBoards : [],
    }
    var _this = this;
    this.props.firebase.auth.onAuthStateChanged((user)=>{
       
      if(!user.isAnonymous){
        console.log(user)
        _this.setState({ user : user })
      }
    });
  }
  async logout(){
    await this.props.firebase.auth.signOut();


    //  reload the page 
    window.location.reload();


  }

  async loadSharedBoards(){

    // get the list of shared boards where i exists in the contributors 
    const { user } = this.state;
    const { firestore } = this.props.firebase;
       
      var _this = this;
      let results =  await firestore.collection("board").where("contributors", "array-contains", user.uid).limit(100).get();
      let items = []
      console.log(results);
      for(let doc of results.docs){
        console.log(doc)
        items.push({
          id : doc.id,
          userid : user,
          ...doc.data(),
          inital : false
        });
      };
  
      this.setState({  sharedBoards :  items });
  

  }

  async openNewBoardModal(){
    this.setState({
      newSharedBoardModalOpen : true
    })
  }


  async createNewBoard(title){
    // create a new board with the user in the colaborators thing 
    const { user } = this.state;
    const { firestore, createNewBoard , dropdownOpen} = this.props.firebase;
    try{
      let s = createNewBoard()
      await s({title : "meme"});
    }catch(e){
      console.log(e)
    }
    
    this.setState({dropdownOpen : !dropdownOpen})
  }


  render(){
    const { toggleModal } = this.props;
    const { user, dropdownOpen, sharedBoards,newSharedBoardModalOpen } = this.state;
    var _this = this;
    let button = (<Button onClick={toggleModal} size="sm">Signup / Login</Button>);
    if(user){
      button = [
        <Dropdown  isOpen={dropdownOpen} toggle={()=>{_this.setState({dropdownOpen : !dropdownOpen})}}>
        <DropdownToggle caret>
          Shared Boards
        </DropdownToggle>
        <DropdownMenu>
          <DropdownItem header>Boards</DropdownItem>
          {sharedBoards.map(item =>(
            <DropdownItem
            onClick={()=>{
              // naviage to this board from the url
            }}
            >
              {item.title}
            </DropdownItem>
          ))}
          {sharedBoards.length == 0 ? 
          <DropdownItem text >No Shared Boards</DropdownItem>
          : null }
          
          <DropdownItem divider />
          <DropdownItem header>Actions</DropdownItem>
          <DropdownItem onClick={()=>_this.openNewBoardModal()} >New Board</DropdownItem>
        </DropdownMenu>
      </Dropdown>
        ,,
        (<Button onClick={()=>{_this.logout()}} style={{marginLeft : "2rem"}} size="sm">Sign Out</Button>)];
    }
    return (
    <div
      className="nav-wrapper"
    >
      <div style={{flexGrow : 1, display : "flex", alignItems : "center"}}>
         <div className="logo-icon" /> Idea Book
      </div>
        < NewBoardModal create={()=>this.createNewBoard()} isOpen={newSharedBoardModalOpen} toggle={()=>{_this.setState({newSharedBoardModalOpen : !newSharedBoardModalOpen})}} />
      {button}
    </div>
    )
  }
})



const NewBoardModal = ({ isOpen, toggle, create }) =>{
  const [title, setTitle] = useState("");

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered>
      <ModalHeader toggle={toggle}>New Idea Board</ModalHeader>
      <ModalBody>
   
          <Input 
          
          />
       
      </ModalBody>
      <ModalFooter>
        <Button color="success" onClick={()=>{
          console.log("yeet")
          create()
        }}>Create</Button>{' '}
        <Button color="secondary" onClick={toggle}>Cancel</Button>
      </ModalFooter>
    </Modal>
  )
}