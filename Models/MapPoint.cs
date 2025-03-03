namespace GoogleMapFavorites.Models
{
    public class MapPoint
    {
        public int Id { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Profile { get; set; } = "Love";
        public string Icon { get; set; } = ""; // New property for the icon URL
    }
}
