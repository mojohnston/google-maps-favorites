using Microsoft.EntityFrameworkCore;
using GoogleMapFavorites.Models;

namespace GoogleMapFavorites.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
          : base(options)
        { }

        public DbSet<MapPoint> MapPoints { get; set; }
    }
}
