using CRM.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;

namespace CRM.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ExportController : ControllerBase
{
    private readonly CrmDbContext _context;

    public ExportController(CrmDbContext context)
    {
        _context = context;
    }

    [HttpGet("customers")]
    public async Task<IActionResult> ExportCustomers()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var customers = await _context.Customers.Where(c => c.UserId == userId).ToListAsync();
        
        var builder = new StringBuilder();
        builder.AppendLine("Id,FirstName,LastName,Email,Phone,Company,Status");
        foreach(var c in customers)
        {
            builder.AppendLine($"{c.Id},{c.FirstName},{c.LastName},{c.Email},{c.Phone},{c.Company},{c.Status}");
        }

        return File(Encoding.UTF8.GetBytes(builder.ToString()), "text/csv", "customers.csv");
    }

    [HttpGet("deals")]
    public async Task<IActionResult> ExportDeals()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var deals = await _context.Deals.Where(d => d.UserId == userId).ToListAsync();
        
        var builder = new StringBuilder();
        builder.AppendLine("Id,Title,Value,Stage,Probability,ExpectedCloseDate");
        foreach(var d in deals)
        {
            builder.AppendLine($"{d.Id},{d.Title},{d.Value},{d.Stage},{d.Probability},{d.ExpectedCloseDate}");
        }

        return File(Encoding.UTF8.GetBytes(builder.ToString()), "text/csv", "deals.csv");
    }
}
