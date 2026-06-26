namespace CRM.API.Models;

public class Deal
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal Value { get; set; }
    public string Stage { get; set; } = "Prospecting"; // Prospecting, Qualification, Proposal, Negotiation, Closed Won, Closed Lost
    public int Probability { get; set; } = 0;
    public DateTime? ExpectedCloseDate { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
}
