using Microsoft.EntityFrameworkCore;
using GoogleMapFavorites.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Register your database context with SQL Server.
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Enable CORS for your Angular app (or any client) to access the API.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

// Serve static files from wwwroot (make sure wwwroot is in the project root)
app.UseStaticFiles();

// Enable CORS
app.UseCors("AllowAll");

// Use authorization if needed (currently it just passes through)
app.UseAuthorization();

// Map your API controllers.
app.MapControllers();

// Fallback: serve index.html for any routes not handled by controllers.
// This lets your Angular routing work correctly.
app.MapFallbackToFile("index.html");

app.Run();
