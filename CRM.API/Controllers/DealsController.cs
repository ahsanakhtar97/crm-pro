using CRM.API.Data;
using CRM.API.DTOs;
using CRM.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CRM.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DealsController : ControllerBase
{
    private readonly CrmDbContext _db;

    public DealsController(CrmDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DealDto>>> GetAll([FromQuery] string? stage, [FromQuery] int? customerId)
    {
        var query = _db.Deals.Include(d => d.Customer).AsQueryable();

        if (!string.IsNullOrWhiteSpace(stage))
            query = query.Where(d => d.Stage == stage);

        if (customerId.HasValue)
            query = query.Where(d => d.CustomerId == customerId.Value);

        var deals = await query.OrderByDescending(d => d.CreatedAt).ToListAsync();
        return Ok(deals.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DealDto>> GetById(int id)
    {
        var deal = await _db.Deals.Include(d => d.Customer).FirstOrDefaultAsync(d => d.Id == id);
        return deal is null ? NotFound() : Ok(ToDto(deal));
    }

    [HttpPost]
    public async Task<ActionResult<DealDto>> Create(CreateDealDto dto)
    {
        var deal = new Deal
        {
            Title = dto.Title,
            Value = dto.Value,
            Stage = dto.Stage,
            Probability = dto.Probability,
            ExpectedCloseDate = dto.ExpectedCloseDate,
            Notes = dto.Notes,
            CustomerId = dto.CustomerId,
            UserId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? string.Empty
        };
        _db.Deals.Add(deal);
        await _db.SaveChangesAsync();
        await _db.Entry(deal).Reference(d => d.Customer).LoadAsync();
        return CreatedAtAction(nameof(GetById), new { id = deal.Id }, ToDto(deal));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<DealDto>> Update(int id, UpdateDealDto dto)
    {
        var deal = await _db.Deals.Include(d => d.Customer).FirstOrDefaultAsync(d => d.Id == id);
        if (deal is null) return NotFound();

        deal.Title = dto.Title;
        deal.Value = dto.Value;
        deal.Stage = dto.Stage;
        deal.Probability = dto.Probability;
        deal.ExpectedCloseDate = dto.ExpectedCloseDate;
        deal.Notes = dto.Notes;
        deal.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(ToDto(deal));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deal = await _db.Deals.FindAsync(id);
        if (deal is null) return NotFound();
        _db.Deals.Remove(deal);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static DealDto ToDto(Deal d) => new(
        d.Id, d.Title, d.Value, d.Stage, d.Probability, d.ExpectedCloseDate, d.Notes,
        d.CustomerId, $"{d.Customer.FirstName} {d.Customer.LastName}", d.CreatedAt);
}
