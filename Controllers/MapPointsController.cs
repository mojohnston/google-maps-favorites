using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GoogleMapFavorites.Data;
using GoogleMapFavorites.Models;

namespace GoogleMapFavorites.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MapPointsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MapPointsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/MapPoints?profile=Love
        [HttpGet]
        public async Task<IActionResult> GetMapPoints([FromQuery] string profile)
        {
            var points = await _context.MapPoints
                .Where(mp => mp.Profile == profile)
                .ToListAsync();
            return Ok(points);
        }

        // POST: api/MapPoints
        [HttpPost]
        public async Task<IActionResult> PostMapPoint(MapPoint point)
        {
            _context.MapPoints.Add(point);
            await _context.SaveChangesAsync();
            return Ok(point);
        }
    }
}
