using CRM.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly CrmDbContext _db;

    public ReportsController(CrmDbContext db) => _db = db;

    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var totalCustomers = await _db.Customers.CountAsync();
        var activeCustomers = await _db.Customers.CountAsync(c => c.Status == "Active");
        var totalDeals = await _db.Deals.CountAsync();
        var totalRevenue = await _db.Deals.Where(d => d.Stage == "Closed Won").SumAsync(d => (double)d.Value);
        var pipelineValue = await _db.Deals.Where(d => d.Stage != "Closed Lost").SumAsync(d => (double)d.Value);
        var openTasks = await _db.Tasks.CountAsync(t => t.Status != "Completed");
        var overdueTasks = await _db.Tasks.CountAsync(t => t.Status != "Completed" && t.DueDate < DateTime.UtcNow);

        var dealsByStage = await _db.Deals
            .GroupBy(d => d.Stage)
            .Select(g => new { Stage = g.Key, Count = g.Count(), Value = g.Sum(d => (double)d.Value) })
            .ToListAsync();

        var customersByStatus = await _db.Customers
            .GroupBy(c => c.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var topDeals = await _db.Deals
            .Include(d => d.Customer)
            .Where(d => d.Stage != "Closed Lost")
            .OrderByDescending(d => (double)d.Value)
            .Take(5)
            .Select(d => new { d.Id, d.Title, Value = (double)d.Value, d.Stage, d.Probability, CustomerName = $"{d.Customer.FirstName} {d.Customer.LastName}" })
            .ToListAsync();

        var recentCustomers = await _db.Customers
            .OrderByDescending(c => c.CreatedAt)
            .Take(5)
            .Select(c => new { c.Id, c.FirstName, c.LastName, c.Company, c.Status, c.CreatedAt })
            .ToListAsync();

        return Ok(new
        {
            totalCustomers,
            activeCustomers,
            totalDeals,
            totalRevenue,
            pipelineValue,
            openTasks,
            overdueTasks,
            dealsByStage,
            customersByStatus,
            topDeals,
            recentCustomers
        });
    }

    [HttpGet("pipeline")]
    public async Task<IActionResult> Pipeline()
    {
        var stages = new[] { "Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost" };

        var data = await _db.Deals
            .Include(d => d.Customer)
            .ToListAsync();

        var pipeline = stages.Select(stage => new
        {
            Stage = stage,
            Deals = data.Where(d => d.Stage == stage).Select(d => new
            {
                d.Id, d.Title, d.Value, d.Probability, d.ExpectedCloseDate,
                CustomerName = $"{d.Customer.FirstName} {d.Customer.LastName}"
            }).ToList(),
            TotalValue = data.Where(d => d.Stage == stage).Sum(d => d.Value),
            Count = data.Count(d => d.Stage == stage)
        });

        return Ok(pipeline);
    }
}
