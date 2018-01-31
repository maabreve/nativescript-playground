import { Injectable } from '@angular/core';
import { Http, Headers, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { Config } from './config';
var geolocation = require("nativescript-geolocation");


export interface IPosition {
    latitude: number;
    longitude: number;
}

@Injectable()
export class GeolocationService {
    
    position: IPosition;

    constructor(private http: Http) {}

    getLocation(): Promise<any> {
        return new Promise (
            (resolve, reject) => {
                if (!geolocation.isEnabled()) {
                    geolocation.enableLocationRequest()
                    .then(() => {
                        resolve(this._getCurrentLocation());
                    })
                    .catch(error => {
                        reject(error);
                    });
                } else {
                    resolve(this._getCurrentLocation());
                } 
            }
        )
    }
   
    private _getCurrentLocation() : Promise<any> {
        return new Promise(
            (resolve, reject) => {
                geolocation.getCurrentLocation({ timeout: 5000 })
                .then (location => {
                    this.position = { latitude: location.latitude, longitude: location.longitude }
                    resolve();
                })
                .catch(error => {
                    reject(error);
                })
        })
    }

    public getAddressGeocode(search) {
        
        let searchUrl = search.split(' ').join('+');
        return this.http.get(Config.apiUrlGoogleGeocode + '?address=' + searchUrl + '&key=' + Config.googleGeocodeKey)
        .map(res => res.json())
        .map(data => {
            return data;
        })
        .catch(this.handleErrors);
    }

    public handleErrors(error: Response) {
        return Observable.throw(error);
    }
   
}

