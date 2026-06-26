using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using CRM.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AiAssistantController : ControllerBase
{
    private readonly CrmDbContext _db;
    private readonly IConfiguration _config;
    private readonly IHttpClientFactory _httpFactory;

    public AiAssistantController(CrmDbContext db, IConfiguration config, IHttpClientFactory httpFactory)
    {
        _db = db;
        _config = config;
        _httpFactory = httpFactory;
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        var apiKey = _config["Groq:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
            return BadRequest(new { error = "Groq API key not configured. Add Groq:ApiKey to appsettings.json." });

        var customerCount = await _db.Customers.CountAsync();
        var dealCount = await _db.Deals.CountAsync();
        var pipelineValue = await _db.Deals.Where(d => d.Stage != "Closed Lost").SumAsync(d => (double)d.Value);
        var openTasks = await _db.Tasks.CountAsync(t => t.Status != "Completed");

        var recentDeals = await _db.Deals
            .Include(d => d.Customer)
            .OrderByDescending(d => d.CreatedAt)
            .Take(5)
            .Select(d => $"{d.Title} ({d.Stage}, ${d.Value:N0}) - {d.Customer.FirstName} {d.Customer.LastName}")
            .ToListAsync();

        var systemPrompt = $"""
            You are an expert AI sales assistant for a CRM system. You have access to the following live CRM data:

            - Total Customers: {customerCount}
            - Total Deals: {dealCount}
            - Active Pipeline Value: ${pipelineValue:N2}
            - Open Tasks: {openTasks}
            - Recent Deals: {string.Join(", ", recentDeals)}

            Your role is to help sales teams with:
            - Analyzing sales performance and pipeline
            - Suggesting follow-up strategies for deals
            - Providing insights on customer relationships
            - Recommending sales tactics and best practices
            - Drafting emails or messages for customers
            - Identifying risks in the pipeline

            Be concise, actionable, and data-driven.
            """;

        var payload = new
        {
            model = "llama-3.3-70b-versatile",
            messages = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user", content = request.Message }
            },
            max_tokens = 1024
        };

        var client = _httpFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

        var json = JsonSerializer.Serialize(payload);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await client.PostAsync("https://api.groq.com/openai/v1/chat/completions", content);
        var body = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            return StatusCode((int)response.StatusCode, new { error = body });

        using var doc = JsonDocument.Parse(body);
        var reply = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString() ?? "No response";

        return Ok(new { reply });
    }
}

public record ChatRequest(string Message);
