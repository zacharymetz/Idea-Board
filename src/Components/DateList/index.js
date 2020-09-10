import React , { Component,useState  } from 'react';
import { Container, Card, Row, Col, Tooltip,Form, FormGroup, Label, Input, FormText } from 'reactstrap'
import './index.css'
import { withFirebase } from '../Firebase'
import NavBar from '../Navbar'

export default withFirebase(class extends Component{
  constructor(props){
    super(props);
   
    this.state ={
      items : [false,false]
    } 
    this.loadList();
  }

  async loadList(){
    const { firestore } = this.props.firebase;
    var _this = this;
    let results =  await firestore.collection("ideas").orderBy("date", "desc").limit(100).get();
    let items = []
    console.log(results);
    for(let doc of results.docs){
      console.log(doc)
      items.push({
        id : doc.id,
        ...doc.data()
      });
    };

    this.setState({ items });



    //  then we need to make sure we keep synced to the db in the cloud 
    // firestore.collection("ideas").onSnapshot(function(snapshot) {
    //   snapshot.docChanges().forEach(function(change) {
    //       if (change.type === "added") {
    //           console.log("New city: ", change.doc.data());
    //       }
    //       if (change.type === "modified") {
    //           console.log("Modified city: ", change.doc.data());
    //       }
    //       if (change.type === "removed") {
    //           console.log("Removed city: ", change.doc.data());
    //       }
    //   });
  // });
  }

  //  create a new item and wait for the call back to add it to the list 
  async createNewEntry(){
    const { firestore } = this.props.firebase
    //  set the loading to true 
    
    //  await and create with fierbase 
    let result = await firestore.collection("ideas").add({
        title : "",
        description : "",
        archived : false,
        date : (new Date()).getTime()
    })
    console.log(result)
    //  add the item to the list and sort by date 
    var  { items  } = this.state;
    
    items.push({
      id : result.id,title : "",
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
    const { items  } = this.state;
    let listItems = [];
    for(let item of items ){
      listItems.push( <ListItem key={item.id} view={item.inital} edit={item.inital} /> )
    }
    
    return (
    <div>
      <NavBar />
      <Container style={{marginTop : "2rem", position : "relative", }}>
        <h3>Sept 1</h3>
        <Row>
         {listItems}
        </Row>
          <AddButton onClick={()=>{
            //  
            _this.createNewEntry();
          }} />
      </Container>
      
    </div>
    )
  }
})


class ListItem extends Component{
  constructor(props){
    super(props);
    console.log(props)
     this.textRef = React.createRef()
    this.state = {
      //  the edititng varaibles 
      view :   props.view == false ? false : true,
      edit : props.edit == false ? false : true,

      //  the variables of the inputs 
      title : "This is a cool Idea what do you think abbout it",
      description : "here is some detail about the idea i think its gonna be dope....",




    }
  }
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
  toggleView(){
    this.setState({
      view : ! this.state.view
    })
  }
  startEdit(){
    this.setState({edit : true})
  }
  saveEdit(){
    //  we need to save the edit it with fire base when we say to reload this 

    this.setState({edit : false})
  }
  discardEdit(){
    //  just reload it with firebase then we good 
    this.setState({edit : false})
  }
  render(){
    const { view, edit, title, description } = this.state;
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
      menu = [<CardButton toolTipText={"Delete"} iconClass={"card-archive-icon"} />,
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
            <div>
              
                 
                <Input type="textarea"
                 style={{
                   border:"none",
                   padding:0,
                   fontSize : "1.5rem",

                }} 
                name="title" 
                value={title} 
                onChange={(event)=>_this.onChange(event)}placeholder="with a placeholder" />
               
              
                <Input 
                style={{

                }}
                type="textarea" name="description" 
                value={description}
                style={{
                   border:"none",
                   padding:0,
                   fontSize : "1rem",
                   
                }}  
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
  
}


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