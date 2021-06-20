'use strict';

import React, { Component } from 'react';

import {StyleSheet, PermissionsAndroid} from 'react-native';

import {
  ViroARScene,
  ViroText,
  ViroConstants,
  ViroCamera
} from '@viro-community/react-viro';

import Geolocation from '@react-native-community/geolocation';
import Projector from 'ecef-projector';

Geolocation.setRNConfiguration({auto: "auto"});

export default class HelloWorldSceneAR extends Component {

  constructor() {
    super();

    // Set initial state here
    this.state = {
      text : "Initializing AR...",
      text_2 : '',
      geolocation : {
        latitude : null,
        longitude : null,
        altitude : null,
        objX: null,
        objY: null,
        objZ: null,
      }
    };

    // bind 'this' to functions
    this._onInitialized = this._onInitialized.bind(this);
    this._goSetText2 = this._goSetText2.bind(this);
    this._requestLocationPermission = this._requestLocationPermission.bind(this);
  }


  componentDidMount() {

    this._requestLocationPermission();


    // const granted = PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
    // if (PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION) {
    if (PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION) {

      // this._getLocation()

      Geolocation.getCurrentPosition(
          (position) => {
            console.log(position.coords);

            let xyz = Projector.project(
              position.coords.latitude, 
              position.coords.longitude, 
              position.coords.altitude  
            );
            console.log(xyz);

            // let xyzobjetText = Projector.project(48.49487401, 0.00000001, 0.00000001);

            let xyzobjetText = Projector.project(
              48.49410654, 
              -2.69265254, 
              64.5941162109375
            );



            console.log('xyzobjetText : ',xyzobjetText);

            this.setState({
              ...this.state,
              geolocation: {
                latitude: parseFloat(xyz[0]),
                longitude: parseFloat(xyz[1]),
                altitude: parseFloat(xyz[2]),
                objX: parseFloat(xyzobjetText[0]),
                objY: parseFloat(xyzobjetText[1]),
                objZ: parseFloat(xyzobjetText[2]),
              },
            });

            this._goSetText2();
          },
          (error) => {
            // See error code charts below.
            console.log(error.code, error.message);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    }
  }


  /**
   * demande la permisson
   */
  _requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Autorisation d'accès à la localisation",
          message:
            "Notre application a besoin d'accéder à votre localisation.",
          buttonNeutral: "Me demander plus tard",
          buttonNegative: "Annuler",
          buttonPositive: "OK"
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the camera");
        return granted;
      } else {
        console.log("Camera permission denied");
        return 'no';
      }
    } catch (err) {
      console.warn(err);
    }
  };


  _goSetText2() {
    this.setState({
      ...this.state,
      text_2 : "Latitude: " + this.state.geolocation.latitude
    });
  }

  render() {

    const userX = this.state.geolocation.latitude;
    const userY = this.state.geolocation.longitude;
    const userZ = this.state.geolocation.altitude;

    const objX = this.state.geolocation.objX;
    const objY = this.state.geolocation.objY;
    const objZ = this.state.geolocation.objZ;

    if (this.state.geolocation.latitude === null) {
        return (
            <ViroARScene onTrackingUpdated={this._onInitialized} >
                <ViroText text={this.state.text} scale={[.5, .5, .5]} position={[0, 0, -1]} style={styles.helloWorldTextStyle} />
            </ViroARScene>
        )
    }else{

      return (
        <ViroARScene onTrackingUpdated={this._onInitialized} >
          <ViroCamera position={[userX, userY, userZ]} active={true} />
          <ViroText text={this.state.text} scale={[.5, .5, .5]} position={[objX, objY, objZ]} style={styles.helloWorldTextStyle} />
          <ViroText text={this.state.text_2} scale={[.5, .5, .5]} position={[-1 , 0, -1]} style={styles.helloWorldTextStyle} />
        </ViroARScene>
      );
    }
  }

  _onInitialized(state, reason) {
    if (state == ViroConstants.TRACKING_NORMAL) {
      this.setState({
        text : "Hello World!"
      });
    } else if (state == ViroConstants.TRACKING_NONE) {
      // Handle loss of tracking
    }
  }
}

var styles = StyleSheet.create({
  helloWorldTextStyle: {
    fontFamily: 'Arial',
    fontSize: 30,
    color: '#ffffff',
    textAlignVertical: 'center',
    textAlign: 'center',  
  },
});

module.exports = HelloWorldSceneAR;
