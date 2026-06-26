using CRM.API.Data;
using CRM.API.DTOs;
using CRM.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController : ControllerBase
{
    private readonly CrmDbContext _db;

    public TasksController(CrmDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskDto>>> GetAll([FromQuery] string? status, [FromQuery] string? priority, [FromQuery] int? customerId)
    {
        var query = _db.Tasks.Include(t => t.Customer).AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            query = query.Where(t => t.Status == status);
        if (!string.IsNullOrWhiteSpace(priority))
            query = query.Where(t => t.Priority == priority);
        if (customerId.HasValue)
            query = query.Where(t => t.CustomerId == customerId.Value);

        var tasks = await query.OrderBy(t => t.DueDate).ToListAsync();
        return Ok(tasks.Select(ToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskDto>> GetById(int id)
    {
        var task = await _db.Tasks.Include(t => t.Customer).FirstOrDefaultAsync(t => t.Id == id);
        return task is null ? NotFound() : Ok(ToDto(task));
    }

    [HttpPost]
    public async Task<ActionResult<TaskDto>> Create(CreateTaskDto dto)
    {
        var task = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            Priority = dto.Priority,
            Status = dto.Status,
            DueDate = dto.DueDate,
            CustomerId = dto.CustomerId
        };
        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();
        if (task.CustomerId.HasValue)
            await _db.Entry(task).Reference(t => t.Customer).LoadAsync();
        return CreatedAtAction(nameof(GetById), new { id = task.Id }, ToDto(task));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TaskDto>> Update(int id, UpdateTaskDto dto)
    {
        var task = await _db.Tasks.Include(t => t.Customer).FirstOrDefaultAsync(t => t.Id == id);
        if (task is null) return NotFound();

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.Priority = dto.Priority;
        task.Status = dto.Status;
        task.DueDate = dto.DueDate;
        task.CustomerId = dto.CustomerId;
        task.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(ToDto(task));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var task = await _db.Tasks.FindAsync(id);
        if (task is null) return NotFound();
        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    private static TaskDto ToDto(TaskItem t) => new(
        t.Id, t.Title, t.Description, t.Priority, t.Status, t.DueDate,
        t.CustomerId, t.Customer is null ? null : $"{t.Customer.FirstName} {t.Customer.LastName}",
        t.CreatedAt);
}
