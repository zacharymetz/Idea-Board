import React , { Component,useState  } from 'react';
import { Container, Card, Row, Col, Tooltip,Form, FormGroup, Label, Input, FormText } from 'reactstrap'
import './index.css'
import { withFirebase } from '../Firebase'
import NavBar from '../Navbar'
import AuthModal from '../AuthenticationModal'
import Truncate from 'react-truncate';
import FileImg from './files-and-folders.svg'
var path = require('path')
