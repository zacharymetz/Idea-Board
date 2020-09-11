import React , { Component,useState  } from 'react';
import { Container, Card, Row, Col, Tooltip,Form, FormGroup, Label, Input, FormText } from 'reactstrap'
import './index.css'
import { withFirebase } from '../Firebase'
import NavBar from '../Navbar'

import AuthModal from '../AuthenticationModal'


export default withFirebase(class extends Component{
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
       
      _this.setState({user : user.uid},()=>{_this.loadList()})
      if(user.isAnonymous){
        _this.setState({ loginModalOpen : true })
      }
    });
   
    
    
  }

  async loadList(){
    const { user } = this.state;
    const { firestore } = this.props.firebase;
     
    var _this = this;
    let results =  await firestore.collection("user").doc(user).collection("ideas").where("archived", "==", false) .orderBy("date", "desc").limit(100).get();
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
    firestore.collection("user").doc(user).collection("ideas").onSnapshot(function(snapshot) {
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
    let result = await firestore.collection("user").doc(user).collection("ideas").add({
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
    items = items.sort((a,b)=> a-b);

    this.setState({ items })
  }

  render(){
    var _this =this;
    const { items,loginModalOpen  } = this.state;

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "Sept", "October", "November", "December"
      ];

    //  first we need to split them up by day 
    let itemsPerDay = {};
    for(let item of items ){
      //  check the day (dayofMonth, month and year)
      let date = new Date(item.date) 
      var dd = String(date.getDate()).padStart(2, '0'); 
      var mm =  date.getMonth() 
      var yyyy = date.getFullYear();  
      let dateString =   monthNames[mm] + ' ' + dd; // + '/' + yyyy; 
      if(itemsPerDay[dateString] == null){
        //  the list of idea for that day is empty so we need to add one 
        itemsPerDay[dateString] = [item];
      }else{
        //  the list of ideas for that day exists so we just need to add to it 
        itemsPerDay[dateString].push(item);
      }
    }
    let lists = [];
    for(let dateString of Object.keys(itemsPerDay)){
      //  first add the date thing 
      lists.push(<h3>{dateString}</h3>)

      //  then create a new list to add to the row then to the list 
      let ideasInDay = itemsPerDay[dateString];
      let listItems = [];
      for(let item of ideasInDay){
        if(!item.archived)
          listItems.push( <ListItem key={item.id} data={item} view={item.inital} edit={item.inital} /> )
      }
      lists.push(<Row>
        {listItems}
       </Row>)

      
    }


 
    return (
    <div>
      <NavBar toggleModal={()=>_this.setState({loginModalOpen : !_this.state.loginModalOpen})} />
      <Container style={{marginTop : "1rem", position : "relative", }}>
        {lists}
          <AddButton onClick={()=>{
            //  
            _this.createNewEntry();
          }} />
      </Container>
      < AuthModal  open={loginModalOpen} toggle={()=>_this.setState({loginModalOpen : !_this.state.loginModalOpen})}/>
    </div>
    )
  }
})


const ListItem = withFirebase( class  extends Component{
  constructor(props){
    super(props);
    console.log(props)
     this.textRef = React.createRef()
    this.state = {
      //  the edititng varaibles 
      view :   props.view == false ? false : true,
      edit : props.edit == false ? false : true,

      //  the variables of the inputs 
      title : this.props.data.title,
      description : this.props.data.description,




    }
  }
  resizeInputs(){
    const { id } = this.props.data;
    document.getElementById("title-"+id).style.height = 'inherit'
    let titleHeight = document.getElementById("title-"+id).scrollHeight
    document.getElementById("title-"+id).style.height = `${titleHeight}px`; 
    console.log(titleHeight)
    document.getElementById("description-"+id).style.height = 'inherit'
    
    let descriptionHeight = document.getElementById("description-"+id).scrollHeight
    document.getElementById("description-"+id).style.height = `${descriptionHeight}px`;  
  }
  

  
  async archiveIdea(){
    const { userid, id } = this.props.data;
    const { title, description } = this.state;
    //  update the idea with firebase and set archived to true 
    await this.props.firebase.firestore.collection("user").doc(userid).collection('ideas').doc(id).update({
      archived : true
    });

    //   then make it go commit die somehow so it dosent show up haha 

  }
  

  shareIdea(){
    //  auto copy a linkk kjust for now to this direct card 
  }



  onChange(event){
      var e = event;
        
      e.target.style.height = 'inherit';
      e.target.style.height = `${e.target.scrollHeight}px`; 

        //  set the input state to this 
        this.setState({ 
            [event.target.name]: event.target.value,
        },()=>{
          //  after it has been commit ot the state then 
           
          const target = e.target;
          console.log(e.target)
        });
    }
  toggleView(){
    this.setState({
      view : ! this.state.view
    })
  }
  startEdit(){
    this.setState({edit : true},()=>this.resizeInputs())
  }
  async saveEdit(){
    const { userid, id } = this.props.data;
     
    const { title, description } = this.state;
    //  we need to save the edit it with fire base when we say to reload this 
    await this.props.firebase.firestore.collection("user").doc(userid).collection('ideas').doc(id).update({
      title, 
      description
    });;
    this.setState({edit : false, view : false})
  }
  discardEdit(){
    //  set the state to the props 
    const { title, description } = this.props.data;



    this.setState({
      edit : false,
      title, description 
    });
  }
  render(){
    const { view, edit, title, description } = this.state;
    const { id } = this.props.data;
    var _this = this; 
    let outerStyle = {};
    let background;
    let cardViewStyle = "";
    let menu;
    let innerCard = (<div><h4 style={{fontWeight : "400"}}>{title} </h4>
                    <p>{description}</p>
                    </div>)
    if(view){
         
      background = <div onClick={()=>_this.toggleView()}  style={{position : "absolute",top : 0, left : 0, zIndex : 20, height : "100vh", width : "100%", backgroundColor : " black", opacity : 0.65}}/>;

      outerStyle = {position : "fixed",top : 0, left : 0, zIndex : 20, height : "100vh", width : "100%", display : "flex", alignItems : "center", justifyContent : "center"}
       
      cardViewStyle= "card-full-screen";
      menu = [<CardButton toolTipText={"Delete"} iconClass={"card-archive-icon"} onClick={()=>{_this.archiveIdea()}} />,
      <CardButton toolTipText={"Share"} iconClass={"card-share-icon"} />,
               ];

      if(!edit){
        menu.push(<CardButton
          onClick={()=>_this.startEdit()}
        
         toolTipText={"Edit"} iconClass={"card-archive-edit"} /> )
      }else{
        menu.push(<CardButton
          onClick={()=>_this.saveEdit()}
         toolTipText={"Save"} iconClass={"card-save-icon"} />,
         <CardButton
          onClick={()=>_this.discardEdit()}
         toolTipText={"Discard"} iconClass={"card-discard-icon"} /> );;



         // now if we are view and editing this bitch then 
         // we need to make sure that the inner card is all inputs and 
         // they are styled to fit in perfectly 
          innerCard = (
            <div style={{display :"flex", flexDirection:"column", alignItems :"stretch"}}>
              
                 
                <textarea type="textarea"
                 style={{
                   border:"none",
                   padding:0,
                   fontSize : "1.5rem",

                }} 
                id={"title-"+id}
                className="textareaInput"
                name="title" 
                value={title} 
                onChange={(event)=>_this.onChange(event)}placeholder="with a placeholder" />
               
              
                <textarea 
                style={{

                }}
                id={"description-"+id}
                type="textarea" name="description" 
                value={description}
                style={{
                   border:"none",
                   padding:0,
                   fontSize : "1rem",
                   
                }}  
                className="textareaInput"
                onChange={(event)=>_this.onChange(event)}
                placeholder="password placeholder" />  
            </div>
          )
      }
      
    } 
    return ( 
    <Col lg="4" className="card-column "  >
     
    <div style={outerStyle}>
      <div style={{zIndex : 25}} ><Card onClick={()=>{if(!view){_this.toggleView()}}} className={"shadow card-main  "+cardViewStyle} body >
            {innerCard}
            <div className="card-menu">
                    {menu}
                    </div>
            </Card></div>
       {background}
    </div>
      
     
    
      
    </Col>
    )
  }
  
})


const AddButton = (props) =>{
  return ( 
  <div onClick={props.onClick} className="item-new-button shadow">
    <div className="inner-add-icon" />
  </div>
  )
}

const CardButton = (props) => {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const toggle = () => setTooltipOpen(!tooltipOpen);

  return (
    <div>
       
      <div onClick={props.onClick} id="TooltipExample" className="card-menu-icon shadow">
                <div className={props.iconClass} />
              </div>
      <Tooltip placement="top" isOpen={tooltipOpen} target="TooltipExample" toggle={toggle}>
        {props.toolTipText}
      </Tooltip>
    </div>
  );
}