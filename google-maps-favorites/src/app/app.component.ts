import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

declare var google: any;  // Make sure Google Maps is loaded externally via index.html

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, HttpClientModule, FormsModule]
})
export class AppComponent implements OnInit {
  selectedProfile: string = 'Love';
  latitude: number = 0;   // Initialize to avoid TS errors
  longitude: number = 0;  // Initialize to avoid TS errors
  map: any;
  mapZoom: number = 8;
  markers: any[] = [];

  // HttpClient is injected for API calls
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.initMap();
    this.loadMarkers();
  }

  // Initialize the map: use current location if available, else default
  initMap() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.initializeMap(this.latitude, this.longitude);
        },
        () => {
          this.useDefaultLocation();
        }
      );
    } else {
      this.useDefaultLocation();
    }
  }

  useDefaultLocation() {
    // Default location: Hoover, AL
    this.latitude = 33.4050;
    this.longitude = -86.8114;
    this.initializeMap(this.latitude, this.longitude);
  }

  initializeMap(lat: number, lng: number) {
    const mapOptions = {
      center: new google.maps.LatLng(lat, lng),
      zoom: this.mapZoom
    };
    this.map = new google.maps.Map(document.getElementById("map"), mapOptions);

    // Update latitude/longitude when the map is clicked
    this.map.addListener('click', (event: any) => {
      this.latitude = event.latLng.lat();
      this.longitude = event.latLng.lng();
    });
  }

  updateMapZoom() {
    if (this.map) {
      this.map.setZoom(this.mapZoom);
    }
  }

  // Toggle profile ("Love" or "Hate") and reload markers from the API
  selectProfile(profile: string) {
    this.selectedProfile = profile;
    this.loadMarkers();
  }

  // Fetch markers for the selected profile using a relative URL
  loadMarkers() {
    // Clear existing markers
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];

    // Use a relative URL so that it works regardless of port
    this.http.get<any[]>(`/api/MapPoints?profile=${this.selectedProfile}`)
      .subscribe(data => {
        data.forEach(point => {
          const marker = new google.maps.Marker({
            position: { lat: point.latitude, lng: point.longitude },
            map: this.map,
            title: this.selectedProfile
          });
          this.markers.push(marker);
        });
      });
  }

  // Save a new favorite point to the API
  saveFavorite() {
    const point = {
      latitude: this.latitude,
      longitude: this.longitude,
      profile: this.selectedProfile
    };
    this.http.post('/api/MapPoints', point)
      .subscribe(response => {
        console.log('Saved:', response);
        this.loadMarkers();
      });
  }
}
