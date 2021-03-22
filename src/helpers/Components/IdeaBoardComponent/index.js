import React , { Component,useState  } from 'react';
import { Container, Card, Row, Col, Tooltip,Form, FormGroup, Label, Input, FormText } from 'reactstrap'

import { withFirebase } from '../../../Components/Firebase'
import NavBar from '../Navbar'
import AuthModal from '../AuthenticationModal'

import IdeaBoardItemComponent from '../IdeaBoardItemComponent'
import AddButton from '../AddButton';


var path = require('path');

export default withFirebase(class IdeaBoardComponent extends Component{
    constructor(props){
      super(props);
      let showModal = false;
      this.state ={
        items : [ ],
        loginModalOpen : showModal,
        user : null 
      } 
      var _this = this;
      this.props.firebase.auth.onAuthStateChanged((user)=>{
         
        _this.setState({user : user.uid},()=>{_this.loadList(user)})
        if(user.isAnonymous){
          _this.setState({ loginModalOpen : true })
        }
      });
     
      
      
    }
    getBoardID(){
      // if we are personal return the users uid 
      const { personal } = this.props;
      console.log(this.props)
      if(personal){
        return this.state.user;
      }
      // get the last part of the url 
      console.log(window.location.pathname.split('/').pop())
      return window.location.pathname.split('/').pop();
    }
  
    async loadList(){
      const { user } = this.state ;
      console.log({...this.state},user)
      const { firestore } = this.props.firebase;


      


       
      var _this = this;
      let results =  await firestore.collection("idea").where("boardID", "==", this.getBoardID()).where("archived", "==", false).orderBy("date", "desc").limit(100).get();
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
  

      this.setState({ items });


      //  then we need to make sure we keep synced to the db in the cloud 
      firestore.collection("idea").where("boardID", "==", this.getBoardID()).onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
            // if (change.type === "added") {
            //     console.log("New city: ", change );
            //     //  append it then sort 
            //     const { items } = _this.state;
            //     items.push({
            //       id : change.doc.id,
            //       ...change.doc.data(),
            //       inital : false
            //     })
            //     _this.setState({ items });
            // }
            if (change.type === "modified") {
                console.log("Modified city: ", change );
                //  search throught the list then find the one then add it 
                const { items } = _this.state;
                let found = false;;
                for(let i in items){
                  if(items[i].id == change.doc.id){
                    //   then replace it so the re render happens 
                    items[i] = {
                      id : change.doc.id,
                      userid : user,
                      ...change.doc.data(),
                      inital : false
                    }
                    found = true;
  
                  }
  
                } 
                _this.setState({ items });
            }
            if (change.type === "removed") {
                console.log("Removed city: ", change );
            }
        });
    });
    }
  
    //  create a new item and wait for the call back to add it to the list 
    async createNewEntry(){
      const { user } = this.state;
      const { firestore } = this.props.firebase
      //  set the loading to true 
      
      //  await and create with fierbase 
      let result = await firestore.collection("idea").add({
          boardID : this.getBoardID(), 
          public : false, 
          title : "",
          description : "",
          archived : false,
          date : (new Date()).getTime()
      })
      console.log("ASDASAS",result)
      //  add the item to the list and sort by date 
      var  { items  } = this.state;
      
      items.push({
        id : result.id,title : "",
        userid : user,
        description : "",
        archived : false,
        date : (new Date()).getTime(),
        inital : true
      });
      items = items.sort((a,b)=> b.date-a.date);
  
      this.setState({ items })
    }
  
    render(){
      var _this =this;
      const { items,loginModalOpen  } = this.state;
      
      return (
     
        <Container style={{marginTop : "1rem", position : "relative", }}>
        <Row>
          {items.map(item=><IdeaBoardItemComponent 
                              key={item.id} 
                              data={item} 
                              boardID={this.getBoardID()}
                              view={item.inital} 
                              edit={item.inital} 
                            />)}
        </Row>
            <AddButton onClick={()=>{
              //  
              _this.createNewEntry();
            }} />
        </Container>
      
      )
    }
  })
  