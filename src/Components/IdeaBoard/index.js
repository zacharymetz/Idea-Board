import React , { Component,useState  } from 'react';
import { Container, Card, Row, Col, Tooltip,Form, FormGroup, Label, Input, FormText } from 'reactstrap'
import './index.css'
import { withFirebase } from '../Firebase'
import NavBar from '../Navbar'
import AuthModal from '../../helpers/Components/AuthenticationModal'
import Truncate from 'react-truncate';
import FileImg from './files-and-folders.svg'
var path = require('path')

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
    
    return (
    <div>
      <NavBar toggleModal={()=>_this.setState({loginModalOpen : !_this.state.loginModalOpen})} />
      <Container style={{marginTop : "1rem", position : "relative", }}>
      <Row>
        {items.map(item=><ListItem 
                            key={item.id} 
                            data={item} 
                            view={item.inital} 
                            edit={item.inital} 
                          />)}
      </Row>
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
    this.fileRef = React.createRef();

    this.state = {
      //  the edititng varaibles 
      view :   props.view == false ? false : true,
      edit : props.edit == false ? false : true,

      uploadingFile : false,

      //  the variables of the inputs 
      title : this.props.data.title,
      description : this.props.data.description,
      attachments : [],
      sizeBeforeModal : 0,
      mainId : uuidv4(),




    }
    this.loadAttachments();
  }

  async loadAttachments(){
    const { userid, id } = this.props.data;
    let attachmentsResults = await this.props.firebase.firestore.collection("user").doc(userid).collection('ideas').doc(id).collection('attachments').get();
    


    let attachments = [];
    for(let doc of attachmentsResults.docs){
      console.log("the doc that matters ", doc)
      attachments.push({
        id : doc.id,
        ... doc.data(),
        userid : userid,
        ideaid : id
      });
    }
    this.setState({ attachments })
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
  uploadAttachment(){
    //  make sure to click the file input 
    const {  id } = this.props.data;
    const { uploadingFile } = this.state; 
    if(!uploadingFile)
      document.getElementById('file-'+id).click();
  }
  //  automatically upload the file to firestore storage then 
  async handleFileChange(e){
    let file = e.target.files[0];
    const { userid, id } = this.props.data;
    this.setState({
      uploadingFile : true
    })
    console.log(file)
     

    //  make sure to upload the file and add it to the card in firebase 
    //  in the attachments collection for this document 
    var storageRef = this.props.firebase.storage.ref();
    let fileExtention = path.extname(file.name);
    // Create a reference to the user and card by the id so we can restrict access later 
    var imageRef = storageRef.child('/'+ userid +'/'+ id +'/'+uuidv4()+fileExtention);
    
    
    await imageRef.put(file);

    let longLivedUrl = await imageRef.getDownloadURL();



    let firestoreResult = await this.props.firebase.firestore
          .collection("user").doc(userid)
          .collection('ideas').doc(id)
          .collection('attachments') .add({
              name : file.name,
              size : file.size,
              type : file.type,
              lastModified : file.lastModified,
              url : longLivedUrl
          });

    this.loadAttachments();
    //  when we get to here the image is all registed and we can clear
    //  the file upload 
    document.getElementById('file-'+id).value = []
    this.setState({
      uploadingFile : false
    });
    


  }
  toggleView(){
    const { mainId } = this.state;
    
    this.setState({
      view : ! this.state.view,
      sizeBeforeModal : this.state.view ? 0 : document.getElementById(mainId).clientHeight

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
    const { view, edit, uploadingFile, attachments, title, description, mainId, sizeBeforeModal } = this.state;
    const { id, key, date  } = this.props.data;
    var _this = this; 
    let outerStyle = {};
    let background;
    let cardViewStyle = "";
    let menu;
    let innerCard = (<div style={{marginBottom : "1rem"}}>
                  <h4 style={{fontWeight : "400"}}>{title} </h4>
                    <Truncate lines={view ? null : 3}>
                      <p>{description}</p>
                    </Truncate>
                    </div>)
    
    if(view){
         
      background = <div onClick={()=>_this.toggleView()}  style={{position : "absolute",top : 0, left : 0, zIndex : 20, height : "100vh", width : "100%", backgroundColor : " black", opacity : 0.65}}/>;

      outerStyle = {position : "fixed",top : 0, left : 0, zIndex : 20, height : "100vh", width : "100%", display : "flex", alignItems : "center", justifyContent : "center"}
       
      cardViewStyle= "card-full-screen";
      menu = [];

      if(!edit){
        menu.push(<CardButton id={id} toolTipText={"Share"} iconClass={"card-share-icon"} />)
        menu.push(<CardButton  id={id}
          onClick={()=>_this.startEdit()}
        
         toolTipText={"Edit"} iconClass={"card-archive-edit"} /> )
      }else{
        menu.push(<CardButton  id={id}
          onClick={()=>_this.uploadAttachment()}
         toolTipText={"Attachment"} iconClass={uploadingFile ? "card-attachment-uploading-icon" : "card-attachment-icon"} />,<CardButton  id={id}
          onClick={()=>_this.saveEdit()}
         toolTipText={"Save"} iconClass={"card-save-icon"} />,
         <CardButton  id={id}
          onClick={()=>_this.discardEdit()}
         toolTipText={"Discard"} iconClass={"card-discard-icon"} /> );
         menu.push(<CardButton toolTipText={"Delete"}  id={id} iconClass={"card-archive-icon"} onClick={()=>{_this.archiveIdea()}} />)



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

<input id={"file-"+id} onChange={(event)=>_this.handleFileChange(event)} name={"file"} type='file' hidden/>
            </div>
          )
      }
      menu = menu.reverse()
      
      
    } 
    return ( 
    <Col lg="4" className="card-column " key={key} >
      {/* dummy card for when it is in the modal position */}
      {view ? <Card  style={{ paddingTop : sizeBeforeModal }} className={"shadow card-main"} /> : null}
      <div style={outerStyle}>
      
      <div style={{zIndex : 25}} >
        <Card onClick={()=>{if(!view){_this.toggleView()}}} id={mainId} className={"shadow card-main  "+cardViewStyle} body style={{maxHeight : "90vh" , overflowY : "scroll"}}>
            {innerCard}
            <AttachemntList attachments={attachments} view={view} />
            <div className="card-menu">
                {menu}
            </div>
            <small className="text-muted" style={{textAlign:"right"}}>
              {getFormattedDate(new Date(date))}
            </small>
            
        </Card>
            </div>
       {background}
    </div>

    </Col>
    )
  }
  
})
function getFormattedDate(date) {
  var year = date.getFullYear();

  var month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;

  var day = date.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  
  return (date.getHours() % 12 == 0 ? 12 : date.getHours() % 12 ) + ":" + date.getMinutes()  + (date.getHours() / 12 == 0 ? "am" : "pm") +  " " + month + '/' + day + '/' + year;

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
  let ids = uuidv4().replace("-","")
  return (
    <div>
       
      <div onClick={props.onClick} id={props.id+props.toolTipText} className="item-media-button shadow">
                <div className={props.iconClass} />
              </div>
       
    </div>
  );
}



