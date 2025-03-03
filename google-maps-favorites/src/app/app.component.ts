import { Component, OnInit, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

declare var google: any;  // Ensure Google Maps is loaded externally via index.html

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, HttpClientModule, FormsModule]
})
export class AppComponent implements OnInit {
  selectedProfile: string = 'Love';
  latitude: number = 0;
  longitude: number = 0;
  map: any;
  mapZoom: number = 8;
  markers: any[] = [];

  // A temporary marker for the location that the user clicks (before saving)
  selectedMarker: any = null;

  // Icon selection properties
  selectedIcon: string = 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'; // Default icon
  icons = [
    { label: 'Red Marker', value: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png' },
    { label: 'Blue Marker', value: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' },
    { label: 'Green Marker', value: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' },
  ];

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private zone: NgZone
  ) { }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
      this.loadMarkers();
    }
  }

  initMap() {
    // Use geolocation if available, otherwise use a default location.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
          this.initializeMap(this.latitude, this.longitude);
        },
        () => this.useDefaultLocation()
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

    // When the map is clicked, update the selected coordinates and place a temporary marker
    this.map.addListener('click', (event: any) => {
      this.zone.run(() => {
        // Update component properties with the clicked location
        this.latitude = event.latLng.lat();
        this.longitude = event.latLng.lng();

        // Remove any previously placed temporary marker
        if (this.selectedMarker) {
          this.selectedMarker.setMap(null);
        }

        // Create a new temporary marker at the clicked location using the selected icon
        this.selectedMarker = new google.maps.Marker({
          position: event.latLng,
          map: this.map,
          icon: this.selectedIcon,
          title: "Selected Location"
        });
      });
    });
  }

  updateMapZoom() {
    if (this.map) {
      this.map.setZoom(this.mapZoom);
    }
  }

  selectProfile(profile: string) {
    this.selectedProfile = profile;
    this.loadMarkers();
  }

  loadMarkers() {
    // Remove existing markers from the map
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];

    // Fetch markers from the API for the selected profile
    this.http.get<any[]>(`/api/MapPoints?profile=${this.selectedProfile}`)
      .subscribe(data => {
        data.forEach(point => {
          const marker = new google.maps.Marker({
            position: { lat: point.latitude, lng: point.longitude },
            map: this.map,
            title: this.selectedProfile,
            icon: point.icon || this.selectedIcon
          });
          this.markers.push(marker);
        });
      });
  }

  saveFavorite() {
    // Prepare marker data using the current clicked coordinates and selected icon
    const point = {
      latitude: this.latitude,
      longitude: this.longitude,
      profile: this.selectedProfile,
      icon: this.selectedIcon
    };

    // Save the marker to the backend via the API
    this.http.post('/api/MapPoints', point)
      .subscribe(response => {
        console.log('Saved:', response);
        // Reload the markers from the database
        this.loadMarkers();
      });
  }
}
