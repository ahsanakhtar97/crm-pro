namespace CRM.API.Models;

public class ActivityNote
{
    public int Id { get; set; }
    public string Type { get; set; } = "Note"; // Note, Call, Meeting, Email
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string UserId { get; set; } = string.Empty;
    public ApplicationUser User { get; set; } = null!;

    public int? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public int? DealId { get; set; }
    public Deal? Deal { get; set; }
}
