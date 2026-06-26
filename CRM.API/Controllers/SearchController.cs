using CRM.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CRM.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SearchController : ControllerBase
{
    private readonly CrmDbContext _context;

    public SearchController(CrmDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q)) return Ok(new { customers = Array.Empty<object>(), deals = Array.Empty<object>(), tasks = Array.Empty<object>() });

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var query = q.ToLower();

        var customers = await _context.Customers
            .Where(c => c.UserId == userId && (c.FirstName.ToLower().Contains(query) || c.LastName.ToLower().Contains(query) || c.Company.ToLower().Contains(query)))
            .Select(c => new { id = c.Id, title = c.FirstName + " " + c.LastName, type = "Customer", desc = c.Company })
            .ToListAsync();

        var deals = await _context.Deals
            .Where(d => d.UserId == userId && d.Title.ToLower().Contains(query))
            .Select(d => new { id = d.Id, title = d.Title, type = "Deal", desc = d.Stage })
            .ToListAsync();

        var tasks = await _context.Tasks
            .Where(t => t.UserId == userId && t.Title.ToLower().Contains(query))
            .Select(t => new { id = t.Id, title = t.Title, type = "Task", desc = t.Status })
            .ToListAsync();

        return Ok(new { customers, deals, tasks });
    }
}
