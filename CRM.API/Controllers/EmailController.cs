using CRM.API.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CRM.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    private readonly CrmDbContext _context;

    public EmailController(CrmDbContext context)
    {
        _context = context;
    }

    [HttpPost("send")]
    public IActionResult SendEmail([FromBody] EmailRequest request)
    {
        // Mock email sending
        Console.WriteLine($"[EMAIL] To: {request.To}, Subject: {request.Subject}");
        Console.WriteLine($"[EMAIL] Body: {request.Body}");
        
        return Ok(new { message = "Email sent successfully (mocked)" });
    }

    [HttpPost("generate-template")]
    public IActionResult GenerateTemplate([FromBody] TemplateRequest request)
    {
        // Mock AI Template Generation
        var draft = $"Hi {request.CustomerName},\n\n" +
                    $"I noticed your deal '{request.DealTitle}' is currently in the '{request.Stage}' stage. " +
                    "I wanted to follow up and see if there's anything else you need from our end to move forward.\n\n" +
                    "Best regards,\n" +
                    "Your CRM Team";

        return Ok(new { draft });
    }
}

public class EmailRequest
{
    public string To { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}

public class TemplateRequest
{
    public string CustomerName { get; set; } = string.Empty;
    public string DealTitle { get; set; } = string.Empty;
    public string Stage { get; set; } = string.Empty;
}
