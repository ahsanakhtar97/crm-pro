using CRM.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CRM.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly CrmDbContext _context;

    public NotificationsController(CrmDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var notifications = new List<object>();

        // Overdue tasks
        var overdueTasks = await _context.Tasks
            .Where(t => t.UserId == userId && t.Status != "Completed" && t.DueDate < DateTime.UtcNow)
            .ToListAsync();

        foreach (var t in overdueTasks)
        {
            notifications.Add(new { type = "Task", message = $"Task '{t.Title}' is overdue!", date = t.DueDate });
        }

        // Deals about to close (within 7 days)
        var closingDeals = await _context.Deals
            .Where(d => d.UserId == userId && d.Stage != "Closed Won" && d.Stage != "Closed Lost" 
                        && d.ExpectedCloseDate > DateTime.UtcNow && d.ExpectedCloseDate < DateTime.UtcNow.AddDays(7))
            .ToListAsync();

        foreach (var d in closingDeals)
        {
            notifications.Add(new { type = "Deal", message = $"Deal '{d.Title}' is expected to close soon!", date = d.ExpectedCloseDate });
        }

        return Ok(notifications.OrderBy(n => ((dynamic)n).date));
    }
}