const AttachemntList = withFirebase(class extends Component{
  render(){
    var { attachments, view } = this.props;
    console.log("ASDASDASDSADSDA",{attachments})
    let attachmentElements = [];
    if(view){
      
    
      for(let attachemnt of attachments){
        attachmentElements.push(
          <AttachemntListItem 
            url={attachemnt.url}
            name={attachemnt.name}
            type={attachemnt.type}
          />
        )
      }
    }else{
      for(let i=0;i<attachments.length && i< 3; i++ ){
        let attachemnt = attachments[i]
        attachmentElements.push(
          <AttachemntListItem 
            url={attachemnt.url}
            name={attachemnt.name}
            type={attachemnt.type}
          />
        )
      }
      // then add how many more there are to the ... 
      if(attachments.length > 3)
        attachmentElements.push(
          <div className="text-muted" style={{marginBottom : "1rem"}}>
            {"+"+(attachments.length - 3) + "..."}
          </div>
          
          )
    }
    return(
    <div style={{display : "flex",flexDirection : "row", flexWrap : "wrap", width : "100%", alignItems : "flex-end"}}>{attachmentElements}</div>
    )
  }
});


const AttachemntListItem = withFirebase(class extends Component{
  render(){
    const { name,url, type } = this.props;
    let img =  <img     className="  attachment-thumbnail"    />;
    let label = "Attachment"
    console.log("here is some things",this.props)

    //  if its an image it can go in an image tag
    if(type.split("/")[0] == "image"){
      img = <img  src={url}  className="  attachment-thumbnail"   />;
      label = "Image"
    }else{
      img = <img  src={FileImg}  className="  attachment-thumbnail" style={{padding:"6px"}}   />;
      
    }
    return(
    <div onClick={()=>{
      //  when you click on it if its an image you should go 
      //   full screen with it 



      //  if not you should just download it 
      window.open(url)
    }} className="attachment-item" style={{display : "flex", flexDirection : "column"}}>
     
      {  true ?   <div style={{ position : "relative" }}>
        {img}
        <div style={{
              width : "100%",
              position : "absolute",
              left : 0,
              bottom : 0,
              paddingLeft : 4

        }}
        className="attachment-item-text"
        >
          
        <Truncate width={64}>
          {type.split("/")[0] == "image" ? " " :  name}
        </Truncate>
          
          
        </div>
      </div> : null }
      
      <div className="">

      </div>
    </div>
    )
  }
});







function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}