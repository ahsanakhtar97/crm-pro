using CRM.API.Data;
using CRM.API.DTOs;
using CRM.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CustomersController : ControllerBase
{
    private readonly CrmDbContext _db;

    public CustomersController(CrmDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CustomerDto>>> GetAll([FromQuery] string? search, [FromQuery] string? status)
    {
        var query = _db.Customers.Include(c => c.Deals).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(c => c.FirstName.Contains(search) || c.LastName.Contains(search) ||
                                     c.Email.Contains(search) || c.Company.Contains(search));

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(c => c.Status == status);

        var customers = await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
        return Ok(customers.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerDto>> GetById(int id)
    {
        var customer = await _db.Customers.Include(c => c.Deals).FirstOrDefaultAsync(c => c.Id == id);
        return customer is null ? NotFound() : Ok(ToDto(customer));
    }

    [HttpPost]
    public async Task<ActionResult<CustomerDto>> Create(CreateCustomerDto dto)
    {
        var customer = new Customer
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            Phone = dto.Phone,
            Company = dto.Company,
            Status = dto.Status,
            Notes = dto.Notes
        };
        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = customer.Id }, ToDto(customer));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CustomerDto>> Update(int id, UpdateCustomerDto dto)
    {
        var customer = await _db.Customers.FindAsync(id);
        if (customer is null) return NotFound();

        customer.FirstName = dto.FirstName;
        customer.LastName = dto.LastName;
        customer.Email = dto.Email;
        customer.Phone = dto.Phone;
        customer.Company = dto.Company;
        customer.Status = dto.Status;
        customer.Notes = dto.Notes;
        customer.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(ToDto(customer));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var customer = await _db.Customers.FindAsync(id);
        if (customer is null) return NotFound();
        _db.Customers.Remove(customer);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static CustomerDto ToDto(Customer c) => new(
        c.Id, c.FirstName, c.LastName, c.Email, c.Phone, c.Company, c.Status, c.Notes,
        c.CreatedAt, c.Deals.Count, c.Deals.Sum(d => d.Value));
}
