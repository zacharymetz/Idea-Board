import React , { Component,useState  } from 'react';
import { Container, Card, Row, Col, Tooltip,Form, FormGroup, Label, Input, FormText } from 'reactstrap'
import './index.css'
var path = require('path')


export default (props) =>{
    return ( 
    <div onClick={props.onClick} className="item-new-button shadow">
      <div className="inner-add-icon" />
    </div>
    )
  }
  